import { Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AudioService } from './shared/services/audio.service';
import { HomeComponent } from './core/pages/home/home';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HomeComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  cursorX = -100;
  cursorY = -100;
  trailX = -100;
  trailY = -100;
  cursorBig = false;

  get audioOn() {
    return this.audio.isOn;
  }

  private trailTimeout: any;

  constructor(
    public audio: AudioService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit() {}

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    this.cursorX = e.clientX;
    this.cursorY = e.clientY;
    clearTimeout(this.trailTimeout);
    this.trailTimeout = setTimeout(() => {
      this.trailX = e.clientX;
      this.trailY = e.clientY;
    }, 80);
  }

  @HostListener('document:click', ['$event'])
  onClick(e: MouseEvent) {
    this.audio.playClick();
    this.spawnRipple(e.clientX, e.clientY);
  }

  @HostListener('document:mouseenter', ['$event'])
  onEnterInteractive(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest('a, button, .project-item, .game-row, .tag, .link-pill')) {
      this.cursorBig = true;
    }
  }

  @HostListener('document:mouseleave', ['$event'])
  onLeaveInteractive(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest('a, button, .project-item, .game-row, .tag, .link-pill')) {
      this.cursorBig = false;
    }
  }

  onHoverInteractive(big: boolean) {
    this.cursorBig = big;
  }

  toggleAudio() {
    this.audio.toggle();
  }

  private spawnRipple(x: number, y: number) {
    if (!isPlatformBrowser(this.platformId)) return;
    const el = document.createElement('div');
    el.className = 'ripple';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 700);
  }

  ngOnDestroy() {
    clearTimeout(this.trailTimeout);
  }
}
