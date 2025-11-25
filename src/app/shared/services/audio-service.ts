// src/app/shared/audio/audio.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  private buffers = new Map<string, AudioBuffer>();

  private bgSource?: AudioBufferSourceNode;
  private bgGain?: GainNode;

  // iOS requiere gesto del usuario: llamá a esta función en un click/tap inicial
  async unlock() {
    if (this.ctx.state !== 'running') {
      await this.ctx.resume();
    }
  }

  async load(name: string, url: string) {
    const res = await fetch(url, { cache: 'force-cache' });
    const array = await res.arrayBuffer();
    const buffer = await this.ctx.decodeAudioData(array);
    this.buffers.set(name, buffer);
  }

  /**
   * Reproduce un buffer por nombre. Retorna un handle con stop().
   * Opciones: volume 0..1, rate>0, loop boolean, when en segundos.
   */
  play(name: string, opts?: { volume?: number; rate?: number; loop?: boolean; when?: number }) {
    const buffer = this.buffers.get(name);
    if (!buffer) {
      console.log(`Audio buffer "${name}" not loaded`);
      return;
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    if (opts?.rate) src.playbackRate.value = opts.rate;

    const gain = this.ctx.createGain();
    gain.gain.value = opts?.volume ?? 1;

    src.loop = !!opts?.loop;
    src.connect(gain).connect(this.ctx.destination);

    const when = opts?.when ?? 0;
    try {
      src.start(this.ctx.currentTime + when);
    } catch (err) {
      console.error('Error al reproducir el audio' + err);
    }

    return {
      stop: () => {
        try {
          src.stop();
        } catch {}
      },
      node: src,
    };
  }

  async playBackground(name: string, opts?: { volume?: number }) {
    const buffer = this.buffers.get(name);
    if (!buffer) throw new Error(`Background audio "${name}" not loaded`);

    // Si ya hay una música activa, detenerla primero
    this.stopBackground();

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true; // 👈 loop infinito

    const gain = this.ctx.createGain();
    gain.gain.value = opts?.volume ?? 0.5; // volumen por defecto medio

    src.connect(gain).connect(this.ctx.destination);
    src.start(0);

    this.bgSource = src;
    this.bgGain = gain;
  }

  stopBackground() {
    if (this.bgSource) {
      try {
        this.bgSource.stop();
      } catch {}
      this.bgSource.disconnect();
      this.bgGain?.disconnect();
      this.bgSource = undefined;
      this.bgGain = undefined;
    }
  }

  setBackgroundVolume(v: number) {
    if (this.bgGain) {
      this.bgGain.gain.value = v;
    }
  }
}
