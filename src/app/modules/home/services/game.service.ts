import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  getDocs,
  query,
  runTransaction,
  where,
  DocumentReference,
  DocumentData,
  Firestore,
  Timestamp,
  Transaction,
  orderBy,
  limit,
} from '@angular/fire/firestore';
import { filter, map, Observable } from 'rxjs';

export interface ScoreData {
  game: string;          // nombre del juego (enum gameNames)
  id: string;            // ID del doc en Firestore
  registered: Timestamp; // última vez que se registró/mejoró el score
  score: number;         // mejor puntaje del usuario en ese juego
  user: string;          // email del usuario
}

export interface AhorcadoStageResult {
  palabra: string;
  encontrada: boolean;
}

export enum gameNames {
  ahorcado = 'ahorcado',
  mayorMenor = 'mayor-menor',
  conectaCuatro = 'conecta-cuatro', // lo podés dejar o borrar si ya no lo usás
  preguntados = 'preguntados',
  fruitCatcher = 'fruit-catcher',
}

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private firestore: Firestore = inject(Firestore);

  readonly COLLECTIONS = {
    SCORES: 'scores',
  };

  constructor() {}

  // --- Helpers internos ---

  private get scoresCollection() {
    return collection(this.firestore, this.COLLECTIONS.SCORES);
  }

  // =========================
  // OBSERVABLES DE SCORES
  // =========================

  /**
   * Observa el score de un usuario en un juego.
   * Ideal para mostrar "tu mejor puntaje".
   */
  observeScore(email: string, nombreJuego: gameNames): Observable<ScoreData> {
    const scoreOfUser = query(
      this.scoresCollection,
      where('user', '==', email),
      where('game', '==', nombreJuego)
    );

    return collectionData(scoreOfUser, { idField: 'id' }).pipe(
      filter((docs) => docs.length !== 0),
      map((docs) => docs[0] as ScoreData)
    );
  }

  /**
   * Observa todos los scores de un juego, ordenados por score desc.
   * Ideal para una tabla de ranking completa.
   */
  observeScores(nombreJuego: gameNames): Observable<ScoreData[]> {
    const scoresQuery = query(
      this.scoresCollection,
      where('game', '==', nombreJuego),
      orderBy('score', 'desc')
    );

    return collectionData(scoresQuery, { idField: 'id' }).pipe(
      map((docs) => docs as ScoreData[])
    );
  }

  /**
   * Ranking Top N de un juego.
   */
  observeTopScores(
    nombreJuego: gameNames,
    topN: number = 10
  ): Observable<ScoreData[]> {
    const scoresQuery = query(
      this.scoresCollection,
      where('game', '==', nombreJuego),
      orderBy('score', 'desc'),
      limit(topN)
    );

    return collectionData(scoresQuery, { idField: 'id' }).pipe(
      map((docs) => docs as ScoreData[])
    );
  }

  // =========================
  // ESCRITURA DE SCORES GENERALES
  // =========================

  /**
   * Actualiza el puntaje solo si el nuevo score es mejor (más alto).
   */
  private async updateScoreIfBetter(
    ref: DocumentReference<DocumentData>,
    newData: { score: number; registered?: Timestamp }
  ): Promise<void> {
    try {
      await runTransaction(this.firestore, async (transaction: Transaction) => {
        const snap = await transaction.get(ref);
        const data = snap.data() as { score: number } | undefined;

        // Si no hay data o el score nuevo es mejor, se actualiza
        if (!data || data.score < newData.score) {
          transaction.update(ref, {
            ...data,
            ...newData,
          });
        }
      });
    } catch (error) {
      console.error('Error al actualizar el puntaje:', error);
    }
  }

  /**
   * Registra un nuevo puntaje numérico para un juego.
   * Mantiene un solo doc por (user + game) con el mejor score.
   */
  async recordNewScore(
    email: string,
    game: gameNames,
    score: number
  ): Promise<void> {
    try {
      const newScore = {
        user: email,
        score,
        game,
        registered: Timestamp.now(),
      };

      const scoreQuery = query(
        this.scoresCollection,
        where('user', '==', email),
        where('game', '==', game)
      );

      const querySnapshot = await getDocs(scoreQuery);

      if (!querySnapshot.empty) {
        // Ya tiene un doc para este juego → actualizamos si es mejor
        const existingScoreRef = querySnapshot.docs[0].ref;
        await this.updateScoreIfBetter(existingScoreRef, newScore);
      } else {
        // No hay score previo → creamos un nuevo doc
        await addDoc(this.scoresCollection, newScore);
      }
    } catch (error) {
      console.error('Error al registrar el nuevo puntaje:', error);
    }
  }

  // =========================
  // HELPERS POR JUEGO (AZÚCAR SINTÁCTICO)
  // =========================

  recordFruitCatcherScore(email: string, score: number): Promise<void> {
    return this.recordNewScore(email, gameNames.fruitCatcher, score);
  }

  recordMayorMenorScore(email: string, score: number): Promise<void> {
    return this.recordNewScore(email, gameNames.mayorMenor, score);
  }

  recordPreguntadosScore(email: string, score: number): Promise<void> {
    return this.recordNewScore(email, gameNames.preguntados, score);
  }

  // =========================
  // AHORCADO: ESTADÍSTICAS WIN/LOSE
  // =========================

  /**
   * Guarda el resultado de una partida de Ahorcado.
   * Acá sí tiene sentido guardar cada partida (palabra + encontrada).
   */
  async recordAhorcadoScore(
    email: string,
    palabra: string,
    encontrado: boolean
  ): Promise<void> {
    try {
      const newScore = {
        user: email,
        palabra,
        encontrado,
        game: gameNames.ahorcado,
        registered: Timestamp.now(),
      };
      await addDoc(this.scoresCollection, newScore);
    } catch (error) {
      console.error('Error al registrar el nuevo puntaje de ahorcado:', error);
    }
  }

  /**
   * Devuelve estadísticas agregadas de Ahorcado por usuario:
   * total, ganadas, perdidas.
   */
  async getAhorcadoStatsForAllUsers(): Promise<{
    [email: string]: { total: number; ganadas: number; perdidas: number };
  }> {
    try {
      const ahorcadoQuery = query(
        this.scoresCollection,
        where('game', '==', gameNames.ahorcado)
      );

      const querySnapshot = await getDocs(ahorcadoQuery);

      const statsMap: {
        [email: string]: { total: number; ganadas: number; perdidas: number };
      } = {};

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as {
          user: string;
          encontrado?: boolean;
        };

        const email = data.user;

        if (!statsMap[email]) {
          statsMap[email] = { total: 0, ganadas: 0, perdidas: 0 };
        }

        statsMap[email].total++;

        if (data.encontrado) {
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
}
