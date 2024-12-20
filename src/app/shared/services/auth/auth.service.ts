import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, authInstance$, user, User, UserCredential, AuthError } from '@angular/fire/auth';
import { map, Observable } from 'rxjs';


export interface AuthResult {
  success: boolean;
  authError: {
    code: string,
    message: string,
  } | null,
  user: User | null;
}

export const AuthResultInit: AuthResult = {
  user: null,
  success: true,
  authError: null,
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public auth: Auth = inject(Auth);
  public user$: Observable<User | null> = user(this.auth);

  async register(email: string, password: string): Promise<AuthResult> {
    const authResult: AuthResult = AuthResultInit;

    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      authResult.success = true,
      authResult.user = userCredential.user;
      return authResult;

    } catch (error: any) {
      authResult.success = false;
      switch (error.code) {
        case 'auth/invalid-credential':
        authResult.authError = {
          code: 'Credencial inválida',
          message: 'Verifica los datos ingresados e intenta nuevamente.'
        }
        break;
        case 'auth/too-many-requests':
        authResult.authError = {
          code: 'Demasiadas peticiones',
          message: 'Has intentado acceder demasiadas veces.'
        }
        break;
        case 'auth/user-not-found':
        authResult.authError = {
          code: 'Usuario no encontrado',
          message: 'El usuario no ha podido ser encontrado.'
        }
        break;
        case 'auth/wrong-password':
        authResult.authError = {
          code: 'Contraseña incorrecta',
          message: 'La contraseña es incorrecta. Por favor, intenta nuevamente.'
        }
        break;
        case 'auth/email-already-in-use':
        authResult.authError = {
          code: 'Correo Electrónico no válido',
          message: 'El correo electrónico ingresado ya se encuentra en uso.'
        }
        break;
        case 'auth/invalid-email':
        authResult.authError = {
          code: 'Correo Electrónico no válido',
          message: 'El correo electrónico ingresado no es válido.'
        }
        break;
        case 'auth/user-disabled':
        authResult.authError = {
          code: 'Cuenta deshabilitada',
          message: 'La cuenta no se encuentra habilitada.'
        }
        break;
        default:
        authResult.authError = {
          code: 'Error inesperado',
          message: 'Ocurrió un error inesperado al intentar registrar usuario.'
        }
        break;
      }
      return authResult;
    }
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const authResult: AuthResult = AuthResultInit;

    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(this.auth, email, password);
      authResult.success = true,
      authResult.user = userCredential.user;
      return authResult;

    } catch (error: any) {
      console.log(error)
      authResult.success = false;
      switch (error.code) {
        case 'auth/invalid-credential':
          authResult.authError = {
            code: 'Credencial inválida',
            message: 'Verifica los datos ingresados e intenta nuevamente.'
          }
          break;
        case 'auth/too-many-requests':
          authResult.authError = {
            code: 'Demasiadas peticiones',
            message: 'Has intentado acceder demasiadas veces.'
          }
          break;
        case 'auth/user-not-found':
          authResult.authError = {
            code: 'Usuario no encontrado',
            message: 'El usuario no ha podido ser encontrado.'
          }
          break;
        case 'auth/wrong-password':
          authResult.authError = {
            code: 'Contraseña incorrecta',
            message: 'La contraseña es incorrecta. Por favor, intenta nuevamente.'
          }
          break;
        case 'auth/invalid-email':
          authResult.authError = {
            code: 'Correo electrónico no válido',
            message: 'El correo electrónico ya está en uso o no es válido.'
          }
          break;
        case 'auth/user-disabled':
          authResult.authError = {
            code: 'Cuenta deshabilitada',
            message: 'La cuenta no se encuentra habilitada.'
          }
          break;
        default:
        authResult.authError = {
          code: 'Error inesperado',
          message: 'Ocurrió un error inesperado al intentar iniciar sesión.'
        }
        break;
      }
      return authResult;
    }
  }

  isLoguedUser() {
    return (this.auth.currentUser?.email)? true : false;
  }

  async logout(): Promise<AuthResult> {
    const authResult: AuthResult = AuthResultInit;

    try {
      if (!this.isLoguedUser()){
        authResult.success = false
        authResult.authError = {
          code: 'Error al cerrar sesión',
          message: 'No hay sesión abierta para cerrar'
        }
        return authResult;
      }

      await signOut(this.auth);
      authResult.success = true;
      authResult.user = this.auth.currentUser;
      return authResult;
    }
    catch (error: any){
      authResult.success = false;
      authResult.authError = {
        code: 'Error inesperado',
        message: error.message,
      }
      return authResult;
    }
  }

  observeCurrentUser(): Observable<any> {
    return user(this.auth);
  }

}
