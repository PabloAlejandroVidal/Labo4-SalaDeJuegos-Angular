import { Component, Input } from '@angular/core';
import { gameNames } from '../../services/game/game.service';

@Component({
  selector: 'app-game-card',
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss'
})

export class GameCardComponent {

  @Input () nombreJuego: gameNames | null = null;
  @Input () img_url: string = '';

}
