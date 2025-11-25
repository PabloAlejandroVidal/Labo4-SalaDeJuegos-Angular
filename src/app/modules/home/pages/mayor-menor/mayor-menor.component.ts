import { Component, inject } from '@angular/core';
import { UserService } from 'app/shared/services/user/user.service';
import { gameNames, GameService } from '../../services/game.service';
import { Router } from '@angular/router';
import { DocumentData } from '@angular/fire/firestore';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { GameState, gameStates } from '../../types/gameStateType';




export interface carta {
  numero: number;
  palo: 'espada' | 'oro' | 'copa' | 'basto';
  imagen: string;
}

type palo = 'espada' | 'oro' | 'copa' | 'basto';

@Component({
  selector: 'app-mayor-menor',
  templateUrl: './mayor-menor.component.html',
  styleUrl: './mayor-menor.component.scss'
})
export class MayorMenorComponent {

  gameService: GameService = inject(GameService);
  userService: UserService = inject(UserService);
  gameStates = gameStates;
  gameState: GameState = gameStates.notStarted;
  router: Router = inject(Router);

  valores = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12 ];
  palos: palo[] = ['espada', 'oro', 'copa', 'basto'];

  mazo: carta[] = [];

  cartaActual: carta | null = null;
  cartaSiguiente: carta | null = null;

  resultado: string = '';
  puntaje: number = 0;
  recordActual: number = 0;
  anteriorRecord: number = 0;
  newRecord: boolean = false;
  user: any = null;

  subscriptions: Subscription[] = [];


  ngOnInit(): void {
    this.user = this.userService.currentUser;
    const subscription: Subscription = this.gameService.observeScore(this.user, gameNames.mayorMenor).subscribe((docScore)=>{
      this.anteriorRecord = docScore.score;
    })
    this.subscriptions.push(subscription);
  }

  public readonly menuOptions = {
    init: {
      label: 'Comenzar Juego',
      action: ()=> {
        this.startGame();
      }
    },
    resume: {
      label: 'Reanudar Juego',
      action: ()=> {
        this.pause(false);
      }
    },
    restart: {
      label: 'Nuevo Juego',
      action: ()=> {
        this.startGame();
      }
    },
    goRanking: {
      label: 'Ranking',
      action: ()=>{
        this.router.navigateByUrl('/ranking');
      }
    },
    goHelp: {
      label: 'Ayuda',
      action: ()=>{
      }
    },
    exit: {
      label: 'Salir',
      action: ()=>{
        this.finalizarJuego();
      }
    },
  }

  mainMenuItems = [this.menuOptions.init, this.menuOptions.goRanking, this.menuOptions.goHelp, this.menuOptions.exit];
  pauseMenuItems = [this.menuOptions.resume, this.menuOptions.goRanking, this.menuOptions.goHelp, this.menuOptions.exit];
  gameOverMenuItems = [this.menuOptions.restart, this.menuOptions.goRanking, this.menuOptions.goHelp, this.menuOptions.exit];

  startGame() {
    this.gameState = gameStates.playing;
    this.mazo = this.generarMazo();
    this.cartaActual = this.obtenerCarta();
    this.puntaje = 0;
    this.recordActual = 0;
  }

  pause(shouldPause: boolean) {
    if (this.gameState === gameStates.playing || this.gameState === gameStates.paused){
      if (shouldPause){
        this.gameState = gameStates.paused;
      }else{
        this.gameState = gameStates.playing;
      }
    }
  }

  finalizarJuego() {
    this.router.navigateByUrl("home");
  }


  generarMazo(): carta[] {
    const mazo: carta[] = [];

    this.palos.forEach((palo)=>{
      this.valores.forEach((valor)=>{

        const carta: carta = {
          numero: valor,
          palo: palo,
          imagen: `assets/games/cartas/${valor}de${palo}.png`,
        }
        mazo.push(carta);
      })
    })
    return mazo;
  }

  obtenerCarta(): carta {
    const randomIndex = Math.floor(Math.random() * this.mazo.length);
    const carta = this.mazo[randomIndex];
    this.mazo.splice(randomIndex, 1);
    return carta;
  }


  adivinar(mayor: boolean) {

    const nuevaCarta = this.obtenerCarta();
    this.cartaSiguiente = nuevaCarta;

    const cartaActual = this.cartaActual
    const cartaSiguiente = this.cartaSiguiente;

    if (!cartaActual){
      return;
    }

    if (!cartaSiguiente){
      return;
    }

    const indiceActual = cartaActual.numero;
    const indiceSiguiente = cartaSiguiente.numero;

    if ((mayor && indiceSiguiente > indiceActual) || (!mayor && indiceSiguiente < indiceActual)) {
      this.resultado = '¡Correcto!';
      this.puntaje++;

      if (this.puntaje > this.recordActual) {
        this.recordActual = this.puntaje;
      }

    }
    else if((mayor && indiceSiguiente == indiceActual) || (!mayor && indiceSiguiente == indiceActual))
      {
        this.resultado = '';
      }
    else {
      this.resultado = '¡Incorrecto!';
      this.puntaje = 0;


      if (this.mazo.length > 0) {
        Swal.fire(
          'Incorrecto!',
          'Todavía quedan cartas en tu mazo, completalo y duplicá tus puntos!',
          'info'
        )
      }
    }

    if (this.mazo.length === 0){
      this.recordActual = this.recordActual * 2;
      Swal.fire(
        'Fin del Juego!',
        `Te has quedado sin cartas. Tu puntaje mas alto fué de ${this.recordActual}`,
        'info'
      );
      this.gameState = gameStates.gameOver;
    }

    if(this.user && this.recordActual > this.anteriorRecord){
      this.gameService.recordNewScore(this.user, gameNames.mayorMenor, this.recordActual)
    }

    this.cartaActual = this.cartaSiguiente;
  }

  ngOnDestroy(): void {

    this.subscriptions.forEach((sub)=>{
      sub.unsubscribe();
    })
  }
}
