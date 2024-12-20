import { Component, inject } from '@angular/core';
import { Country, CountryService } from 'app/shared/services/country/country.service';
import { map, Subscription, take } from 'rxjs';
import { GameState, gameStates } from '../../types/gameStateType';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { gameNames, GameService } from '../../services/game/game.service';
import { UserService } from 'app/shared/services/user/user.service';

@Component({
  selector: 'app-preguntados',
  templateUrl: './preguntados.component.html',
  styleUrl: './preguntados.component.scss'
})
export class PreguntadosComponent {
  countryService: CountryService = inject(CountryService);
  gameService: GameService = inject(GameService);
  userService: UserService = inject(UserService);
  router: Router = inject(Router);
  subscriptions: Subscription[] = [];
  gameStates = gameStates;
  gameState: GameState = gameStates.notStarted;

  todosLosPaises: Country[] = [];
  paisesPorAdivinar: Country[] = [];

  paisAAdivinar: Country | null = null;
  paisesParaOpciones: Country[] = [];

  paisesAdivinados: number = 0;
  record: number = 0;
  user: any = null;


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

  ngOnInit(): void {
    this.user = this.userService.currentUser;
    const subscription: Subscription = this.gameService.observeScore(this.user, gameNames.preguntados).subscribe((docScore)=>{
      this.record = docScore.score;
    })
    this.subscriptions.push(subscription);
    this.obtenerPaisesDesdApi();
  }

  obtenerPaisesDesdApi() {
    const subscription: Subscription = this.countryService.getAllCountries()
    .pipe(take(1))
    .subscribe((countries)=>{
      this.todosLosPaises = countries;
    })

    this.subscriptions.push(subscription);
  }

  startGame() {
    this.paisesAdivinados = 0;
    const shuffledCountries = this.countryService.shuffleArray(this.todosLosPaises)
    this.paisesPorAdivinar = shuffledCountries.slice(0, 10);
    this.gameState = gameStates.playing;
    this.makeRiddle();
  }

  makeRiddle() {

    this.paisAAdivinar = this.obtenerPaisParaAdvinar();
    this.paisesParaOpciones = this.obtenerOpciones(this.todosLosPaises, 3);

    if (!this.paisesParaOpciones.includes(this.paisAAdivinar)){
      this.paisesParaOpciones[0] = this.paisAAdivinar;
    }
  }


  obtenerOpciones(from: any[], numero: number){
    const opciones = [];
    for (let i = 0; i < numero; i++){
      const randomIndex = Math.floor(Math.random() * from.length);
      opciones.push(from[randomIndex])
    }
    return opciones;
  }

  obtenerPaisParaAdvinar(): Country {
    const randomIndex = Math.floor(Math.random() * this.paisesPorAdivinar.length);
    const pais = this.paisesPorAdivinar[randomIndex];
    this.paisesPorAdivinar.splice(randomIndex, 1); // Elimina la carta directamente del mazo
    return pais;
  }

  selectOption(paisNameSelected: string) {
    if (!this.paisAAdivinar) {
      return;
    }
    if (paisNameSelected === this.paisAAdivinar.name){
      this.paisesAdivinados++;
      Swal.fire(
        'Correcto!',
        `La bandera es de ${this.paisAAdivinar.name}`,
        'success'
      );
    }else{
      Swal.fire(
        'Incorrecto!',
        `La bandera es de ${this.paisAAdivinar.name}`,
        'warning'
      );
    }
    if (this.paisesPorAdivinar.length === 0){
      Swal.fire(
        'Fin del Juego!',
        `Has acertado a ${this.paisesAdivinados} de 10 paises`,
        'info'
      );
      if (this.user && this.paisesAdivinados > this.record){
        const record = this.paisesAdivinados > this.record ? this.paisesAdivinados : this.record;
        this.gameService.recordNewScore(this.user, gameNames.preguntados, record);
      }
      this.gameState = gameStates.gameOver;
      return;
    }
    this.makeRiddle();
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


  ngOnDestroy(): void {
    this.subscriptions.forEach((sub)=>{
      sub.unsubscribe();
    })
  }
}
