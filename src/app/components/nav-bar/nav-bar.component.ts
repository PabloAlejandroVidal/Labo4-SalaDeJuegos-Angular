import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [NavBarComponent],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent {

  constructor(private router: Router){
  }

  goHome = () => this.router.navigate(['/home']);
  goAbout = () => this.router.navigate(['/about']);
  goEncuesta = () => this.router.navigate(['/encuesta']);
  goRanking = () => this.router.navigate(['/ranking']);
  goEncuestas = () => this.router.navigate(['/encuestas-respuestas']);

}
