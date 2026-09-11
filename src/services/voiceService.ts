import { Language, FolkTuneId } from '../types';

class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private audioCtx: AudioContext | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isMuted: boolean = false;
  private activeMelodyTimeouts: any[] = [];
  private activeOscillators: OscillatorNode[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      const loadVoices = () => {
        if (this.synth) {
          this.voices = this.synth.getVoices();
        }
      };
      loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = loadVoices;
      }
    }
  }

  private getAudioContext(): AudioContext {
    if (typeof window === 'undefined') {
      throw new Error('AudioContext not available outside browser environment');
    }
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  private getLangCode(lang: Language): string {
    switch (lang) {
      case 'as': return 'as-IN'; // Fallback will check bn-IN if as-IN not present
      case 'bn': return 'bn-IN';
      case 'mni': return 'hi-IN'; // Fallback to Hindi voice for Manipuri if not bundled
      case 'hi': return 'hi-IN';
      case 'en': return 'en-IN';
      default: return 'en-IN';
    }
  }

  public speak(text: string, lang: Language = 'en', onEnd?: () => void): void {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    try {
      this.synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const targetLang = this.getLangCode(lang);
      utterance.lang = targetLang;
      utterance.rate = 0.88; // Gentle, slower speed optimal for seniors
      utterance.pitch = 1.05; // Friendly, warm pitch for Sarthi companion

      const availableVoices = this.voices.length > 0 ? this.voices : this.synth.getVoices();
      const matchedVoice =
        availableVoices.find(v => v.lang.toLowerCase() === targetLang.toLowerCase()) ||
        availableVoices.find(v => v.lang.toLowerCase().startsWith(targetLang.split('-')[0].toLowerCase())) ||
        (lang === 'as' ? availableVoices.find(v => v.lang.toLowerCase().startsWith('bn')) : undefined) ||
        availableVoices.find(v => v.lang.includes('IN')) ||
        availableVoices[0];

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        if (onEnd) onEnd();
      };

      this.synth.speak(utterance);
    } catch {
      if (onEnd) onEnd();
    }
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  // Web Audio API procedural synthesis for North-East organic soundscapes
  public playSound(sound: 'pepa_flute' | 'temple_bell' | 'monsoon_rain' | 'lake_ripples' | 'hornbill_call' | 'success' | 'click' | 'leaf_pluck' | 'gentle_buzz' | 'bihu_dhol' | 'stream_water' | 'conch_shell'): void {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      switch (sound) {
        case 'pepa_flute': {
          // Bihu buffalo horn flute: dual harmonic reed sound with vibrato
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gainNode = ctx.createGain();

          osc1.type = 'sawtooth';
          osc1.frequency.setValueAtTime(440, now);
          osc1.frequency.linearRampToValueAtTime(494, now + 0.3);
          osc1.frequency.linearRampToValueAtTime(440, now + 0.6);

          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(880, now);

          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(0.18, now + 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

          osc1.connect(gainNode);
          osc2.connect(gainNode);
          gainNode.connect(ctx.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 1.2);
          osc2.stop(now + 1.2);
          break;
        }

        case 'temple_bell': {
          // Kamakhya bronze temple bell chime
          const freqs = [587.33, 880, 1174.66, 1760];
          freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.2 / (idx + 1), now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 2.5);
          });
          break;
        }

        case 'monsoon_rain': {
          // Cherrapunji gentle rain noise buffer
          const bufferSize = ctx.sampleRate * 1.5;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }

          const noise = ctx.createBufferSource();
          noise.buffer = buffer;

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(600, now);

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          noise.start(now);
          noise.stop(now + 1.5);
          break;
        }

        case 'lake_ripples': {
          // Gentle Loktak lake ripple: soft dual filtered bubble tones
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(440, now + 0.4);

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.8);
          break;
        }

        case 'hornbill_call': {
          // Great Indian Hornbill resonant low call
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.exponentialRampToValueAtTime(260, now + 0.2);
          osc.frequency.exponentialRampToValueAtTime(190, now + 0.5);

          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.8);
          break;
        }

        case 'success': {
          // Pleasant celebratory major triad chime
          [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.08);

            gain.gain.setValueAtTime(0, now + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.15, now + i * 0.08 + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.5);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.5);
          });
          break;
        }

        case 'leaf_pluck': {
          // Crisp satisfying leaf pluck sound
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(750, now);
          osc.frequency.exponentialRampToValueAtTime(1100, now + 0.08);
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.14, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.16);
          break;
        }

        case 'gentle_buzz': {
          // Warm soft harmonic cue - pleasant and calming for seniors, zero buzzer effect
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(392, now); // G4
          osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.2); // C5
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.08, now + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.35);
          break;
        }

        case 'bihu_dhol': {
          // Deep traditional Assamese drum with high rim slap
          const oscLow = ctx.createOscillator();
          const gainLow = ctx.createGain();
          oscLow.type = 'sine';
          oscLow.frequency.setValueAtTime(160, now);
          oscLow.frequency.exponentialRampToValueAtTime(55, now + 0.25);
          gainLow.gain.setValueAtTime(0.35, now);
          gainLow.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
          oscLow.connect(gainLow);
          gainLow.connect(ctx.destination);
          oscLow.start(now);
          oscLow.stop(now + 0.45);

          const oscSnap = ctx.createOscillator();
          const gainSnap = ctx.createGain();
          oscSnap.type = 'triangle';
          oscSnap.frequency.setValueAtTime(320, now);
          gainSnap.gain.setValueAtTime(0.15, now);
          gainSnap.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          oscSnap.connect(gainSnap);
          gainSnap.connect(ctx.destination);
          oscSnap.start(now);
          oscSnap.stop(now + 0.1);
          break;
        }

        case 'stream_water': {
          // Clear mountain stream water bubbles
          const freqs = [380, 520, 680];
          freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.12);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.3, now + idx * 0.12 + 0.2);
            gain.gain.setValueAtTime(0, now + idx * 0.12);
            gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.12 + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.12);
            osc.stop(now + idx * 0.12 + 0.35);
          });
          break;
        }

        case 'conch_shell': {
          // Kamakhya Temple sacred shankha tone
          const fundamental = 261.63; // Middle C
          [1, 2, 3].forEach((harmonic, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(fundamental * harmonic, now);
            osc.frequency.linearRampToValueAtTime(fundamental * harmonic * 1.02, now + 1.2);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.18 / (idx + 1), now + 0.3);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 2.2);
          });
          break;
        }

        case 'click':
        default: {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.08);
          break;
        }
      }
    } catch {
      // AudioContext unavailable or blocked by autoplay
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.stopFolkTune();
      this.stop();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public stopFolkTune(): void {
    this.activeMelodyTimeouts.forEach((t) => clearTimeout(t));
    this.activeMelodyTimeouts = [];
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Ignore errors from already stopped nodes
      }
    });
    this.activeOscillators = [];
  }

  public playFolkTune(tuneId: FolkTuneId, onEnd?: () => void): void {
    if (this.isMuted) {
      if (onEnd) onEnd();
      return;
    }
    this.stopFolkTune();

    try {
      const ctx = this.getAudioContext();
      const startNow = ctx.currentTime + 0.05;

      let melody: { freq: number; dur: number; type: OscillatorType; gain: number }[] = [];

      switch (tuneId) {
        case 'bihu_spring': {
          // Traditional Assamese Bihu hornpipe (Pepa) phrase with flute harmonics
          melody = [
            { freq: 659.25, dur: 0.35, type: 'sawtooth', gain: 0.12 }, // E5
            { freq: 783.99, dur: 0.35, type: 'sawtooth', gain: 0.13 }, // G5
            { freq: 880.0, dur: 0.5, type: 'sawtooth', gain: 0.15 }, // A5
            { freq: 783.99, dur: 0.3, type: 'sawtooth', gain: 0.12 }, // G5
            { freq: 659.25, dur: 0.4, type: 'sawtooth', gain: 0.12 }, // E5
            { freq: 587.33, dur: 0.3, type: 'sawtooth', gain: 0.1 }, // D5
            { freq: 659.25, dur: 0.75, type: 'sawtooth', gain: 0.14 }, // E5
          ];
          this.playSound('bihu_dhol');
          const dholTimeout = setTimeout(() => {
            if (!this.isMuted) this.playSound('bihu_dhol');
          }, 1100);
          this.activeMelodyTimeouts.push(dholTimeout);
          break;
        }

        case 'baul_melody': {
          // Soothing Baul and Rabindra Sangeet acoustic string phrase
          melody = [
            { freq: 293.66, dur: 0.4, type: 'triangle', gain: 0.15 }, // D4
            { freq: 369.99, dur: 0.4, type: 'triangle', gain: 0.15 }, // F#4
            { freq: 440.0, dur: 0.5, type: 'sine', gain: 0.16 }, // A4
            { freq: 493.88, dur: 0.45, type: 'sine', gain: 0.16 }, // B4
            { freq: 440.0, dur: 0.4, type: 'triangle', gain: 0.14 }, // A4
            { freq: 587.33, dur: 0.6, type: 'sine', gain: 0.16 }, // D5
            { freq: 440.0, dur: 0.85, type: 'triangle', gain: 0.13 }, // A4
          ];
          break;
        }

        case 'manipuri_pena': {
          // Serene Manipuri bowed string melody
          melody = [
            { freq: 523.25, dur: 0.45, type: 'sawtooth', gain: 0.1 }, // C5
            { freq: 587.33, dur: 0.45, type: 'sawtooth', gain: 0.11 }, // D5
            { freq: 698.46, dur: 0.5, type: 'sawtooth', gain: 0.12 }, // F5
            { freq: 783.99, dur: 0.55, type: 'sawtooth', gain: 0.13 }, // G5
            { freq: 698.46, dur: 0.4, type: 'sawtooth', gain: 0.11 }, // F5
            { freq: 587.33, dur: 0.45, type: 'sawtooth', gain: 0.1 }, // D5
            { freq: 523.25, dur: 0.85, type: 'sawtooth', gain: 0.11 }, // C5
          ];
          break;
        }

        case 'hill_flute': {
          // Gentle Meghalaya mountain bamboo flute
          melody = [
            { freq: 392.0, dur: 0.45, type: 'sine', gain: 0.15 }, // G4
            { freq: 493.88, dur: 0.45, type: 'sine', gain: 0.16 }, // B4
            { freq: 587.33, dur: 0.55, type: 'sine', gain: 0.17 }, // D5
            { freq: 659.25, dur: 0.5, type: 'sine', gain: 0.17 }, // E5
            { freq: 587.33, dur: 0.45, type: 'sine', gain: 0.15 }, // D5
            { freq: 392.0, dur: 0.9, type: 'sine', gain: 0.14 }, // G4
          ];
          break;
        }

        case 'temple_chime':
        default: {
          // Sacred Kamakhya Temple bell chime sequence
          melody = [
            { freq: 587.33, dur: 0.5, type: 'sine', gain: 0.16 }, // D5
            { freq: 880.0, dur: 0.5, type: 'sine', gain: 0.14 }, // A5
            { freq: 1174.66, dur: 0.6, type: 'sine', gain: 0.12 }, // D6
            { freq: 880.0, dur: 0.5, type: 'sine', gain: 0.13 }, // A5
            { freq: 587.33, dur: 1.0, type: 'sine', gain: 0.15 }, // D5
          ];
          this.playSound('conch_shell');
          break;
        }
      }

      let noteTime = startNow;
      melody.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = note.type;
        osc.frequency.setValueAtTime(note.freq, noteTime);

        gain.gain.setValueAtTime(0, noteTime);
        gain.gain.linearRampToValueAtTime(note.gain, noteTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + note.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + note.dur);

        this.activeOscillators.push(osc);
        noteTime += note.dur;
      });

      const totalMs = (noteTime - startNow) * 1000;
      const endTimeout = setTimeout(() => {
        if (onEnd) onEnd();
      }, totalMs + 100);
      this.activeMelodyTimeouts.push(endTimeout);
    } catch {
      if (onEnd) onEnd();
    }
  }
  // Speech-to-Text (STT) via Web Speech API
  private recognition: any = null;
  private _isListening: boolean = false;

  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public isListening(): boolean {
    return this._isListening;
  }

  public startListening(options: {
    lang?: Language;
    onResult: (transcript: string, isFinal: boolean) => void;
    onError?: (err: any) => void;
    onEnd?: () => void;
  }): boolean {
    if (!this.isSpeechRecognitionSupported()) {
      if (options.onError) options.onError(new Error('Speech recognition not supported in this browser'));
      return false;
    }

    try {
      this.stopListening();
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;

      const langCode = this.getLangCode(options.lang || 'en');
      this.recognition.lang = langCode;

      this.recognition.onstart = () => {
        this._isListening = true;
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        const isFinal = !!finalTranscript;
        if (currentText) {
          options.onResult(currentText.trim(), isFinal);
        }
      };

      this.recognition.onerror = (event: any) => {
        this._isListening = false;
        if (options.onError) {
          options.onError(event.error || event);
        }
      };

      this.recognition.onend = () => {
        this._isListening = false;
        if (options.onEnd) {
          options.onEnd();
        }
      };

      this.recognition.start();
      return true;
    } catch (err) {
      this._isListening = false;
      if (options.onError) options.onError(err);
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // Ignore abort errors
      }
      this.recognition = null;
    }
    this._isListening = false;
  }
}

