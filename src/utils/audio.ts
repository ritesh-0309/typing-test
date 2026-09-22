import { SoundType } from '../types/typing';

class MechanicalSoundEngine {
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;

  private initContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playKey(sound: SoundType, isSpace: boolean = false, isError: boolean = false) {
    if (sound === 'off' || typeof window === 'undefined') return;

    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (isError) {
      this.playErrorSound(now);
      return;
    }

    switch (sound) {
      case 'thock':
        this.playThock(now, isSpace);
        break;
      case 'clicky':
        this.playClicky(now, isSpace);
        break;
      case 'beep':
        this.playBeep(now, isSpace);
        break;
      default:
        break;
    }
  }

  private playThock(now: number, isSpace: boolean) {
    if (!this.ctx) return;

    // Pitch variation for natural typing feel
    const randomPitch = (Math.random() - 0.5) * 40;
    const baseFreq = isSpace ? 110 : 160 + randomPitch;

    // Sub-oscillator for body "thock"
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.07);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.06);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    // Subtle transient click
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'sine';
    clickOsc.frequency.setValueAtTime(isSpace ? 400 : 700, now);
    clickOsc.frequency.exponentialRampToValueAtTime(120, now + 0.015);
    clickGain.gain.setValueAtTime(0.08, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    clickOsc.connect(clickGain);
    clickGain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
    clickOsc.start(now);
    clickOsc.stop(now + 0.02);
  }

  private playClicky(now: number, isSpace: boolean) {
    if (!this.ctx) return;

    const baseFreq = isSpace ? 1800 : 2600 + (Math.random() - 0.5) * 300;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.02);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  private playBeep(now: number, isSpace: boolean) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isSpace ? 440 : 587.33, now);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  private playErrorSound(now: number) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }
}

export const soundEngine = new MechanicalSoundEngine();
