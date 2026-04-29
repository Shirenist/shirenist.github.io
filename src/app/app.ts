import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  Inject,
  PLATFORM_ID,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
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
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  cursorBig = false;
  trailX = -100;
  trailY = -100;

  @ViewChild('cursor') cursorEl?: ElementRef<HTMLDivElement>;
  @ViewChild('trail') trailEl?: ElementRef<HTMLDivElement>;

  get audioOn() {
    return this.audio.isOn;
  }

  private trailTimeout: any;

  constructor(
    public audio: AudioService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Prevent body overflow initially to avoid content flashing
      document.body.style.overflow = 'hidden';
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Wait a tiny bit for DOM to settle, then scroll to bottom
      setTimeout(() => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo(0, maxScroll);
        // Re-enable scrolling after position is set
        document.body.style.overflow = 'auto';
      }, 100);
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    // Update cursor position directly on DOM for real-time tracking
    if (this.cursorEl) {
      this.cursorEl.nativeElement.style.left = e.clientX + 'px';
      this.cursorEl.nativeElement.style.top = e.clientY + 'px';
    }

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
