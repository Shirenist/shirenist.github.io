import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { AudioService } from '../../services/audio.service';

interface Bolt {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  trail: { x: number; y: number }[];
}

@Component({
  selector: 'app-minigame',
  standalone: true,
  templateUrl: './minigame.html',
  styleUrl: './minigame.scss',
})
export class MinigameComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private audio = inject(AudioService);

  score = 0;
  lives = 3;
  status = 'move cursor over canvas to start';

  private ctx!: CanvasRenderingContext2D;
  private W = 620;
  private H = 220;
  private bolts: Bolt[] = [];
  private paddle = { x: 310, w: 80, h: 8, y: 200 };
  private running = false;
  private lastTime = 0;
  private spawnTimer = 0;
  private spawnInterval = 1400;
  private rafId = 0;
  private idleRafId = 0;

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.paddle.y = this.H - 20;
    this.startIdle();
  }

  onMouseMove(e: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.paddle.x = (e.clientX - rect.left) * (this.W / rect.width);
    if (!this.running) this.startGame();
  }

  onTouchMove(e: TouchEvent) {
    e.preventDefault();
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.paddle.x = (e.touches[0].clientX - rect.left) * (this.W / rect.width);
    if (!this.running) this.startGame();
  }

  private startGame() {
    cancelAnimationFrame(this.idleRafId);
    this.running = true;
    this.score = 0;
    this.lives = 3;
    this.bolts = [];
    this.spawnInterval = 1400;
    this.status = 'survive';
    this.lastTime = 0;
    this.rafId = requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  private startIdle() {
    const loop = (ts: number) => {
      if (this.running) return;
      this.drawGrid();
      const ctx = this.ctx;
      ctx.save();
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = `rgba(58,111,255,${0.3 + 0.2 * Math.sin(ts / 600)})`;
      ctx.textAlign = 'center';
      ctx.fillText('MOVE CURSOR OVER CANVAS TO START', this.W / 2, this.H / 2);
      ctx.restore();
      this.idleRafId = requestAnimationFrame(loop);
    };
    this.idleRafId = requestAnimationFrame(loop);
  }

  private gameLoop(ts: number) {
    if (!this.running) return;
    const dt = ts - (this.lastTime || ts);
    this.lastTime = ts;

    this.spawnTimer += dt;
    if (this.spawnTimer > this.spawnInterval) {
      this.spawnBolt();
      this.spawnTimer = 0;
      this.spawnInterval = Math.max(500, this.spawnInterval - 18);
    }

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);
    this.drawGrid();

    // paddle
    const px = Math.max(this.paddle.w / 2, Math.min(this.W - this.paddle.w / 2, this.paddle.x));
    ctx.save();
    ctx.shadowColor = '#3a6fff';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#3a6fff';
    ctx.fillRect(px - this.paddle.w / 2, this.paddle.y, this.paddle.w, this.paddle.h);
    ctx.restore();

    this.bolts = this.bolts.filter((b) => {
      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > 10) b.trail.shift();
      b.x += b.vx;
      b.y += b.vy;

      // paddle hit
      if (
        b.y + b.r >= this.paddle.y &&
        b.y - b.r <= this.paddle.y + this.paddle.h &&
        b.x >= px - this.paddle.w / 2 &&
        b.x <= px + this.paddle.w / 2
      ) {
        this.score++;
        b.vy = -(Math.abs(b.vy) * 0.9 + 1);
        b.vx += (Math.random() - 0.5) * 0.8;
        this.audio.playClick();
        return true;
      }

      // ground
      if (b.y > this.H + 20) {
        this.lives--;
        if (this.lives <= 0) {
          this.running = false;
          this.status = `game over — score: ${this.score} — hover to retry`;
          this.score = 0;
          this.lives = 3;
          this.startIdle();
        }
        return false;
      }

      if (b.y < b.r) b.vy = Math.abs(b.vy);
      if (b.x < b.r || b.x > this.W - b.r) b.vx *= -1;

      // trail
      b.trail.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, b.r * (i / b.trail.length) * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(92,143,255,${(i / b.trail.length) * 0.3})`;
        ctx.fill();
      });

      // bolt
      ctx.save();
      ctx.shadowColor = '#5c8fff';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = '#5c8fff';
      ctx.fill();
      ctx.restore();

      return true;
    });

    if (this.running) this.rafId = requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  private spawnBolt() {
    this.bolts.push({
      x: 30 + Math.random() * (this.W - 60),
      y: -10,
      vy: 2.2 + Math.random() * 2,
      vx: (Math.random() - 0.5) * 1.2,
      r: 5,
      trail: [],
    });
  }

  private drawGrid() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.strokeStyle = 'rgba(26,37,64,.45)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < this.W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.H);
      ctx.stroke();
    }
    for (let y = 0; y < this.H; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.W, y);
      ctx.stroke();
    }
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.rafId);
    cancelAnimationFrame(this.idleRafId);
  }
}
