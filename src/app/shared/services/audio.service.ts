import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private bg = new Audio('assets/audio/bg.webm');
  private click = new Audio('assets/audio/click.mp3');
  private reveal = new Audio('assets/audio/reveal.mp3');

  private on = true;
  private unlocked = true;

  constructor() {
    this.bg.loop = true;
    this.bg.volume = 0.18;
    this.click.volume = 0.4;
    this.reveal.volume = 0.25;
  }

  get isOn() {
    return this.on;
  }

  toggle(): boolean {
    this.unlocked = true;
    this.on = !this.on;
    if (this.on) this.bg.play().catch(() => {});
    else this.bg.pause();
    return this.on;
  }

  playClick() {
    if (!this.on) return;
    this.click.currentTime = 0;
    this.click.play().catch(() => {});
  }

  playReveal() {
    if (!this.on) return;
    this.reveal.currentTime = 0;
    this.reveal.play().catch(() => {});
  }
}
