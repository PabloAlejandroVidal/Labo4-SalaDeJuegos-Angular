import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-game-button',
  templateUrl: './game-button.component.html',
  styleUrls: ['./game-button.component.scss'],
  standalone: false,
})
export class GameButtonComponent {
  /** Texto que se mostrará en el botón */
  @Input() label: string = '';

  /** Color de fondo (puede ser 'red', '#ff0', 'var(--ion-color-primary)', etc.) */
  @Input() color: string = '#3a6cf4';

  /** Evento que se emite cuando se presiona el botón */
  @Output() pressed = new EventEmitter<void>();

  onClick(): void {
    this.pressed.emit();
  }
}
