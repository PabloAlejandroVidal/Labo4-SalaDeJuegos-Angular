import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, doc, updateDoc, Firestore, getDocs, query, where, DocumentReference, DocumentData, getDoc, docData } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConectaCuatroService {

  private firestore: Firestore = inject(Firestore);

  public COLLECTIONS = {
    GAMES: 'games',
  };

  // Almacena el estado del juego actual
  private currentGameSubject = new BehaviorSubject<DocumentData | null>(null);
  public currentGame$: Observable<DocumentData | null> = this.currentGameSubject.asObservable();

  constructor() { }

  // Unirse a una partida existente
  async joinGame(user: string): Promise<void> {
    const gameCollectionRef = collection(this.firestore, this.COLLECTIONS.GAMES);
    const freeGameQuery = query(gameCollectionRef, where('user2', '==', null));
    const querySnapshot = await getDocs(freeGameQuery);

    if (querySnapshot.docs.length) {
      const docRef = querySnapshot.docs[0].ref;

      // Agregar el jugador 2
      await updateDoc(docRef, { user2: user });
      const gameDoc = await getDoc(docRef);
      const game = gameDoc.data();
      if(game) {
        this.currentGameSubject.next(game);
      }else{
        console.log("error")
      }
    } else {
      // Si no hay juegos disponibles, se puede crear uno nuevo
      await this.prepareNewGame(user);
    }
  }

  // Crear una nueva partida
  async prepareNewGame(user: string): Promise<DocumentReference<DocumentData>> {
    const newGame = {
      user1: user,
      user2: null,
      board: Array(6).fill(Array(7).fill(null)), // Tablero 6x7 vacío
      currentPlayer: 'user1',
      winner: null,
      created: new Date(),
    };
    const gamesCollection = collection(this.firestore, this.COLLECTIONS.GAMES);
    const gameRef = await addDoc(gamesCollection, newGame);

    // Actualiza el estado del juego
    this.currentGameSubject.next(newGame);

    return gameRef;
  }

  // Monitorear cambios en una partida en curso
  getGameUpdates(gameId: string): Observable<DocumentData | null> {
    const gameDocRef = doc(this.firestore, `${this.COLLECTIONS.GAMES}/${gameId}`);
    return docData(gameDocRef).pipe(
      map((data) => data ? data : null)
    );
  }

  // Actualizar el tablero
  async updateBoard(gameId: string, board: any[][], currentPlayer: string): Promise<void> {
    const gameDocRef = doc(this.firestore, `${this.COLLECTIONS.GAMES}/${gameId}`);
    await updateDoc(gameDocRef, { board, currentPlayer });
  }

  // Declarar un ganador
  async declareWinner(gameId: string, winner: string): Promise<void> {
    const gameDocRef = doc(this.firestore, `${this.COLLECTIONS.GAMES}/${gameId}`);
    await updateDoc(gameDocRef, { winner });
  }

  // Obtener partidas activas
  getActiveGames(): Observable<DocumentData[]> {
    const gameCollectionRef = collection(this.firestore, this.COLLECTIONS.GAMES);
    const activeGamesQuery = query(gameCollectionRef, where('winner', '==', null));

    return collectionData(activeGamesQuery, { idField: 'id' });
  }
}
