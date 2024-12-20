import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators, } from '@angular/forms';
import { Router } from '@angular/router';
import { authDataInit } from 'app/shared/interfaces/auth-data';
import { AuthResult, AuthResultInit, AuthService } from 'app/shared/services/auth/auth.service';
import { UserService } from 'app/shared/services/user/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  authData = authDataInit;
  msgResult = '';
  form!: FormGroup;

  private router = inject(Router);
  private userService = inject(UserService)

  async ngOnInit(){
    this.form = new FormGroup({
      email: new FormControl("", [Validators.minLength(8), Validators.email, Validators.required]),
      password: new FormControl("", [Validators.minLength(6), Validators.required]),
    });
  }

  async onSubmit() {
    if(!this.form.valid){
      this.msgResult = 'Error al registrar usuario';
      Swal.fire(
        '¡Error en el formulario!',
        'Verifica los datos ingresados e intenta nuevamente.',
        'error'
      )
      return;
    }
    this.authData = this.form.value;
    try{
      const registerResult = await this.userService.registerUser(this.authData);
      if (!registerResult.success){
        Swal.fire(
          registerResult.authError?.code,
          registerResult.authError?.message,
          'error'
        )
        this.msgResult = registerResult.authError?.code!;
        return;
      }
      this.msgResult = 'El usuario se ha registrado exitosamente';
      Swal.fire(
        "Usuario registrado exitosamente",
        this.msgResult,
        'success'
      )

      const loginResult = await this.userService.loginUser(this.authData);

      if (!loginResult.success){
        this.msgResult = loginResult.authError?.code!;
        Swal.fire(
          loginResult.authError?.code,
          loginResult.authError?.message,
          'error'
        )
        this.msgResult = loginResult.authError?.code!;
        return;
      }
      this.msgResult = 'El usuario ha iniciado sesión exitosamente';
      Swal.fire(
        "Inicio de sesión exitoso",
        this.msgResult,
        'success'
      )
    }
    catch (error: any) {
      this.msgResult = 'Error inesperado';
      Swal.fire(
        this.msgResult,
        'Un error inesperado ha ocurrido, intentalo nuevamente mas tarde o comunicate con el proveedor de servicios',
        'error'
      )
    }
  }
}

