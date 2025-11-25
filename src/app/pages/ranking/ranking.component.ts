import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
// import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

import { gameNames, GameService } from 'app/modules/home/services/game.service';
import { map } from 'rxjs';

type MayorMenorRow = { user: string; score: number; registered: Date };
type AhorcadoRow   = { user: string; ganadas: number; total: number; ratio: number };
type Conecta4Row   = { user: string; total: number; rojo: number; amarillo: number };
type PregRow       = { user: string; score: number; registered: Date };

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    // MatPaginatorModule,
  ],
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.scss'],
})
export class RankingComponent implements OnInit {
  // DataSources Material
  mayorMenorDS    = new MatTableDataSource<MayorMenorRow>([]);
  ahorcadoDS      = new MatTableDataSource<AhorcadoRow>([]);
  conectaCuatroDS = new MatTableDataSource<Conecta4Row>([]);
  preguntadosDS   = new MatTableDataSource<PregRow>([]);

  // Columnas visibles
  mayorMenorCols    = ['user', 'score', 'registered'];
  ahorcadoCols      = ['user', 'ratio'];
  conectaCuatroCols = ['user', 'total', 'rojo', 'amarillo'];
  preguntadosCols   = ['user', 'score', 'registered'];

  // Sort independiente por tabla (refs desde el template)
  @ViewChild('sortMM') sortMM!: MatSort;
  @ViewChild('sortAH') sortAH!: MatSort;
  @ViewChild('sortC4') sortC4!: MatSort;
  @ViewChild('sortPR') sortPR!: MatSort;

  // Si vas a usar paginadores, descomentar:
  // @ViewChild('pagMM') pagMM!: MatPaginator;
  // @ViewChild('pagAH') pagAH!: MatPaginator;
  // @ViewChild('pagC4') pagC4!: MatPaginator;
  // @ViewChild('pagPR') pagPR!: MatPaginator;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    // Mayor o Menor
    this.gameService.observeScores(gameNames.mayorMenor).pipe(
      map(scores => {
        const m = scores.map(s => ({ ...s, registered: s.registered.toDate() as Date }));
        return m.sort((a, b) => b.score - a.score);
      })
    ).subscribe({
      next: scores => {
        this.mayorMenorDS.data = scores;
        // colocar sort después de que haya data y ViewChild resuelto
        queueMicrotask(() => (this.mayorMenorDS.sort = this.sortMM));
      },
      error: err => console.error('Error fetching scores (mayorMenor)', err),
    });

    // Ahorcado
    this.gameService.getAhorcadoStatsForAllUsers().then(statsMap => {
      const rows: AhorcadoRow[] = Object.keys(statsMap).map(email => ({
        user: email,
        total: statsMap[email].total,
        ganadas: statsMap[email].ganadas,
        ratio: statsMap[email].total ? statsMap[email].ganadas / statsMap[email].total : 0,
      }));
      rows.sort((a, b) => b.ratio - a.ratio);
      this.ahorcadoDS.data = rows;
      queueMicrotask(() => (this.ahorcadoDS.sort = this.sortAH));
    });

    // Preguntados
    this.gameService.observeScores(gameNames.preguntados).pipe(
      map(scores => {
        const m = scores.map(s => ({ ...s, registered: s.registered.toDate() as Date }));
        return m.sort((a, b) => b.score - a.score);
      })
    ).subscribe({
      next: scores => {
        this.preguntadosDS.data = scores;
        queueMicrotask(() => (this.preguntadosDS.sort = this.sortPR));
      },
      error: err => console.error('Error fetching scores (preguntados)', err),
    });
  }

  // Si agregás paginación, activar esto cuando exista el ViewChild:
  // private attachPaginators() {
  //   this.mayorMenorDS.paginator = this.pagMM;
  //   this.ahorcadoDS.paginator   = this.pagAH;
  //   this.conectaCuatroDS.paginator = this.pagC4;
  //   this.preguntadosDS.paginator   = this.pagPR;
  // }

  trackByUser = (_: number, row: { user: string }) => row.user;
}
