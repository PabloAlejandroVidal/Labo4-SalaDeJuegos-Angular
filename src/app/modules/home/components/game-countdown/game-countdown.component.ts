import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-game-countdown',
  standalone: false,
  templateUrl: './game-countdown.component.html',
  styleUrls: ['./game-countdown.component.scss'],
  animations: [],
})
export class GameCountdownComponent {
  @Input() initialCount: number = 3; // El número desde el que comienza la cuenta
  @Output() countdownFinished = new EventEmitter<void>(); // Evento que se dispara al finalizar

  // Propiedad para el número que se muestra
  currentCount: number = 0;

  private intervalId: any;

  ngOnInit() {
    this.startCountdown();
  }

  ngOnDestroy() {
    this.stopCountdown();
  }

  /**
   * Inicia la cuenta regresiva.
   */
  startCountdown() {
    // Asegura que el valor inicial sea el actual
    this.currentCount = this.initialCount;

    // Si ya está corriendo o la cuenta es 0 o menos, detenemos
    if (this.intervalId || this.currentCount <= 0) {
      this.finish();
      return;
    }

    // Inicia el intervalo para decrementar cada segundo (1000ms)
    this.intervalId = setInterval(() => {
      this.currentCount--;

      if (this.currentCount < 0) {
        this.stopCountdown();
        this.finish();
      }
    }, 1000);
  }

  /**
   * Detiene el intervalo de la cuenta.
   */
  stopCountdown() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Finaliza la cuenta y emite el evento.
   */
  private finish() {
    this.countdownFinished.emit();
  }

  // Opcional: Para simular un efecto de animación al cambiar el número
  get animationClass() {
    return `count-${this.currentCount}`;
  }
}
