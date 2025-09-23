import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthData, authDataInit } from 'app/shared/interfaces/auth-data';
import { UserService } from 'app/shared/services/user/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  private userService: UserService = inject(UserService)

  authData: AuthData = authDataInit;
  msgResult: string = '';
  message: any = true;
  form!: FormGroup;
  hide = true;

  users = [{email: 'usuarioprueba1@gmail.com', password: '123456'},
    {email: 'usuarioprueba2@gmail.com', password: '123456'},
    {email: 'usuarioprueba3@gmail.com', password: '123456'}
  ];


async ngOnInit(){
  this.form = new FormGroup({
    email: new FormControl("", [Validators.minLength(8), Validators.email, Validators.required]),
    password: new FormControl("", [Validators.minLength(6), Validators.required]),
  });
}

  async onSubmit() {
    if(!this.form.valid){
      this.msgResult = 'Verifica los datos ingresados e intenta nuevamente';
      Swal.fire(
        '¡Error en el formulario!',
        this.msgResult,
        'error'
      )
      return;
    }
    this.authData = this.form.value;
    try {
      const loginResult = await this.userService.loginUser(this.authData);
      if (!loginResult.success){
        this.msgResult = loginResult.authError?.code!;
        Swal.fire(
          loginResult.authError?.code,
          loginResult.authError?.message,
          'error'
        )
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
        Swal.fire(
          'Error inesperado',
          'Un error inesperado ha ocurrido, intentalo nuevamente mas tarde o comunicate con el proveedor de servicios',
          'error'
        )
    }
  }

  loadUser(index: number) {
    const user = {
      email: this.users[index].email,
      password: this.users[index].password
    }
    this.form.patchValue(user);
  }
}
