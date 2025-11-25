import { Component, inject } from '@angular/core';
import { gameNames, GameService } from '../../services/game.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-games-list',
  templateUrl: './games-list.component.html',
  styleUrl: './games-list.component.scss'
})
export class GamesListComponent {
  gameService: GameService = inject(GameService);

  gamesRoutes = {
    GAMES_LIST: 'games',
    AHORCADO: 'ahorcado',
    MAYOR_MENOR: 'mayor-menor',
    CONECTA_CUATRO: 'conecta-cuatro',
    PREGUNTADOS: 'preguntados',
    FRUIT_CATCHER: 'fruit-catcher',
  };

  static GAMES = {
    ahorcado: {
      name: gameNames.ahorcado,
      urlImg: '/assets/games/juego-del-ahorcado.png',
    },
    mayorMenor: {
      name: gameNames.mayorMenor,
      urlImg: '/assets/games/juego-mayor-menor.png',
    },
    conectaCuatro: {
      name: gameNames.conectaCuatro,
      urlImg: '/assets/games/juego-conecta-cuatro.png',
    },
    preguntados: {
      name: gameNames.preguntados,
      urlImg: '/assets/games/juego-preguntados.png',
    },
    fruitCatcher: {
      name: gameNames.fruitCatcher,
      urlImg: '/assets/games/juego-cazador-de-frutas.png',
    }
  }

  public games = GamesListComponent.GAMES;

}
