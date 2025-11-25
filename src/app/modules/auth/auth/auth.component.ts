import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {
  private router = inject(Router);

  goLogin = () => this.router.navigate(['/auth/login']);
  goRegister = () => this.router.navigate(['/auth/register']);

  get isLoginRouteActive(): boolean {
    return this.router.url.startsWith('/auth/login');
  }

  get isRegisterRouteActive(): boolean {
    return this.router.url.startsWith('/auth/register');
  }
}
