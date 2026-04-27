import { Component } from '@angular/core';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { MinigameComponent } from '../../../shared/components/minigame/minigame';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RevealDirective, MinigameComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {}
