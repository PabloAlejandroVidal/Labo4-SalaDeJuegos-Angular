import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { ChatService } from '../../shared/services/chat/chat.service';
import { FirestoreService } from '../../shared/services/firestore/firestore.service';
import { AuthService } from '../../shared/services/auth/auth.service';
import { Subscription } from 'rxjs';
import { UserData } from '../../shared/interfaces/user-data';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  private subscriptions: Subscription[] = [];
  private usersOnline: UserData[] = [];
  private selectedUser: UserData | null = null;

  public textToSend: string = '';
  public messages: any[] = [];
  public currentUser: string | null = null;
  public chats: any = {};
  public personalChat: any[] = [];

  // 👇 NUEVO
  public isLoading = true;
  public isSending = false;

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    const suscription = this.authService.user$.subscribe((user) => {
      this.currentUser = user?.email || null;
      if (this.currentUser) {
        this.iniciarChat();
      } else {
        this.isLoading = false;
      }
    });
    this.subscriptions.push(suscription);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop =
        this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  iniciarChat() {
    this.firestoreService.getUsersOnline().subscribe((userData) => {
      this.usersOnline = [];
      userData.forEach((user) => {
        if (this.currentUser && this.currentUser !== user.email) {
          this.usersOnline.push(user);
        }
      });
    });

    let firstEmission = true;
    const subscription = this.chatService
      .observeGlobalMessages()
      .subscribe((messages) => {
        this.messages = messages.map((msg) => ({
          ...msg,
          sent: msg.sent.toLocaleString(),
        }));

        if (firstEmission) {
          this.isLoading = false;
          firstEmission = false;
        }
      });

    this.subscriptions.push(subscription);

    if (this.currentUser) {
      const sub2 = this.chatService
        .observeChatsList(this.currentUser)
        .subscribe(() => {});
      this.subscriptions.push(sub2);
    }
  }

  sendMessage() {
    if (!this.currentUser || !this.textToSend.trim() || this.isSending) {
      return;
    }

    this.isSending = true;
    const text = this.textToSend.trim();

    // Si sendGlobalMessage devuelve Promise:
    const result = this.chatService.sendGlobalMessage(this.currentUser, text);

    // Soportamos Promise o void/Observable básico
    if (result && typeof (result as any).then === 'function') {
      (result as Promise<any>).finally(() => {
        this.isSending = false;
        this.textToSend = '';
      });
    } else {
      this.isSending = false;
      this.textToSend = '';
    }
  }

  selectUser() {
    const userId = this.selectedUser?.id;
    if (userId) {
      this.chatService.observeMessages(userId).subscribe(() => {});
    }
  }

  trackMessages(index: number, message: any): string {
    return message.id || index;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
