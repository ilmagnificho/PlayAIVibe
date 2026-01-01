import Phaser from 'phaser';
import { 
  GAME_WIDTH, GAME_HEIGHT, NOTE_FALL_TIME_MS, 
  HIT_LINE_Y, LANE_START_X, LANE_WIDTH, 
  COLORS, INPUT_KEYS, SPAWN_Y 
} from '../config';
import Note from '../objects/Note';
import { BeatmapNote } from '../../types';
import { TWINKLE_BEATMAP, TWINKLE_MELODY_MAP } from '../data/songs';

export default class RhythmScene extends Phaser.Scene {
  // Fix TS errors: Explicitly declare inherited properties
  public load!: Phaser.Loader.LoaderPlugin;
  public cache!: Phaser.Cache.CacheManager;
  public sound!: Phaser.Sound.BaseSoundManager | Phaser.Sound.WebAudioSoundManager | Phaser.Sound.HTML5AudioSoundManager;
  public add!: Phaser.GameObjects.GameObjectFactory;
  public input!: Phaser.Input.InputPlugin;
  public tweens!: Phaser.Tweens.TweenManager;
  public time!: Phaser.Time.Clock;

  // Game State
  private notes: BeatmapNote[] = [];
  private activeNotes: Note[] = [];
  private startTime: number = 0;
  private isPlaying: boolean = false;
  private score: number = 0;
  private combo: number = 0;

  // Audio
  private music: Phaser.Sound.BaseSound | null = null;
  private useSynthFallback: boolean = false;
  private synthMelody = TWINKLE_MELODY_MAP;

  // UI / Interaction
  private laneEffects: Phaser.GameObjects.Rectangle[] = [];
  private hitLine: Phaser.GameObjects.Rectangle | null = null;
  private scoreCallback: ((score: number, combo: number) => void) | null = null;

  // Pointers for beatmap processing
  private spawnIndex: number = 0;

  constructor() {
    super('RhythmScene');
  }

  init(data: { onScoreUpdate: (s: number, c: number) => void }) {
    this.scoreCallback = data.onScoreUpdate;
    this.score = 0;
    this.combo = 0;
    this.spawnIndex = 0;
    this.activeNotes = [];
    this.useSynthFallback = false;
  }

  preload() {
    // 1. Attempt to load real assets from public folder
    this.load.audio('song', 'song.mp3'); 
    // We no longer rely on external JSON for the trial to avoid 404s
  }

  create() {
    this.createBackground();
    this.createLanes();
    this.setupInputs();
    
    // Process Beatmap Data - DIRECTLY USE IMPORTED DATA
    // This solves the "sample-map.json not found" error permanently
    this.notes = [...TWINKLE_BEATMAP].sort((a, b) => a.time - b.time);

    // Audio Setup
    if (this.cache.audio.exists('song')) {
        this.music = this.sound.add('song');
    } else {
        console.log('Audio file not found. Activating Synth Fallback (Twinkle Twinkle Mode).');
        this.useSynthFallback = true;
    }

    // Start Overlay
    this.createStartOverlay();
  }

  update(time: number, delta: number) {
    if (!this.isPlaying) return;

    const currentTime = this.getCurrentTime();

    // 1. Spawn Notes
    while (this.spawnIndex < this.notes.length) {
      const noteData = this.notes[this.spawnIndex];
      const spawnTime = noteData.time - (NOTE_FALL_TIME_MS / 1000);

      if (currentTime >= spawnTime) {
        this.spawnNote(noteData);
        this.spawnIndex++;
      } else {
        break; 
      }
    }

    // 2. Update Active Notes (Sync position to time)
    for (let i = this.activeNotes.length - 1; i >= 0; i--) {
      const note = this.activeNotes[i];
      const timeUntilHit = note.noteData.time - currentTime;
      const distanceToTravel = HIT_LINE_Y - SPAWN_Y;
      const speed = distanceToTravel / (NOTE_FALL_TIME_MS / 1000);
      
      const newY = HIT_LINE_Y - (timeUntilHit * speed);
      note.y = newY;

      // Check for Miss (Passed the line by a margin)
      if (timeUntilHit < -0.2 && !note.isHit) { // 200ms late
        this.handleMiss(note);
        this.activeNotes.splice(i, 1);
      }
    }
  }

