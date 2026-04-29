import { Injectable } from '@angular/core';
import { PitchShift, Player, start } from 'tone';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private bg = new Player('assets/audio/bg-2.mp3').toDestination();
  private click = new Player('assets/audio/click.mp3').toDestination();
  private reveal = new Player('assets/audio/reveal.mp3').toDestination();
  private on = true;

  constructor() {
    this.bg.loop = true;
    this.bg.volume.value = -25;

    this.click.volume.value = 0;
    this.reveal.volume.value = 0;

    if (this.on) {
      this.bg.autostart = true;
    }
  }

  get isOn() {
    return this.on;
  }

  toggle(): boolean {
    this.on = !this.on;
    start().then(() => {
      if (this.on) this.bg.start();
      else this.bg.stop();
    });
    return this.on;
  }

  playClick() {
    if (!this.on) return;
    start().then(() => this.click.stop().start());
  }

  playReveal() {
    if (!this.on) return;
    start().then(() => this.reveal.stop().start());
  }
}
