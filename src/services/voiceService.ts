import { Language } from '../types';

class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private audioCtx: AudioContext | null = null;
  private voices: SpeechSynthesisVoice[] = [];

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
          // Gentle low boop/buzz for caterpillar touch (gentle for seniors)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.linearRampToValueAtTime(120, now + 0.2);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.25);
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

export function isListening(): boolean {
  return voiceService.isListening();
}

export default voiceService;