  // --- Core Logic ---

  private getCurrentTime(): number {
    if (this.music && this.music.isPlaying) {
      return (this.music as any).seek; 
    }
    // Fallback Timer
    return (this.time.now - this.startTime) / 1000;
  }

  // Helper to play a tone using WebAudio API
  private playTone(freq: number, type: 'hit' | 'miss' = 'hit') {
      const ctx = this.sound.context as AudioContext;
      if (!ctx) return;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = type === 'hit' ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      const duration = 0.15;
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
  }

  private spawnNote(data: BeatmapNote) {
    const x = LANE_START_X + (data.lane * LANE_WIDTH);
    const note = new Note(this, x, SPAWN_Y, data);
    this.activeNotes.push(note);
  }

  private handleInput(laneIndex: number) {
    this.triggerLaneEffect(laneIndex);

    const currentTime = this.getCurrentTime();
    let hitNote: Note | null = null;
    let minDiff = Infinity;

    for (const note of this.activeNotes) {
      if (note.noteData.lane === laneIndex && !note.isHit) {
        const diff = Math.abs(currentTime - note.noteData.time);
        if (diff < minDiff) {
            minDiff = diff;
            hitNote = note;
        }
      }
    }

    if (hitNote) {
      if (minDiff <= 0.20) { // Forgiving hit window for testing
        this.handleHit(hitNote, minDiff);
      }
    }
  }

  private handleHit(note: Note, diff: number) {
    note.consume();
    this.activeNotes = this.activeNotes.filter(n => n !== note);

    // Play Synth Feedback if fallback is on
    if (this.useSynthFallback) {
        // Find closest melody pitch
        // We look for a key in the map close to this note's time
        let bestTime = -1;
        let minTimeDiff = 0.3;
        
        for (const tStr in this.synthMelody) {
            const t = parseFloat(tStr);
            const d = Math.abs(t - note.noteData.time);
            if (d < minTimeDiff) {
                minTimeDiff = d;
                bestTime = t;
            }
        }
        
        const freq = bestTime !== -1 ? this.synthMelody[bestTime] : 440;
        this.playTone(freq, 'hit');
    }

    // Scoring
    let points = 0;
    let text = '';
    let color = 0xffffff;

    if (diff <= 0.05) {
        points = 300;
        text = 'PERFECT';
        color = COLORS.TEXT_PERFECT;
    } else if (diff <= 0.1) {
        points = 100;
        text = 'GOOD';
        color = COLORS.TEXT_GOOD;
    } else {
        points = 50;
        text = 'BAD';
        color = COLORS.TEXT_MISS;
    }

    this.score += points;
    this.combo++;
    this.updateReactUI();
    this.showJudgementText(text, color);
    this.createHitParticles(note.x, HIT_LINE_Y, color);
  }

  private handleMiss(note: Note) {
    note.miss();
    this.combo = 0;
    this.updateReactUI();
    this.showJudgementText('MISS', COLORS.TEXT_MISS);
    
    // Optional: play miss sound
    // if (this.useSynthFallback) this.playTone(150, 'miss');
  }

  private updateReactUI() {
    if (this.scoreCallback) {
        this.scoreCallback(this.score, this.combo);
    }
  }

  // --- Visuals & Setup ---

  private createStartOverlay() {
    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'CLICK TO START\n(Twinkle Twinkle)', {
        fontSize: '32px',
        color: '#8B5CF6',
        fontStyle: 'bold',
        align: 'center',
        shadow: { blur: 10, color: '#8B5CF6', fill: true }
    }).setOrigin(0.5);

    this.tweens.add({
        targets: text,
        scale: 1.1,
        yoyo: true,
        repeat: -1,
        duration: 800
    });

