import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user/user.service';
import { firstValueFrom } from 'rxjs';

export const noLoguedGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const userService = inject(UserService)

  const isLogued = await firstValueFrom(userService.observeCurrentUser())

  if(!isLogued){
    return true;
  }else{
    router.navigate(['home']);
    return false;
  }
};
