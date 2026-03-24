// ---------------------------------------------------------------------------
// Retro arcade sound synthesis — Web Audio API, zero dependencies
// ---------------------------------------------------------------------------
// All sounds are generated programmatically with oscillators for an
// authentic 8-bit chiptune feel. No audio files needed.
// ---------------------------------------------------------------------------

let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  // Resume if suspended (browser autoplay policy)
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function setMuted(m: boolean) {
  muted = m;
}

export function isMuted(): boolean {
  return muted;
}

// ---------------------------------------------------------------------------
// Core synth helper
// ---------------------------------------------------------------------------

type WaveType = OscillatorType;

function playTone(
  freq: number,
  duration: number,
  type: WaveType = "square",
  volume: number = 0.15,
  freqEnd?: number,
) {
  if (muted) return;
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(freqEnd, 20),
      ac.currentTime + duration,
    );
  }

  gain.gain.setValueAtTime(volume, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);

  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + duration);
}

function playNoise(duration: number, volume: number = 0.08) {
  if (muted) return;
  const ac = getCtx();
  const bufferSize = ac.sampleRate * duration;
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ac.createBufferSource();
  source.buffer = buffer;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(volume, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);

  source.connect(gain);
  gain.connect(ac.destination);
  source.start(ac.currentTime);
}

// ---------------------------------------------------------------------------
// Sound effects
// ---------------------------------------------------------------------------

/** Snake eats food — short rising chirp */
export function playEat() {
  playTone(400, 0.08, "square", 0.12);
  setTimeout(() => playTone(600, 0.08, "square", 0.12), 50);
}

/** Paddle hit — crisp blip */
export function playPaddleHit() {
  playTone(440, 0.06, "square", 0.1);
}

/** Wall bounce — softer tick */
export function playWallBounce() {
  playTone(220, 0.04, "triangle", 0.08);
}

/** Brick break — pitch varies by row value (1-7) */
export function playBrickBreak(points: number = 1) {
  const baseFreq = 300 + points * 80;
  playTone(baseFreq, 0.1, "square", 0.12);
  playNoise(0.05, 0.04);
}

/** Ball launch — whoosh */
export function playLaunch() {
  playTone(200, 0.15, "triangle", 0.08, 400);
}

/** Score a point — pleasant ding */
export function playScorePoint() {
  playTone(660, 0.08, "square", 0.1);
  setTimeout(() => playTone(880, 0.12, "square", 0.1), 80);
}

/** Lose a life — descending tone */
export function playLoseLife() {
  playTone(400, 0.2, "square", 0.12, 100);
}

/** Game over — sad descending arpeggio */
export function playGameOver() {
  playTone(440, 0.15, "square", 0.12);
  setTimeout(() => playTone(370, 0.15, "square", 0.12), 150);
  setTimeout(() => playTone(310, 0.15, "square", 0.12), 300);
  setTimeout(() => playTone(260, 0.3, "square", 0.1), 450);
}

/** Win — ascending fanfare */
export function playWin() {
  playTone(523, 0.1, "square", 0.12);
  setTimeout(() => playTone(659, 0.1, "square", 0.12), 100);
  setTimeout(() => playTone(784, 0.1, "square", 0.12), 200);
  setTimeout(() => playTone(1047, 0.25, "square", 0.15), 300);
}
