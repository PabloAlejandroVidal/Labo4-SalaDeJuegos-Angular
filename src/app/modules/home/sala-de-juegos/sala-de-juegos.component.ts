import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AuthService } from 'app/shared/services/auth/auth.service';

@Component({
  selector: 'app-sala-de-juegos',
  templateUrl: './sala-de-juegos.component.html',
  styleUrl: './sala-de-juegos.component.scss'
})
export class SalaDeJuegosComponent {
constructor(
  private router: Router,
  private auth: AuthService
) {}
chatVisible: boolean = false;

handleEvent(event: any) {
  this.chatVisible = event;
}

ngOnInit(): void {
}
goBack() {
  const current = this.router.url;

  if (current === '/games' || current.startsWith('/games/')) {
    this.router.navigateByUrl('/home');
  } else {
    this.router.navigateByUrl('/games');
  }
}


logout() {
  this.auth.logout();
  this.router.navigateByUrl('/auth/login');
}
}
