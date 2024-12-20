import { Injectable, inject } from '@angular/core';
import { AuthResult, AuthResultInit, AuthService } from '../auth/auth.service';
import { FirestoreService } from '../firestore/firestore.service';
import { AuthData } from '../../interfaces/auth-data';
import { User } from 'firebase/auth';
import { filter, map, Observable } from 'rxjs';
import { ActivatedRoute, IsActiveMatchOptions, Router } from '@angular/router';



@Injectable({
  providedIn: 'root'
})
export class UserService {

  router: Router = inject(Router);
  currentUser: string | null = null;
  firstLoad: boolean = true;

  constructor(
    private authService: AuthService,
    private firestoreService: FirestoreService
  ) {
    this.observeCurrentUser().subscribe((user)=>{
      this.currentUser = user?.email || null;
    })
  }

  async userHasRole(role: string): Promise<boolean>{
    if(!this.currentUser){
      return false;
    }
    const user = await this.firestoreService.getUser(this.currentUser)
    if (!user) {
      return false;
    }
    const data = user.data();
    if (data['role'] === role){
      return true;
    }else{
      return false;
    }
  }

  async registerUser(authData: AuthData): Promise<AuthResult> {
    const authResult: AuthResult = AuthResultInit;
    try{
      const userExists = await this.firestoreService.userExists(authData.email);
      if (userExists) {
        authResult.success = false;
        authResult.authError = {
          code: 'Usuario en uso',
          message: 'El usuario ya se encuentra registrado.',
        }
        return authResult;
      }
      await this.firestoreService.registerUser(authData.email);
      return await this.authService.register(authData.email, authData.password);
    }catch (error: any){
        authResult.success = false,
        authResult.authError = {
          code: 'Error inesperado',
          message: error.message,
        }
        return authResult;
    }
  }

  async loginUser(authData: AuthData): Promise<AuthResult> {
    const authResult: AuthResult = AuthResultInit;
    try {
      const userExists = await this.firestoreService.userExists(authData.email);

      if (!userExists) {
        authResult.success = false;
        authResult.authError = {
          code: 'Usuario no encontrado',
          message: 'No se pudo encontrar el usuario.',
        }
      }
      console.log(authData.email);
      console.log(authData.password);
      const authResultFromLogin = await this.authService.login(authData.email, authData.password);
      if (authResultFromLogin.success) {
        await this.firestoreService.registerLogin(authData.email);
        await this.firestoreService.updateUserStatus(authData.email, true);
        this.router.navigateByUrl('home');
      }
      return authResultFromLogin;
    } catch (error: any) {
      authResult.success = false;
      authResult.authError = {
        code: 'Error inesperado',
        message: error.message,
      }
      return authResult;
    }
  }

  async logOutUser(): Promise<AuthResult> {
    const authResult: AuthResult = AuthResultInit;
    try {
      const user = this.currentUser;
      const logOutResult = await this.authService.logout();
      if (user && logOutResult.success) {
        this.router.navigateByUrl('auth');
        this.firestoreService.updateUserStatus(user, false);
      }
      return logOutResult;
    }
    catch (error: any) {
      authResult.authError = {
        code: 'Error inesperado',
        message: error.message,
      }
      this.router.navigateByUrl('auth');
      return authResult;
    }
  }


  observeCurrentUser(): Observable<User | null> {
    return this.authService.user$;
  }

  getNumberOfLogins(email: string): Observable<any> {
    return this.firestoreService.getNumberOfLogins(email);
  }

  observeLastestLogin(email: string) {
    return this.firestoreService.observeLatestLogin(email);
  }

}
