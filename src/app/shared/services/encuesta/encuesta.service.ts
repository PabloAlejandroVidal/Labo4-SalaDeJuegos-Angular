import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, CollectionReference, Firestore, limit, orderBy, query, Timestamp } from '@angular/fire/firestore';
import { Encuesta } from 'app/shared/interfaces/encuesta';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EncuestaService {
  private firestore: Firestore = inject(Firestore);
  private surveysCollection: CollectionReference<Encuesta>;

  constructor() {
    // Referencia a la colección "surveys" en Firestore
    this.surveysCollection = collection(this.firestore, 'surveys') as CollectionReference<Encuesta>;
  }


  // Método para guardar una nueva encuesta
  async guardarEncuesta(survey: Encuesta): Promise<void> {
    survey.createdAt = new Date();
    return addDoc(this.surveysCollection, survey).then(() => {
      console.log('Encuesta guardada correctamente');
    }).catch((error) => {
      console.error('Error al guardar la encuesta:', error);
      throw error;
    });
  }

  // Método para obtener todas las encuestas
  getEncuesta(limitResults: number = 10): Observable<Encuesta[]> {
    const q = query(this.surveysCollection, orderBy('createdAt', 'desc'), limit(limitResults));
    return collectionData(q, { idField: 'id' }) as Observable<Encuesta[]>;
  }
}
