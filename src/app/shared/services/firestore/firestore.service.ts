import { Injectable, inject } from '@angular/core';
import { LoginData, loginDataInit } from '../../interfaces/login-data';
import { CollectionReference, addDoc, collection, collectionData, getDoc, getDocs, onSnapshot, query, runTransaction, where, updateDoc, QuerySnapshot, DocumentReference, QueryDocumentSnapshot, limit } from '@angular/fire/firestore';
import { DocumentData, Firestore, doc} from '@angular/fire/firestore';
import { UserData, userDataInit } from '../../interfaces/user-data';
import { EMPTY, filter, from, map, Observable, of, pipe, reduce, switchMap } from 'rxjs';
import { DocumentSnapshot, orderBy } from 'firebase/firestore';
import { Timestamp } from '@angular/fire/firestore';


export interface Login {
  loginDate: Timestamp,
  user: string
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  private firestore: Firestore = inject(Firestore);


  private usersCollection = collection(this.firestore, 'users');
  private onlineUsersQuery = query(this.usersCollection, where('isOnline', '==', true));

  private getUserByEmailQuery = (email: string)=>{return query(this.usersCollection, where('email', '==', email));}
  private getLoginsCollectionByUserDocRef = (userDocRef: DocumentReference)=>{return collection(userDocRef, 'logins')}

  async getUserDocs(email: string) {
    const usuariosConEmailIngresado = query(this.usersCollection, where('email', '==', email));
    return await getDocs(usuariosConEmailIngresado);
  }

  async userExists(email: string): Promise<boolean> {
    try{
      const docs = await this.getUserDocs(email);
      return !docs.empty;
    }
    catch (error: any){
      console.error(error);
      throw Error("No se pudo comprobar la existencia del usuario");
    }
  }

  getUsersOnline(): Observable<UserData[]> {
    return collectionData(this.onlineUsersQuery, { idField: 'id' }) as Observable<UserData[]>;
  }

  async getUser(email: string){
    const userByEmailQuery = this.getUserByEmailQuery(email);
    const querySnapShot = await getDocs(userByEmailQuery);

    if (querySnapShot.size > 0) {
      return querySnapShot.docs[0];
    }
    return null;
  }

  async updateUserStatus(email: string, status: boolean) {
    if(!email){
      return;
    }
    const queryDocumentSnapshot = await this.getUser(email);
    if (queryDocumentSnapshot?.ref != null){
      const userRef = queryDocumentSnapshot.ref;

      await runTransaction(this.firestore, async (transaction) => {
        // Ejecuta una transacción
        const userDoc = await transaction.get(userRef);

        // Obtiene el documento dentro de la transacción
        const userData = userDoc.data();
        // Obtiene los datos del documento
        if(userData){

          const LastAccess = Timestamp.fromDate(new Date());
          userData['lastAccess'] = LastAccess;
          userData['isOnline'] = status;

          if(userData && userData['firstAccess'] == null){
            userData['firstAccess'] = LastAccess;
          }

          transaction.update(userRef, userData); // Actualiza el documento con los nuevos datos
        }

      });
    }
  }

  async registerUser(email: string) {

    const userData: UserData = userDataInit;
    userData.email = email;
    userData.registrationDate = new Date();
    await addDoc(this.usersCollection, userData);
  }

  async registerLogin(email: string) {

    const loginData: LoginData = loginDataInit;
    loginData.loginDate = new Date();
    loginData.user = email;

    await getDocs(this.getUserByEmailQuery(email)).then((querySnapShot)=>{

      querySnapShot.forEach((documentSnapshot)=>{
        const userDocRef = doc(this.firestore, `users/${documentSnapshot.id}`);
        const loginsCollectionRef = this.getLoginsCollectionByUserDocRef(userDocRef);
        addDoc(loginsCollectionRef, loginData).then((r)=>{
        }).catch((e)=>{
        })
      })
    })
  }

// Función que obtiene la referencia de los logins del usuario por email
observeLoginsRef(email: string): Observable<CollectionReference<DocumentData, DocumentData> | null> {
  return from(getDocs(this.getUserByEmailQuery(email))).pipe(
    map((querySnapshot) => {
      if (querySnapshot.empty){
        return null;
      }
      const userDoc = querySnapshot.docs[0];
      return this.getLoginsCollectionByUserDocRef(userDoc.ref);
    })
  );
}

// Obtener los logins recientes como un Observable
observeRecentLogins(email: string, date: Date): Observable<any> {
  return this.observeLoginsRef(email).pipe(
    map((loginsRef) => {
      return loginsRef ? query(loginsRef, where('loginDate', '>=', date)) : null;
    })
  );
}

// Obtener el último login como un Observable
observeLatestLogin(email: string): Observable<Login | null> {
  return this.observeLoginsRef(email).pipe(
    switchMap((loginsRef) => {
      if (!loginsRef){
        return of(null)
      }
      const latestLoginsQuery = query(loginsRef, orderBy('loginDate', 'desc'), limit(1));
      return from(getDocs(latestLoginsQuery)).pipe(
        map((querySnap)=> !querySnap.empty ? querySnap.docs[0].data() as Login : null)
      );
    })
  );
}


  getLogins(email: string): Observable<any[]> {
    // Convertir la obtención del usuario a un flujo observable
    return from(getDocs(this.getUserByEmailQuery(email))).pipe(
      switchMap(querySnapshot => {
        if (!querySnapshot.empty) {
          const userDocRef = querySnapshot.docs[0].ref; // Obtener referencia del documento del usuario
          const loginsCollectionRef = this.getLoginsCollectionByUserDocRef(userDocRef);

          // Crear un observable a partir de la colección de logins
          return new Observable<any[]>((observer) => {
            const allLoginsQuery = query(loginsCollectionRef);

            // Escuchar cambios en la colección de logins
            const unsubscribe = onSnapshot(allLoginsQuery, (querySnapshot) => {
              const logins = querySnapshot.docs.map(doc => doc.data()); // Obtener los datos de los logins
              observer.next(logins); // Emitir los logins
            });

            return () => unsubscribe(); // Devolver la función de limpieza para detener la escucha
          });
        } else {
          // Si no hay usuarios encontrados, devolver un observable vacío o con una lista vacía
          return of([]);
        }
      })
    );
  }

  getNumberOfLogins(email: string): Observable<number> {
    return this.getLogins(email).pipe(map((docs)=>{return docs.length}))
  }
}
