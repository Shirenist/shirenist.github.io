import { Directive, ElementRef, OnInit, OnDestroy, inject } from '@angular/core';
import { AudioService } from '../services/audio.service';

@Directive({
  selector: '[appReveal]',
  standalone: true
})
export class RevealDirective implements OnInit, OnDestroy {
  private el    = inject(ElementRef);
  private audio = inject(AudioService);
  private obs!: IntersectionObserver;

  ngOnInit() {
    this.el.nativeElement.classList.add('reveal');
    this.obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          this.audio.playReveal();
          this.obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    this.obs.observe(this.el.nativeElement);
  }

  ngOnDestroy() { this.obs.disconnect(); }
}