export const voiceService = new VoiceService();

export function speak(text: string, lang: Language = 'en', onEnd?: () => void): void {
  voiceService.speak(text, lang, onEnd);
}

export function stopSpeaking(): void {
  voiceService.stop();
}

export function playSound(sound: 'pepa_flute' | 'temple_bell' | 'monsoon_rain' | 'lake_ripples' | 'hornbill_call' | 'success' | 'click' | 'leaf_pluck' | 'gentle_buzz' | 'bihu_dhol' | 'stream_water' | 'conch_shell'): void {
  voiceService.playSound(sound);
}

export function isSpeechRecognitionSupported(): boolean {
  return voiceService.isSpeechRecognitionSupported();
}

export function startListening(options: {
  lang?: Language;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (err: any) => void;
  onEnd?: () => void;
}): boolean {
  return voiceService.startListening(options);
}

export function stopListening(): void {
  voiceService.stopListening();
}

export function playFolkTune(tuneId: FolkTuneId, onEnd?: () => void): void {
  voiceService.playFolkTune(tuneId, onEnd);
}

export function stopFolkTune(): void {
  voiceService.stopFolkTune();
}

export function setSoundMuted(muted: boolean): void {
  voiceService.setMuted(muted);
}

export function isSoundMuted(): boolean {
  return voiceService.getIsMuted();
}

export default voiceService;
