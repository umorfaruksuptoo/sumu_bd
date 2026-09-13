/**
 * Audio Engine using Web Audio API
 * 100% Standalone - Zero external MP3 downloads required!
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.isPlayingMusic = false;
        this.currentMelodyTimeout = null;
        this.musicType = 'ambient'; // 'ambient' or 'birthday'
        this.initOnUserGesture();
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    initOnUserGesture() {
        const unlock = () => {
            this.init();
            document.removeEventListener('click', unlock);
            document.removeEventListener('touchstart', unlock);
            document.removeEventListener('keydown', unlock);
        };
        document.addEventListener('click', unlock);
        document.addEventListener('touchstart', unlock);
        document.addEventListener('keydown', unlock);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopMusic();
        } else {
            this.init();
            this.startMusic();
        }
        return this.isMuted;
    }

    // Play a gentle tone
    playTone(freq, type = 'sine', duration = 0.5, gainVal = 0.2, detune = 0) {
        if (this.isMuted || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            osc.detune.setValueAtTime(detune, this.ctx.currentTime);

            gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(gainVal, this.ctx.currentTime + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.warn(e);
        }
    }

    // Firework explosion sound effect
    playFireworkPop() {
        if (this.isMuted || !this.ctx) return;
        try {
            const t = this.ctx.currentTime;
            
            // Low thud boom
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(140 + Math.random() * 60, t);
            osc.frequency.exponentialRampToValueAtTime(30, t + 0.4);
            
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.5);

            // Crackle sparkle noise
            const bufferSize = this.ctx.sampleRate * 0.4;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
            }
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(800 + Math.random() * 400, t);

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.15, t);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);

            noise.start(t);
            noise.stop(t + 0.4);
        } catch (e) {}
    }

    // Candle blow whoosh sound
    playCandleBlow() {
        if (this.isMuted || !this.ctx) return;
        try {
            const t = this.ctx.currentTime;
            const bufferSize = this.ctx.sampleRate * 0.6;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(300, t);
            filter.frequency.linearRampToValueAtTime(700, t + 0.3);
            filter.frequency.linearRampToValueAtTime(200, t + 0.6);
            filter.Q.setValueAtTime(3, t);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.01, t);
            gain.gain.linearRampToValueAtTime(0.3, t + 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            noise.start(t);
            noise.stop(t + 0.6);
        } catch (e) {}
    }

    // Balloon pop sound
    playBalloonPop() {
        if (this.isMuted || !this.ctx) return;
        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(450, t);
            osc.frequency.exponentialRampToValueAtTime(60, t + 0.12);

            gain.gain.setValueAtTime(0.4, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.12);

            // Pop snap
            this.playTone(880, 'triangle', 0.08, 0.2);
        } catch (e) {}
    }

    // Magical chime / chime bell for interactions
    playChime(note = 587.33) { // D5 default
        if (this.isMuted || !this.ctx) return;
        this.playTone(note, 'sine', 1.2, 0.18);
        this.playTone(note * 2, 'sine', 0.8, 0.06);
    }

    // Heartbeat thump for final countdown
    playHeartbeat() {
        if (this.isMuted || !this.ctx) return;
        try {
            const t = this.ctx.currentTime;
            // Lub
            const osc1 = this.ctx.createOscillator();
            const gain1 = this.ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(75, t);
            osc1.frequency.exponentialRampToValueAtTime(40, t + 0.12);
            gain1.gain.setValueAtTime(0.4, t);
            gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
            osc1.connect(gain1);
            gain1.connect(this.ctx.destination);
            osc1.start(t);
            osc1.stop(t + 0.15);

            // Dub
            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(65, t + 0.18);
            osc2.frequency.exponentialRampToValueAtTime(35, t + 0.32);
            gain2.gain.setValueAtTime(0.3, t + 0.18);
            gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
            osc2.connect(gain2);
            gain2.connect(this.ctx.destination);
            osc2.start(t + 0.18);
            osc2.stop(t + 0.35);
        } catch (e) {}
    }

    // Happy Birthday Synthesizer Melody (Warm Music Box Style)
    playHappyBirthdayMelody(loop = true) {
        if (this.isMuted || !this.ctx) return;
        this.stopMusic();
        this.isPlayingMusic = true;
        this.musicType = 'birthday';

        // Notes and durations (Happy Birthday in F Major / C Major)
        const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, Bb4 = 466.16, C5 = 523.25;

        const score = [
            // Happy Birthday to you
            { f: C4, d: 0.35, p: 0.4 },
            { f: C4, d: 0.25, p: 0.3 },
            { f: D4, d: 0.6,  p: 0.7 },
            { f: C4, d: 0.6,  p: 0.7 },
            { f: F4, d: 0.6,  p: 0.7 },
            { f: E4, d: 1.0,  p: 1.2 },

            // Happy Birthday to you
            { f: C4, d: 0.35, p: 0.4 },
            { f: C4, d: 0.25, p: 0.3 },
            { f: D4, d: 0.6,  p: 0.7 },
            { f: C4, d: 0.6,  p: 0.7 },
            { f: G4, d: 0.6,  p: 0.7 },
            { f: F4, d: 1.0,  p: 1.2 },

            // Happy Birthday dear Sumaiya
            { f: C4, d: 0.35, p: 0.4 },
            { f: C4, d: 0.25, p: 0.3 },
            { f: C5, d: 0.6,  p: 0.7 },
            { f: A4, d: 0.6,  p: 0.7 },
            { f: F4, d: 0.6,  p: 0.7 },
            { f: E4, d: 0.6,  p: 0.7 },
            { f: D4, d: 1.0,  p: 1.2 },

            // Happy Birthday to you!
            { f: Bb4, d: 0.35, p: 0.4 },
            { f: Bb4, d: 0.25, p: 0.3 },
            { f: A4,  d: 0.6,  p: 0.7 },
            { f: F4,  d: 0.6,  p: 0.7 },
            { f: G4,  d: 0.6,  p: 0.7 },
            { f: F4,  d: 1.4,  p: 1.8 }
        ];

        let offset = 0;
        score.forEach(note => {
            const timer = setTimeout(() => {
                if (this.isPlayingMusic && !this.isMuted) {
                    this.playTone(note.f, 'sine', note.d, 0.22);
                    this.playTone(note.f * 2, 'triangle', note.d * 0.7, 0.08);
                    if (note.d >= 0.6) {
                        this.playTone(note.f / 2, 'sine', note.d * 0.9, 0.12);
                    }
                }
            }, offset * 1000);
            offset += note.p;
        });

        if (loop) {
            this.currentMelodyTimeout = setTimeout(() => {
                if (this.isPlayingMusic && this.musicType === 'birthday') {
                    this.playHappyBirthdayMelody(true);
                }
            }, (offset + 1.5) * 1000);
        }
    }

    // Ambient Starlight Music Box (for countdown anticipation)
    playAmbientMusic(loop = true) {
        if (this.isMuted || !this.ctx) return;
        this.stopMusic();
        this.isPlayingMusic = true;
        this.musicType = 'ambient';

        const notes = [
            261.63, 329.63, 392.00, 523.25, // C E G C
            293.66, 349.23, 440.00, 587.33, // D F A D
            329.63, 392.00, 493.88, 659.25, // E G B E
            349.23, 440.00, 523.25, 698.46  // F A C F
        ];

        const playRandomArpeggio = () => {
            if (!this.isPlayingMusic || this.musicType !== 'ambient' || this.isMuted) return;
            const note = notes[Math.floor(Math.random() * notes.length)];
            this.playTone(note, 'sine', 1.5, 0.09);
            if (Math.random() > 0.4) {
                setTimeout(() => {
                    if (this.isPlayingMusic) {
                        this.playTone(note * 1.5, 'triangle', 1.0, 0.04);
                    }
                }, 300);
            }
            const nextDelay = 450 + Math.random() * 850;
            this.currentMelodyTimeout = setTimeout(playRandomArpeggio, nextDelay);
        };

        playRandomArpeggio();
    }

    startMusic() {
        this.init();
        if (this.musicType === 'birthday') {
            this.playHappyBirthdayMelody(true);
        } else {
            this.playAmbientMusic(true);
        }
    }

    stopMusic() {
        this.isPlayingMusic = false;
        if (this.currentMelodyTimeout) {
            clearTimeout(this.currentMelodyTimeout);
            this.currentMelodyTimeout = null;
        }
    }
}

window.soundEngine = new SoundEngine();
