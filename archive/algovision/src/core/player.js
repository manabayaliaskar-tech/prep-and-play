// Проигрыватель шагов: как видеоплеер, только вместо кадров — шаги алгоритма.
// Ничего не знает о сортировках или графах: только «какой шаг показать сейчас».

export const SPEED_MIN = 1;
export const SPEED_MAX = 10;

/** Скорость 1…10 → пауза между шагами в миллисекундах. */
export function speedToDelay(level) {
  const l = clampSpeed(level);
  return Math.max(4, Math.round(900 * Math.pow(0.58, l - 1)));
}

/** На самых высоких скоростях делаем несколько шагов за один «тик». */
export function speedToBatch(level) {
  const l = clampSpeed(level);
  if (l >= 10) return 6;
  if (l >= 9) return 2;
  return 1;
}

function clampSpeed(level) {
  const n = Number(level);
  if (!Number.isFinite(n)) return 5;
  return Math.min(SPEED_MAX, Math.max(SPEED_MIN, Math.round(n)));
}

export class StepPlayer {
  #timer = null;
  #playing = false;

  constructor({ delay = () => 200, batch = () => 1, onRender = () => {}, onStateChange = () => {} } = {}) {
    this.delay = delay;
    this.batch = batch;
    this.onRender = onRender;
    this.onStateChange = onStateChange;
    this.total = 0;
    this.index = 0;
  }

  get playing() {
    return this.#playing;
  }

  get atEnd() {
    return this.index >= this.total - 1;
  }

  load(total) {
    this.pause();
    this.total = total;
    this.index = 0;
    if (total > 0) this.onRender(0, -1);
    this.#emit();
  }

  play() {
    if (this.total === 0 || this.#playing) return;
    if (this.atEnd) this.seek(0);
    this.#playing = true;
    this.#emit();
    this.#schedule();
  }

  pause() {
    clearTimeout(this.#timer);
    this.#timer = null;
    if (this.#playing) {
      this.#playing = false;
      this.#emit();
    }
  }

  toggle() {
    if (this.#playing) this.pause();
    else this.play();
  }

  next() {
    if (this.atEnd) {
      this.pause();
      return false;
    }
    const prev = this.index;
    this.index += 1;
    this.onRender(this.index, prev);
    this.#emit();
    return true;
  }

  prev() {
    if (this.index <= 0) return false;
    const prev = this.index;
    this.index -= 1;
    this.onRender(this.index, prev);
    this.#emit();
    return true;
  }

  seek(target) {
    if (this.total === 0) return;
    const clamped = Math.min(this.total - 1, Math.max(0, Math.round(target)));
    if (clamped === this.index) return;
    const prev = this.index;
    this.index = clamped;
    this.onRender(this.index, prev);
    this.#emit();
  }

  #schedule() {
    this.#timer = setTimeout(() => this.#tick(), this.delay());
  }

  #tick() {
    this.#timer = null;
    if (!this.#playing) return;
    const steps = Math.max(1, this.batch());
    for (let k = 0; k < steps && this.#playing; k++) {
      if (!this.next()) break;
    }
    if (this.atEnd) this.pause();
    else if (this.#playing) this.#schedule();
  }

  #emit() {
    this.onStateChange({ index: this.index, total: this.total, playing: this.#playing });
  }
}
