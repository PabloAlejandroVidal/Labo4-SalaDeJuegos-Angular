import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { gameNames, GameService, ScoreData } from 'app/modules/home/services/game/game.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './ranking.component.html',
  styleUrl: './ranking.component.scss'
})
export class RankingComponent implements OnInit {
  mayorMenorScores: any[] = [];
  ahorcadoScores: any[] = [];
  conectaCuatroScores: any[] = [];
  preguntadosScores: any[] = [];

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    // Suscripción para obtener los puntajes del juego
    this.gameService.observeScores(gameNames.mayorMenor).pipe(
      map((scores)=>{
        const scoresmapped = scores.map((score)=>{
          return score = {...score, registered: score.registered.toDate()}
        });
        const orderedScores = scoresmapped.sort((a, b) => b.score - a.score); // Orden descendente (más recientes primero)

        return [ ...orderedScores]
      })
    ).subscribe({
      next: (scores) => {
        this.mayorMenorScores = scores;
      },
      error: (err) => {
        console.error('Error fetching scores', err);
      }
    });

    this.gameService.getAhorcadoStatsForAllUsers().then((statsMap) => {
      // Procesar los datos para obtener el array de puntajes
      Object.keys(statsMap).forEach((email) => {
        this.ahorcadoScores.push({
          user: email,
          total: statsMap[email].total,
          ganadas: statsMap[email].ganadas,
          // Calcular la relación ganadas/total
          ratio: statsMap[email].ganadas / statsMap[email].total
        });
      });

      // Ordenar por la relación ganadas/total en orden descendente (mejores ratios primero)
      this.ahorcadoScores.sort((a, b) => b.ratio - a.ratio);
    });


    this.gameService.getConectaCuatroStatsForAllUsers().then((statsMap) => {
      Object.keys(statsMap).forEach((email) => {
        this.conectaCuatroScores.push({
          user: email,
          total: statsMap[email].total,
          rojo: statsMap[email].rojo,
          amarillo: statsMap[email].amarillo,
        })
      });

      this.conectaCuatroScores.sort((a, b) => b.total - a.total);
    });



    this.gameService.observeScores(gameNames.preguntados).pipe(
      map((scores)=>{
        const scoresmapped = scores.map((score)=>{
          return score = {...score, registered: score.registered.toDate()}
        });
        const orderedScores = scoresmapped.sort((a, b) => b.score - a.score); // Orden descendente (más recientes primero)
        return [ ...orderedScores]
      })
    ).subscribe({
      next: (scores) => {
        this.preguntadosScores = scores;
      },
      error: (err) => {
        console.error('Error fetching scores', err);
      }
    });
  }
}
