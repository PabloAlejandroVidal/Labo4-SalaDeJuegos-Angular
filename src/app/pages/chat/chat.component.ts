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

  ngAfterViewChecked() {
    this.scrollToBottom();
  }
  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  private subscriptions: Subscription[] = [];
  private usersOnline: UserData[] = [];
  private selectedUser: UserData | null = null;
  public textToSend: string = '';
  public messages: any[] = [];
  public currentUser: string | null = null;
  public chats: any = {};
  public personalChat: any[] = [];

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private chatService: ChatService
  ) { }

  ngOnInit(){

    const suscription = this.authService.user$.subscribe((user)=>{
      this.currentUser = user?.email || null;
      if(this.currentUser){
        this.iniciarChat();
      }
    });
    this.subscriptions.push(suscription);
  }

  iniciarChat() {

    this.firestoreService.getUsersOnline().subscribe((userData)=>{
      this.usersOnline = [];
      userData.forEach((user)=>{
        if(this.currentUser && this.currentUser != user.email){
          this.usersOnline.push(user);
        }
      })
    });

    const subscription = this.chatService.observeGlobalMessages().subscribe((messages)=>{
      this.messages = [];
      messages.map((msg)=>{
        this.messages.push(
          {
            ...msg,
            sent: msg.sent.toLocaleString(),
          }
        );
      })
    });
    this.subscriptions.push(subscription);

    if(this.currentUser){
      const subscription = this.chatService.observeChatsList(this.currentUser).subscribe((data)=>{
      });
      this.subscriptions.push(subscription);
    }
  }

  sendMessage(){
    if (this.currentUser && this.textToSend.length > 0){
      this.chatService.sendGlobalMessage(this.currentUser, this.textToSend);
      this.textToSend = '';
    }
  }

  selectUser(){
    const userId = this.selectedUser?.id;
    if(userId){
      this.chatService.observeMessages(userId).subscribe((chatMessages)=>{
      })
    }
  }

  trackMessages(index: number, message: any): string {
    return message.id || index;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
