import { CommonModule } from '@angular/common';
import { Component, inject, ViewEncapsulation } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  private router: Router = inject(Router);

  goLogin = () => this.router.navigate(['/auth/login']);
  goRegister = () => this.router.navigate(['/auth/register']);

  isLoginRouteActive(): boolean {
    return this.router.isActive('auth/login', {
      matrixParams: "exact",
      queryParams: "exact",
      paths: "exact",
      fragment: 'exact'

    });
  }
  isRegisterRouteActive(): boolean {
    return this.router.isActive('auth/register', {
      matrixParams: "exact",
      queryParams: "exact",
      paths: "exact",
      fragment: 'exact'
    });
  }



}
