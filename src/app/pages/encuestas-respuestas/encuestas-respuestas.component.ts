import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Encuesta } from 'app/shared/interfaces/encuesta';
import { EncuestaService } from 'app/shared/services/encuesta/encuesta.service';

@Component({
  selector: 'app-encuestas-respuestas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './encuestas-respuestas.component.html',
  styleUrl: './encuestas-respuestas.component.scss'
})
export class EncuestasRespuestasComponent {
  encuestas: Encuesta[] = [];
  loading = true;

  constructor(private encuestaService: EncuestaService) {}

  ngOnInit(): void {
    this.encuestaService.getEncuesta(10).subscribe({
      next: (encuestas) => {
        this.encuestas = encuestas.map(encuesta => {
          // Convertir Timestamps de Firestore en Date
          return {
            ...encuesta,
            createdAt: (encuesta.createdAt as any).toDate()
          };
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar encuestas:', err);
        this.loading = false;
      }
    });
  }

}
