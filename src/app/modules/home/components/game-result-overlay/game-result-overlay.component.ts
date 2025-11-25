import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';

@Component({
  selector: 'app-game-result-overlay',
  templateUrl: './game-result-overlay.component.html',
  styleUrls: ['./game-result-overlay.component.scss'],
  standalone: false,
})
export class GameResultOverlayComponent {
  @Input() open = false; // mostrar/ocultar overlay
  @Input() score = 0; // puntaje final
  @Input() wonCoupon = false; // true si ganó cupón
  @Input() loading = false; // por si necesitás mostrar un spinner (guardar score, etc.)
  @Input() message = '¡Has ganado!';

  @Output() close = new EventEmitter<void>();
  @Output() retry = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
  onRetry() {
    this.retry.emit();
  }
}
