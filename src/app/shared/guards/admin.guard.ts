import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user/user.service';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

export const adminGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const userService = inject(UserService)

  const expectedRole = route.data['expectedRole'];  // Accede al rol desde los datos de la ruta
  const redirectUrl = route.data['redirectTo'];  // Accede a la URL de redirección desde los datos de la ruta

  const hasRole = await userService.userHasRole(expectedRole);

  if(hasRole){
    return true;
  }else{
    Swal.fire('Acceso denegado', 'No tienes permisos para acceder a esta sección', 'warning');
    router.navigate([redirectUrl]);
    return false;
  }
};
