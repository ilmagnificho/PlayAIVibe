import Phaser from 'phaser';
import { 
  GAME_WIDTH, GAME_HEIGHT, NOTE_FALL_TIME_MS, 
  HIT_LINE_Y, LANE_START_X, LANE_WIDTH, 
  COLORS, INPUT_KEYS, SPAWN_Y 
} from '../config';
import Note from '../objects/Note';
import { BeatmapNote } from '../../types';

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
  private fallbackTime: number = 0; // Used if audio fails to load

  // UI / Interaction
  private keyCodes: Phaser.Input.Keyboard.Key[] = [];
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
  }

  preload() {
    // 1. Attempt to load real assets from public folder
    // Note: In a real environment, ensure these files exist in /public
    this.load.audio('song', 'song.mp3'); 
    this.load.json('beatmap', 'beatmap.json');

    // 2. Load Fallback assets (images used for particles/etc) if needed
    // Using procedural generation for graphics to avoid external dependency for MVP
  }

  create() {
    this.createBackground();
    this.createLanes();
    this.setupInputs();
    
    // Process Beatmap Data
    let beatmapData: BeatmapNote[] = [];
    
    if (this.cache.json.exists('beatmap')) {
      beatmapData = this.cache.json.get('beatmap');
    } else {
      console.warn('Beatmap JSON not found. generating demo data.');
      beatmapData = this.generateDemoBeatmap();
    }
    
    // Sort notes by time (crucial for sync)
    this.notes = beatmapData.sort((a, b) => a.time - b.time);

    // Audio Setup
    if (this.sound.get('song')) {
        this.music = this.sound.add('song');
    } else {
        console.warn('Audio file not found. Using timer fallback.');
    }

    // Start Overlay
    this.createStartOverlay();
  }

  update(time: number, delta: number) {
    if (!this.isPlaying) return;

    const currentTime = this.getCurrentTime();

    // 1. Spawn Notes
    // Logic: If (NoteTime - FallTime) <= CurrentTime, spawn it.
    while (this.spawnIndex < this.notes.length) {
      const noteData = this.notes[this.spawnIndex];
      const spawnTime = noteData.time - (NOTE_FALL_TIME_MS / 1000);

      if (currentTime >= spawnTime) {
        this.spawnNote(noteData);
        this.spawnIndex++;
      } else {
        break; // Notes are sorted, so we can stop checking
      }
    }

    // 2. Update Active Notes (Sync position to time)
    for (let i = this.activeNotes.length - 1; i >= 0; i--) {
      const note = this.activeNotes[i];
      
      // Calculate exact Y position based on time difference
      // position = target - (timeRemaining * speed)
      // Speed = Distance / Time
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
      // Phaser's audio time is usually precise
      return (this.music as any).seek; 
    }
    // Fallback: Use standard delta accumulation
    return (this.time.now - this.startTime) / 1000;
  }

  private spawnNote(data: BeatmapNote) {
    const x = LANE_START_X + (data.lane * LANE_WIDTH);
    const note = new Note(this, x, SPAWN_Y, data);
    this.activeNotes.push(note);
  }

  private handleInput(laneIndex: number) {
    // Visual Feedback
    this.triggerLaneEffect(laneIndex);

    const currentTime = this.getCurrentTime();
    let hitNote: Note | null = null;
    let minDiff = Infinity;

    // Find closest note in this lane
    for (const note of this.activeNotes) {
      if (note.noteData.lane === laneIndex && !note.isHit) {
        const diff = Math.abs(currentTime - note.noteData.time);
        if (diff < minDiff) {
            minDiff = diff;
            hitNote = note;
        }
      }
    }

    // Hit Window judgement (in seconds)
    // Perfect: 0.050s, Good: 0.100s, Bad: 0.150s
    if (hitNote) {
      if (minDiff <= 0.15) {
        this.handleHit(hitNote, minDiff);
      }
    }
  }

  private handleHit(note: Note, diff: number) {
    note.consume();
    this.activeNotes = this.activeNotes.filter(n => n !== note);

    // Scoring
    let points = 0;
    let text = '';
    let color = 0xffffff;

    if (diff <= 0.05) {
        points = 300;
        text = 'PERFECT';
        color = 0x00e5ff;
    } else if (diff <= 0.1) {
        points = 100;
        text = 'GOOD';
        color = 0x00ff00;
    } else {
        points = 50;
        text = 'BAD';
        color = 0xff0000;
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
    this.showJudgementText('MISS', 0xff0000);
  }

  private updateReactUI() {
    if (this.scoreCallback) {
        this.scoreCallback(this.score, this.combo);
    }
  }

  // --- Visuals & Setup ---

  private createStartOverlay() {
    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'CLICK TO START', {
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold'
    }).setOrigin(0.5);

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
    // Simple Gradient Grid
    const grid = this.add.grid(
        GAME_WIDTH/2, GAME_HEIGHT/2, 
        GAME_WIDTH, GAME_HEIGHT, 
        40, 40, 
        0x000000, 0, 
        0x222222, 0.2
    );
  }

  private createLanes() {
    // Lane Dividers
    for (let i = 0; i <= 4; i++) {
        const x = LANE_START_X - (LANE_WIDTH/2) + (i * LANE_WIDTH);
        this.add.line(0, 0, x, 0, x, GAME_HEIGHT, 0xffffff, 0.1).setOrigin(0);
    }

    // Hit Line
    this.hitLine = this.add.rectangle(GAME_WIDTH / 2, HIT_LINE_Y, LANE_WIDTH * 4, 4, COLORS.HIT_LINE);
    
    // Lane Effects (Key press glow)
    for (let i = 0; i < 4; i++) {
       const x = LANE_START_X + (i * LANE_WIDTH);
       const rect = this.add.rectangle(x, 0, LANE_WIDTH, GAME_HEIGHT, 0xffffff, 0);
       rect.setBlendMode(Phaser.BlendModes.ADD);
       this.laneEffects.push(rect);
       
       // Add Key Label
       this.add.text(x, HIT_LINE_Y + 40, INPUT_KEYS[i], {
           fontSize: '24px',
           color: '#888'
       }).setOrigin(0.5);
    }
  }

  private setupInputs() {
    this.keyCodes = INPUT_KEYS.map(k => this.input.keyboard!.addKey(k));
    
    this.keyCodes.forEach((key, index) => {
        key.on('down', () => {
            this.handleInput(index);
        });
    });
  }

  private triggerLaneEffect(index: number) {
    const effect = this.laneEffects[index];
    effect.alpha = 0.2;
    effect.fillColor = (index === 0 || index === 3) ? COLORS.LANE_0 : COLORS.LANE_1;
    
    this.tweens.add({
        targets: effect,
        alpha: 0,
        duration: 150
    });
  }

  private showJudgementText(text: string, color: number) {
    const txt = this.add.text(GAME_WIDTH / 2, HIT_LINE_Y - 100, text, {
        fontSize: '48px',
        color: '#' + color.toString(16),
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(0.5);

    this.tweens.add({
        targets: txt,
        y: HIT_LINE_Y - 150,
        alpha: 0,
        duration: 500,
        onComplete: () => txt.destroy()
    });
  }

  private createHitParticles(x: number, y: number, color: number) {
     const emitter = this.add.particles(0, 0, 'flare', {
        x: x,
        y: y,
        speed: { min: 50, max: 200 },
        angle: { min: 180, max: 360 },
        scale: { start: 0.5, end: 0 },
        blendMode: 'ADD',
        lifespan: 300,
        gravityY: 500,
        quantity: 5,
        emitting: false
     });
     // If texture missing, it renders square particles by default in newer Phaser
     emitter.explode(10, x, y);
  }

  // --- Helpers ---
  private generateDemoBeatmap(): BeatmapNote[] {
      const notes: BeatmapNote[] = [];
      // Generate a simple rhythmic pattern
      for (let i = 2; i < 60; i += 0.5) {
          notes.push({
              time: i,
              lane: Math.floor(Math.random() * 4) as 0|1|2|3,
              type: 'short'
          });
      }
      return notes;
  }
}