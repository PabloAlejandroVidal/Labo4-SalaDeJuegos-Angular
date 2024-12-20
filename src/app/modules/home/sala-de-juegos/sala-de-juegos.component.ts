import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-sala-de-juegos',
  templateUrl: './sala-de-juegos.component.html',
  styleUrl: './sala-de-juegos.component.scss'
})
export class SalaDeJuegosComponent {

  chatVisible: boolean = false;

  handleEvent(event: any) {
    this.chatVisible = event;
  }

  ngOnInit(): void {
  }
}
