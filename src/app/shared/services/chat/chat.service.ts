import { Injectable, inject } from '@angular/core';
import { DocumentData, Firestore, Timestamp, addDoc, collection, collectionChanges, collectionData, doc, docData, getDoc, getDocs, limit, onSnapshot, orderBy, query, where } from '@angular/fire/firestore';
import { Observable, combineLatest, from, map, reduce, scan, startWith } from 'rxjs';
import { globalMessage } from './interfaces/globalMessage';
import { UserData } from '../../interfaces/user-data';

@Injectable({
  providedIn: 'root'
})

export class ChatService {

  private firestore: Firestore = inject(Firestore);


  public COLLECTIONS = {
    USERS: 'users',
    CHATS: 'chats',
    GLOBAL_MESSAGES: 'globalMessages'
  };

  observeDocument(collection: string, id: string): Observable<DocumentData | undefined> {
    const docRef = doc(this.firestore, `${collection}/${id}`);
    return docData(docRef, { idField: 'id' });
  }

  private observeChatsDocument(userId: string): Observable<[DocumentData[], DocumentData[]]> {
    const chatsCollection = collection(this.firestore, this.COLLECTIONS.CHATS);
    const chatsByUserRef1 = query(chatsCollection, where('userRef1', '==', userId));
    const chatsByUserRef2 = query(chatsCollection, where('userRef2', '==', userId));

    const chatsByUserRef1$ = collectionData(chatsByUserRef1, { idField: 'id' });
    const chatsByUserRef2$ = collectionData(chatsByUserRef2, { idField: 'id' });

    return combineLatest([chatsByUserRef1$, chatsByUserRef2$]);
  }

  public observeChatsList(userId: string): Observable<any[]> {
    return this.observeChatsDocument(userId)
    .pipe(
      map(([chats1, chats2]) => {
        const combinedResults = [...chats1, ...chats2];
        const uniqueResults = new Map();
        combinedResults.forEach(chat => {
          uniqueResults.set(chat['id'], chat);
        });
        return Array.from(uniqueResults.values());
      })
    )
  }

  observeMessages(chatId: string): Observable<any[]> {
    const collecion = collection(this.firestore, this.COLLECTIONS.CHATS, chatId, 'messages');
    const filteredGlobalMessages = query(collecion, orderBy('sent'), limit(50));
    return collectionData(filteredGlobalMessages).pipe(
      map(messages =>
        messages.map((message: any) => ({
          text: message.text,
          from: message.from,
          sent: (message.sent as Timestamp).toDate()
        }))
      )
    );
  }

  observeGlobalMessages(): Observable<globalMessage[]> {
    const globalMessagesCollection = collection(this.firestore, this.COLLECTIONS.GLOBAL_MESSAGES);
    const filteredGlobalMessages = query(globalMessagesCollection, orderBy('sent'), limit(50));
    return collectionData(filteredGlobalMessages).pipe(
      map(messages =>
        messages.map((message: any) => ({
          text: message.text,
          from: message.from,
          sent: (message.sent as Timestamp).toDate()
        }))
      )
    );
  }

  async sendGlobalMessage(user: string, text: string) {
    const message = {
      text,
      from: user,
      sent: new Date(),
    };
    const globalMessagesCollection = collection(this.firestore, this.COLLECTIONS.GLOBAL_MESSAGES);
    await addDoc(globalMessagesCollection, message);
  }
}