    this.input.once('pointerdown', () => {
        text.destroy();
        this.startGame();
    });
  }

  private startGame() {
    this.startTime = this.time.now;
    this.isPlaying = true;
    if (this.music) {
        this.music.play();
    }
  }

  private createBackground() {
    const gridColor = 0x8B5CF6;
    for (let x = 0; x < GAME_WIDTH; x += 40) {
        this.add.line(0, 0, x, 0, x, GAME_HEIGHT, gridColor, 0.05).setOrigin(0);
    }
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 1, 1, 0, 0);
    graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  private createLanes() {
    for (let i = 0; i <= 4; i++) {
        const x = LANE_START_X - (LANE_WIDTH/2) + (i * LANE_WIDTH);
        this.add.line(0, 0, x, 0, x, GAME_HEIGHT, 0xffffff, 0.1).setOrigin(0);
    }

    this.hitLine = this.add.rectangle(GAME_WIDTH / 2, HIT_LINE_Y, LANE_WIDTH * 4, 2, COLORS.HIT_LINE);
    this.hitLine.setPostPipeline('Light2D');
    
    for (let i = 0; i < 4; i++) {
       const x = LANE_START_X + (i * LANE_WIDTH);
       const rect = this.add.rectangle(x, 0, LANE_WIDTH, GAME_HEIGHT, 0xffffff, 0);
       rect.setBlendMode(Phaser.BlendModes.ADD);
       this.laneEffects.push(rect);
       
       const labelColor = (i === 0 || i === 3) ? '#8B5CF6' : '#06B6D4';
       this.add.text(x, HIT_LINE_Y + 50, INPUT_KEYS[i], {
           fontSize: '24px',
           color: labelColor,
           fontStyle: 'bold'
       }).setOrigin(0.5);
    }
  }

  private setupInputs() {
    // 1. Keyboard Input (Phaser internal)
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
        // CRITICAL FIX: Prevent default browser behavior (zooming, finding, etc) for game keys
        const key = event.key.toUpperCase();
        if (INPUT_KEYS.includes(key)) {
            event.preventDefault(); // Stop the browser from doing anything else
            
            const laneIndex = INPUT_KEYS.indexOf(key);
            if (laneIndex !== -1) {
                this.handleInput(laneIndex);
            }
        }
    });

    // 2. Touch/Mouse Input (Clicking lanes)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (pointer.y > HIT_LINE_Y - 100) { 
            const laneIndex = Math.floor((pointer.x - (LANE_START_X - LANE_WIDTH/2)) / LANE_WIDTH);
            if (laneIndex >= 0 && laneIndex < 4) {
                this.handleInput(laneIndex);
            }
        }
    });
  }

  private triggerLaneEffect(index: number) {
    if (!this.laneEffects[index]) return; 
    const effect = this.laneEffects[index];
    effect.alpha = 0.3;
    
    if (index === 0 || index === 3) {
        effect.fillColor = COLORS.LANE_0; 
    } else {
        effect.fillColor = COLORS.LANE_1; 
    }
    
    this.tweens.add({
        targets: effect,
        alpha: 0,
        duration: 150
    });
  }

  private showJudgementText(text: string, color: number) {
    const txt = this.add.text(GAME_WIDTH / 2, HIT_LINE_Y - 120, text, {
        fontSize: '56px',
        color: '#' + color.toString(16),
        fontStyle: 'bold',
        stroke: '#ffffff',
        strokeThickness: 2,
        shadow: { blur: 15, color: '#' + color.toString(16), fill: true }
    }).setOrigin(0.5);

    this.tweens.add({
        targets: txt,
        scale: { from: 1.5, to: 1 },
        y: HIT_LINE_Y - 150,
        alpha: 0,
        duration: 400,
        onComplete: () => txt.destroy()
    });
  }

  private createHitParticles(x: number, y: number, color: number) {
     const emitter = this.add.particles(0, 0, 'flare', {
        x: x,
        y: y,
        speed: { min: 100, max: 300 },
        angle: { min: 180, max: 360 },
        scale: { start: 0.4, end: 0 },
        blendMode: 'ADD',
        lifespan: 300,
        gravityY: 0,
        quantity: 8,
        tint: color,
        emitting: false
     });
     emitter.explode(10, x, y);
  }
}