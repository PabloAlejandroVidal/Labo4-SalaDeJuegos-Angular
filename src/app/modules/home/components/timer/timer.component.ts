import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss'
})
export class TimerComponent {

  @Input() startTime: number = 0; // Tiempo inicial en segundos
  @Input() countdown: boolean = false; // Contador regresivo (opcional)

  tiempoActual: number = 0;
  intervalId: any;

  ngOnInit(): void {
    this.tiempoActual = this.startTime;

    // Iniciar el temporizador
    this.intervalId = setInterval(() => {
      if (this.countdown) {
        if (this.tiempoActual > 0) {
          this.tiempoActual--;
        }
      } else {
        this.tiempoActual++;
      }
    }, 1000); // Actualiza cada segundo
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId); // Limpiar el temporizador al destruir el componente
    }
  }
}
