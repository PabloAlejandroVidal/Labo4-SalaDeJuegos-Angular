import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, doc, docData, DocumentData, DocumentReference, Firestore, getDocs, query, runTransaction, Timestamp, Transaction, where } from '@angular/fire/firestore';
import { BehaviorSubject, filter, from, map, Observable } from 'rxjs';

export interface ScoreData {
  game: string;        //
  id: string;          // ID del juego
  registered: Timestamp; //
  score: number;       //
  user: string;        //
}

export interface AhorcadoStageResult {
  palabra: string,
  encontrada: boolean,
}

export enum gameNames{
  ahorcado = 'ahorcado',
  mayorMenor = 'mayor-menor',
  conectaCuatro = 'conecta-cuatro',
  preguntados = 'preguntados',
}
@Injectable({
  providedIn: 'root',
})
export class GameService {

  private firestore: Firestore = inject(Firestore);

  public COLLECTIONS = {
    USERS: 'users',
    SCORES: 'scores',
    CONECTACUATROSCORES: 'conecta-cuatro-scores',
  };

  constructor() { }

  observeScore(email: string, nombreJuego: gameNames): Observable<ScoreData> {
    const collectionRef = collection(this.firestore, this.COLLECTIONS.SCORES);
    const scoreOfUser = query(collectionRef, where('user', '==', email), where('game', '==', nombreJuego));

    return collectionData(scoreOfUser, { idField: 'id' }).pipe(
      filter((e)=>{
        return e.length !== 0;
      }),
      map((e)=>{
        return e[0] as ScoreData;
      })
    );
  }
  observeScores( nombreJuego: gameNames): Observable<any[]> {
    const collectionRef = collection(this.firestore, this.COLLECTIONS.SCORES);
    const scoreOfUser = query(collectionRef, where('game', '==', nombreJuego));

    return collectionData<any>(scoreOfUser, { idField: 'id' }).pipe(
      filter((e)=>{
        return e.length !== 0;
      })
    );
  }

  async updateScore(ref: DocumentReference<DocumentData>, newData: { score: number }): Promise<void> {
    try {
      await runTransaction(this.firestore, async (transaction: Transaction) => {
        const doc = await transaction.get(ref);
        const data = doc.data() as { score: number };

        // Solo actualizar si el nuevo puntaje es mayor
        if (data && data.score < newData.score) {
          transaction.update(ref, { ...data, ...newData });
        }
      });
    } catch (error) {
      console.error('Error al actualizar el puntaje:', error);
    }
  }

  async recordConectaCuatroScore(email: string, colorGanador: string): Promise<void> {
    try {
      const newScore = {
        user: email,
        colorGanador: colorGanador,
        registered: new Date(),
      };
      const collectionRef = collection(this.firestore, this.COLLECTIONS.CONECTACUATROSCORES);
      await addDoc(collectionRef, newScore);

    } catch (error) {
      console.error('Error al registrar el nuevo puntaje:', error);
    }
  }

  async getConectaCuatroStatsForAllUsers(): Promise<{ [user: string]: { total: number, rojo: number, amarillo: number } }> {
    try {
      const collectionRef = collection(this.firestore, this.COLLECTIONS.CONECTACUATROSCORES);
      const snapshot = await getDocs(collectionRef);

      // Inicializamos un mapa para almacenar las estadísticas
      const statsMap: { [user: string]: { total: number, rojo: number, amarillo: number } } = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        const user = data['user'];
        const colorGanador = data['colorGanador'];

        // Si el usuario no existe en el mapa, inicializar sus estadísticas
        if (!statsMap[user]) {
          statsMap[user] = { total: 0, rojo: 0, amarillo: 0 };
        }

        // Incrementar el total de juegos jugados por el usuario
        statsMap[user].total++;

        // Incrementar la cantidad de juegos ganados por el color correspondiente
        if (colorGanador === 'rojo') {
          statsMap[user].rojo++;
        } else if (colorGanador === 'amarillo') {
          statsMap[user].amarillo++;
        }
      });

      return statsMap;
    } catch (error) {
      console.error('Error al obtener las estadísticas:', error);
      throw error;
    }
  }

  async getAhorcadoStatsForAllUsers(): Promise<{ [email: string]: { total: number, ganadas: number, perdidas: number } }> {
    try {
      // Referencia a la colección de puntajes
      const collectionRef = collection(this.firestore, this.COLLECTIONS.SCORES);

      // Consulta todas las partidas del juego "ahorcado"
      const ahorcadoQuery = query(collectionRef, where('game', '==', gameNames.ahorcado));

      // Obtenemos los datos de la consulta
      const querySnapshot = await getDocs(ahorcadoQuery);

      // Mapa para almacenar las estadísticas de cada usuario
      const statsMap: { [email: string]: { total: number, ganadas: number, perdidas: number } } = {};

      // Iteramos sobre los documentos obtenidos
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const email = data['user'];

        // Si no existe una entrada para este usuario, creamos una
        if (!statsMap[email]) {
          statsMap[email] = { total: 0, ganadas: 0, perdidas: 0 };
        }

        // Actualizamos el conteo
        statsMap[email].total++;
        if (data['encontrado']) {
          statsMap[email].ganadas++;
        } else {
          statsMap[email].perdidas++;
        }
      });

      return statsMap;
    } catch (error) {
      console.error('Error al obtener las estadísticas del juego:', error);
      throw error;
    }
  }


  async recordAhorcadoScore(email: string, palabra: string, encontrado: boolean): Promise<void> {
    try {
      const newScore = {
        user: email,
        palabra: palabra,
        encontrado: encontrado,
        game: gameNames.ahorcado,
        registered: new Date(),
      };
      const collectionRef = collection(this.firestore, this.COLLECTIONS.SCORES);
      await addDoc(collectionRef, newScore);

    } catch (error) {
      console.error('Error al registrar el nuevo puntaje:', error);
    }
  }

  async recordNewScore(email: string, game: gameNames, score: number): Promise<void> {
    try {
      const newScore = {
        user: email,
        score: score,
        game: game,
        registered: new Date(),
      };
      const collectionRef = collection(this.firestore, this.COLLECTIONS.SCORES);
      const scoreQuery = query(collectionRef, where('user', '==', email), where('game', '==', game));

      const querySnapshot = await getDocs(scoreQuery);

      // Verifica si el usuario ya tiene un puntaje registrado para este juego
      if (!querySnapshot.empty) {
        const existingScoreRef = querySnapshot.docs[0].ref;
        await this.updateScore(existingScoreRef, newScore);
      } else {
        // Si no hay puntaje previo, crea un nuevo documento
        await addDoc(collectionRef, newScore);
      }
    } catch (error) {
      console.error('Error al registrar el nuevo puntaje:', error);
    }
  }
}
