import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { noLoguedGuard } from './shared/guards/no-logued.guard';
import { adminGuard } from './shared/guards/admin.guard';

export const routes: Routes = [
  // 👉 La raíz ahora va al home "real"
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.module').then(m => m.AuthModule),
    canActivate: [],
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/home/home.component').then(c => c.HomeComponent),
  },

  // 👉 Tu módulo actual de juegos montado en /games
  {
    path: 'games',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./modules/home/games.module').then(m => m.GamesModule),
    // si más adelante lo renombrás a games.module, cambiamos este import
  },

  // Alias en español: /juegos → /games (opcional pero lindo)
  {
    path: 'juegos',
    redirectTo: 'games',
    pathMatch: 'full',
  },

  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then(c => c.AboutComponent),
  },
  {
    path: 'encuesta',
    loadComponent: () =>
      import('./pages/encuesta/encuesta.component').then(c => c.EncuestaComponent),
  },
  {
    path: 'ranking',
    loadComponent: () =>
      import('./pages/ranking/ranking.component').then(c => c.RankingComponent),
  },
  {
    path: 'encuestas-respuestas',
    loadComponent: () =>
      import('./pages/encuestas-respuestas/encuestas-respuestas.component')
        .then(c => c.EncuestasRespuestasComponent),
    canActivate: [adminGuard],
    data: { expectedRole: 'admin', redirectTo: '/' },
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];
