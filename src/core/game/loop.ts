interface LoopCallbacks {
  onUpdate: (dt: number) => void;
  onRender: () => void;
}

export class GameLoop {
  private rafId = 0;
  private lastTime = 0;
  private running = false;
  private paused = false;

  constructor(private readonly callbacks: LoopCallbacks) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
    this.lastTime = performance.now();
  }

  private tick = (now: number): void => {
    if (!this.running) return;
    const dt = Math.min((now - this.lastTime) / 1000, 1 / 22);
    this.lastTime = now;

    if (!this.paused) {
      this.callbacks.onUpdate(dt);
    }
    this.callbacks.onRender();

    this.rafId = requestAnimationFrame(this.tick);
  };
}
