import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { AudioService } from 'app/shared/services/audio-service';
import { Auth } from '@angular/fire/auth';
import { GameService } from '../../services/game.service';

export type GameState =
  | 'INIT'
  | 'LOADING'
  | 'COUNTDOWN'
  | 'RUNNING'
  | 'PAUSED'
  | 'FINISHING'
  | 'FINISHED';

type GameResult = 'win' | 'lose';

type Fruit = {
  id: number;
  nx: number;
  ny: number;
  vyn: number;
  sprite: string;
  type: 'fruit' | 'bomb';
  alive: boolean;
  slicing: boolean;
  removing: boolean;
};

interface Game {
  gameState: GameState;
  lives: number;
  fruitsCaught: number;
  fruits: Fruit[];
}

@Component({
  selector: 'app-fruit-catcher',
  standalone: false,
  templateUrl: './fruit-catcher.component.html',
  styleUrls: ['./fruit-catcher.component.scss'],
})
export class FruitCatcherComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('boardEl', { static: true }) boardEl!: ElementRef<HTMLDivElement>;

  // 👉 umbral para ganar
  private readonly WIN_THRESHOLD = 20;
  get winThreshold(): number {
    return this.WIN_THRESHOLD;
  }

  game: Game = { fruits: [], fruitsCaught: 0, lives: 3, gameState: 'LOADING' };

  result = {
    show: false,
    loading: false,
  };

  bgLoaded = false;

  private allSprites: string[] = [
    '/assets/games/fruits/apple.png',
    '/assets/games/fruits/banana.png',
    '/assets/games/fruits/grape.png',
    '/assets/games/fruits/strawberry.png',
    '/assets/games/fruits/pineapple.png',
    '/assets/games/fruits/orange.png',
    '/assets/games/fruits/cherry.png',
    '/assets/games/fruits/lemon.png',
    '/assets/games/fruits/water-melon.png',
  ];

  private spawnEveryS = 0.4;
  private gravityN = 0.38;
  private bombChance = 0;

  private rafId: number | null = null;
  private lastTs = 0;
  private spawnAcc = 0;
  private cleanupIntervalId: any = null;

  private router = inject(Router);
  private audioService = inject(AudioService);
  private auth = inject(Auth);
  private gameService = inject(GameService);

  private currentUserEmail: string | null = null;

  private _id = 0;
  private lastResult: GameResult | null = null;

  // 👉 mensaje según win/lose
  get resultMessage(): string {
    if (!this.lastResult) return '';

    if (this.lastResult === 'win') {
      return `¡Ganaste! Atrapaste ${this.game.fruitsCaught} frutas 🎉`;
    }

    return `Perdiste esta vez… atrapaste ${this.game.fruitsCaught} frutas. ¡Intentá de nuevo para alcanzar las ${this.WIN_THRESHOLD}! 💪`;
  }

  async ngOnInit() {
    // intentamos obtener el email del usuario logueado en Firebase
    const user = this.auth.currentUser;
    this.currentUserEmail = user?.email ?? null;
    console.log('[FruitCatcher] currentUserEmail:', this.currentUserEmail);

    this.preload('/assets/games/tropical-game-menu-background5.jpg').then(() =>
      requestAnimationFrame(() => (this.bgLoaded = true))
    );

    await this.audioService.unlock();
    await this.audioService.load('taken', '/assets/sounds/taken.wav');
    await this.audioService.load('bg-music', '/assets/sounds/fruit-catcher.mp3');
    await this.audioService.load('loose', '/assets/sounds/loose.mp3');
  }

  ngAfterViewInit() {
    this.preloadImages().then(() => {
      this.game.gameState = 'INIT';
    });
  }

  ngOnDestroy(): void {
    this.audioService.stopBackground();
    this.stop();
  }

  private preload(url: string) {
    return new Promise<void>((res) => {
      const img = new Image();
      img.src = url;
      img.onload = () => res();
    });
  }

  /* === ciclo === */
  start() {
    if (this.game.gameState !== 'COUNTDOWN') return;

    this.audioService.playBackground('bg-music', { volume: 0.9 });
    this.spawnEveryS = 0.4;
    this.gravityN = 0.38;
    this.bombChance = 0;
    this.game.fruitsCaught = 0;
    this.game.lives = 3;
    this.game.fruits = [];
    this.spawnAcc = 0;
    this.lastTs = performance.now();
    this.lastResult = null;

    this.game.gameState = 'RUNNING';
    this.loop(this.lastTs);
  }

  pause() {
    if (this.game.gameState === 'RUNNING') {
      this.game.gameState = 'PAUSED';
      this.stop();
    } else if (this.game.gameState === 'PAUSED') {
      this.game.gameState = 'RUNNING';
      this.loop(this.lastTs);
    }
  }

  private stop() {
    if (this.rafId != null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.gravityN = 0;
    this.stopCleanupInterval();
    this.audioService.stopBackground();
  }

  private stopCleanupInterval() {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
    }
  }

  private loop = (ts: number) => {
    if (this.game.gameState !== 'RUNNING') return;
    const dt = Math.min(0.02, (ts - this.lastTs) / 1000);
    this.lastTs = ts;

    this.update(dt);
    this.rafId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    // spawn
    this.spawnAcc += dt;
    while (this.spawnAcc > this.spawnEveryS) {
      this.spawnAcc -= this.spawnEveryS;
      this.spawnFruit();
    }

    // mover frutas
    for (const f of this.game.fruits) {
      if (!f.alive || f.slicing) continue;
      f.vyn += this.gravityN * dt;
      f.ny += f.vyn * dt;
    }

    // limpiar frutas que caen
    this.game.fruits = this.game.fruits.filter((f) => {
      if ((f.alive && f.ny < 1.15) || f.slicing) {
        return true;
      }
      this.game.lives--;
      return false;
    });

    // Fin del juego: sin vidas => decided win/lose según score
    if (this.game.lives <= 0) {
      const finalResult: GameResult =
        this.game.fruitsCaught >= this.WIN_THRESHOLD ? 'win' : 'lose';
      this.finishGame(finalResult);
    }
  }

  async finishGame(finalResult: GameResult = 'lose') {
    if (this.game.gameState === 'FINISHING' || this.game.gameState === 'FINISHED') {
      return;
    }

    this.lastResult = finalResult;

    console.log('[FruitCatcher] finishGame', {
      finalResult,
      lives: this.game.lives,
      currentUserEmail: this.currentUserEmail,
      fruitsCaught: this.game.fruitsCaught,
    });

    this.stop();
    this.game.gameState = 'FINISHING';
    this.audioService.play('loose'); // si después tenés sonido de win, podés chequear finalResult

    this.result.show = true;
    this.result.loading = true;

    // 👉 Guardar el score en Firebase usando tu GameService
    try {
      if (!this.currentUserEmail) {
        console.warn('[FruitCatcher] No hay email de usuario, no se registra score.');
      } else {
        await this.gameService.recordFruitCatcherScore(
          this.currentUserEmail,
          this.game.fruitsCaught
        );
      }
    } catch (err) {
      console.error('[FruitCatcher] Error recording score in Firebase', err);
    } finally {
      this.result.loading = false;
    }

    setTimeout(() => {
      this.removeFruitsLeft().then(() => {
        setTimeout(() => {
          this.game.gameState = 'FINISHED';
        }, 1000);
      });
    }, 200);
  }

  removeFruitsLeft(): Promise<void> {
    return new Promise((resolve) => {
      this.stopCleanupInterval();

      const fruits = this.game.fruits.reverse();
      this.cleanupIntervalId = setInterval(() => {
        const fruitToClear = fruits.find((f) => f.alive && !f.removing);

        if (fruitToClear) {
          this.removeFruit(fruitToClear);
        } else {
          this.stopCleanupInterval();
          resolve();
        }
      }, 200);
    });
  }

  removeFruit(fruit: Fruit) {
    if (!fruit.alive || fruit.slicing) return;
    fruit.removing = true;
    fruit.alive = false;
    setTimeout(() => {
      const i = this.game.fruits.findIndex((x) => x.id === fruit.id);
      if (i >= 0) {
        this.game.fruits.splice(i, 1);
      }
    }, 2800);
  }

  private spawnFruit() {
    const margin = 0.08;
    const nx = margin + Math.random() * (1 - margin * 2);
    const ny = -0.08;
    const isBomb = Math.random() < this.bombChance;
    const sprite = isBomb ? '/assets/games/bomb.png' : this.randomFruitImg();
    const vyn = this.gravityN * (0.85 + Math.random() * 0.4);
    this.game.fruits.push({
      nx,
      ny,
      vyn,
      sprite,
      type: isBomb ? 'bomb' : 'fruit',
      alive: true,
      slicing: false,
      removing: false,
      id: ++this._id,
    });
  }

  private randomFruitImg() {
    return this.allSprites[Math.floor(Math.random() * this.allSprites.length)];
  }

  startCountdown() {
    this.game.gameState = 'COUNTDOWN';
  }

  private preloadImages(): Promise<void[]> {
    const promises = this.allSprites.map((src) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = (err) => {
          console.error(`Error al cargar imagen: ${src}`, err);
          resolve();
        };
        img.src = src;
      });
    });
    return Promise.all(promises);
  }

  onKeyDown(ev: KeyboardEvent) {
    if (ev.key === ' ') {
      ev.preventDefault();
      this.start();
    } else if (ev.key.toLowerCase() === 'p') {
      this.game.gameState === 'RUNNING' ? this.pause() : this.start();
    } else if (ev.key.toLowerCase() === 'r') {
      this.startCountdown();
    }
  }

  exit() {
    this.router.navigateByUrl('games');
  }

  trackFruit = (_: number, f: Fruit) => f.id;

  private slicing = false;
  slices: { x: number; y: number; t: number }[] = [];

  getSlicePoints(): string {
    return this.slices.map((p) => `${p.x},${p.y}`).join(' ');
  }

  private toBoardCoords(ev: PointerEvent) {
    const rect = this.boardEl.nativeElement.getBoundingClientRect();
    return {
      x: ev.clientX - rect.left,
      y: ev.clientY - rect.top,
      rect,
    };
  }

  private isHitFruitAtPoint(
    fruit: Fruit,
    x: number,
    y: number,
    boardRect: DOMRect
  ): boolean {
    const el = this.boardEl.nativeElement.querySelector(
      `.fruit[data-id="${fruit.id}"]`
    ) as HTMLElement;
    if (!el) return false;
    const r = el.getBoundingClientRect();

    const cx = r.left - boardRect.left + r.width / 2;
    const cy = r.top - boardRect.top + r.height / 2;

    const radius = Math.max(r.width, r.height) * 0.75;
    const dx = x - cx;
    const dy = y - cy;
    return dx * dx + dy * dy <= radius * radius;
  }

  sliceFruit(fruit: Fruit) {
    if (!fruit.alive || fruit.slicing || this.game.gameState !== 'RUNNING') return;
    fruit.slicing = true;
    fruit.alive = false;
    this.audioService.play('taken');

    this.addCaughtFruit();
    setTimeout(() => {
      const i = this.game.fruits.findIndex((x) => x.id === fruit.id);
      if (i >= 0) {
        this.game.fruits.splice(i, 1);
      }
    }, 2800);
  }

  addCaughtFruit() {
    this.game.fruitsCaught++;
  }

  onPointerDown(ev: PointerEvent) {
    ev.preventDefault();
    const { x, y, rect } = this.toBoardCoords(ev);
    const t = performance.now();
    this.slicing = true;
    this.slices = [{ x, y, t }];

    for (const f of this.game.fruits) {
      if (f.alive && !f.slicing && this.isHitFruitAtPoint(f, x, y, rect)) {
        this.sliceFruit(f);
      }
    }

    (ev.target as Element)?.setPointerCapture?.(ev.pointerId);
  }

  onPointerMove(ev: PointerEvent) {
    if (!this.slicing) return;
    ev.preventDefault();
    const { x, y, rect } = this.toBoardCoords(ev);

    const t = performance.now();
    this.slices.push({ x, y, t });
    setTimeout(() => {}, 240);

    for (const f of this.game.fruits) {
      if (!f.alive || f.slicing) continue;
      if (this.isHitFruitAtPoint(f, x, y, rect)) {
        this.sliceFruit(f);
      }
    }
  }

  onPointerUp(ev?: PointerEvent) {
    this.slicing = false;
    ev?.preventDefault();
    if (ev) {
      try {
        (ev.target as Element)?.releasePointerCapture?.(ev.pointerId);
      } catch {}
    }

    setTimeout(() => {
      this.slices = [];
    }, 240);
  }

  onRetry() {
    this.game.fruits = [];
    this.game.fruitsCaught = 0;
    this.game.lives = 3;
    this.lastResult = null;

    this.game.gameState = 'COUNTDOWN';
  }

  onCloseResult() {
    this.result.show = false;
    this.game.fruits = [];
    this.game.fruitsCaught = 0;
    this.game.lives = 3;
    this.lastResult = null;
    this.game.gameState = 'INIT';
  }
}
