import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalaDeJuegosComponent } from './sala-de-juegos/sala-de-juegos.component';
import { GamesListComponent } from './pages/games-list/games-list.component';
import { AhorcadoGameComponent } from './pages/ahorcado-game/ahorcado-game.component';
import { GAMES_ROUTES } from './constants/routes.constants';
import { MayorMenorComponent } from './pages/mayor-menor/mayor-menor.component';
import { JuegoNoDisponibleComponent } from './pages/juego-no-disponible/juego-no-disponible.component';
import { ConectaCuatroComponent } from './pages/conecta-cuatro/conecta-cuatro.component';
import { PreguntadosComponent } from './pages/preguntados/preguntados.component';


const routes: Routes = [
  {
    path: '', component: SalaDeJuegosComponent,
    children: [
      { path: '', component: GamesListComponent },
      { path: GAMES_ROUTES.AHORCADO, component: AhorcadoGameComponent },
      { path: GAMES_ROUTES.MAYOR_MENOR, component: MayorMenorComponent },
      { path: GAMES_ROUTES.CONECTA_CUATRO, component: ConectaCuatroComponent },
      { path: GAMES_ROUTES.PREGUNTADOS, component: PreguntadosComponent },
      { path: '**', component: GamesListComponent },
      ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
