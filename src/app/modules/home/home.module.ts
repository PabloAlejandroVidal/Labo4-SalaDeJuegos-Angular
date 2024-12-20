import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameCardComponent } from './components/game-card/game-card.component';
import { GamesListComponent } from './pages/games-list/games-list.component';
import { HomeRoutingModule } from './home-routing.module';
import { GameService } from './services/game/game.service';
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
  ]

})
export class HomeModule { }
