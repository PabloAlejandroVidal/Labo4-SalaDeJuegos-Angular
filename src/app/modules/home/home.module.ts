import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameCardComponent } from './components/game-card/game-card.component';
import { GamesListComponent } from './pages/games-list/games-list.component';
import { HomeRoutingModule } from './home-routing.module';
import { GameService } from './services/game.service';
import { AhorcadoGameComponent } from './pages/ahorcado-game/ahorcado-game.component';
import { SalaDeJuegosComponent } from './sala-de-juegos/sala-de-juegos.component';
import { GameMenuComponent } from './components/game-menu/game-menu.component';
import { OnScreenKeyboardComponent } from './components/on-screen-keyboard/on-screen-keyboard.component';
import { UserPanelComponent } from "./components/user-panel/user-panel.component";
import { UserService } from 'app/shared/services/user/user.service';
import { FirestoreService } from 'app/shared/services/firestore/firestore.service';
import { AuthService } from 'app/shared/services/auth/auth.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MayorMenorComponent } from './pages/mayor-menor/mayor-menor.component';
import { CountryService } from 'app/shared/services/country/country.service';
import { HttpClientModule } from '@angular/common/http';
import { PreguntadosComponent } from './pages/preguntados/preguntados.component';
import { ChatComponent } from "../../pages/chat/chat.component";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatService } from 'app/shared/services/chat/chat.service';
import { AppComponent } from 'app/app.component';
import { TimerComponent } from './components/timer/timer.component';
import { FruitCatcherComponent } from './pages/fruit-catcher/fruit-catcher.component';
import { GameButtonComponent } from './components/game-button/game-button.component';
import { GameResultOverlayComponent } from './components/game-result-overlay/game-result-overlay.component';
import { GameCountdownComponent } from './components/game-countdown/game-countdown.component';




@NgModule({
  declarations: [

    AhorcadoGameComponent,
    SalaDeJuegosComponent,
    GameMenuComponent,
    OnScreenKeyboardComponent,
    GamesListComponent,
    GameCardComponent,
    UserPanelComponent,
    MayorMenorComponent,
    PreguntadosComponent,
    ChatComponent,
    FruitCatcherComponent,
    GameButtonComponent,
    GameResultOverlayComponent,
    GameCountdownComponent,
    FruitCatcherComponent,
    GameCountdownComponent,
    GameResultOverlayComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    HttpClientModule,
    FormsModule,
    TimerComponent,


  ],
  providers:
  [
    GameService,
    CountryService,
    ChatService,
  ],
  exports: [
    GameButtonComponent,
    GameResultOverlayComponent,
    GameCountdownComponent
  ]

})
export class HomeModule { }
