import Phaser from 'phaser';
import { LANE_WIDTH, COLORS } from '../config';
import { BeatmapNote } from '../../types';

export default class Note extends Phaser.GameObjects.Container {
  public noteData: BeatmapNote;
  public isHit: boolean = false;
  
  // Fix TS errors: Explicitly declare inherited properties
  public scene!: Phaser.Scene;
  public x!: number;
  public y!: number;
  public add!: (child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) => this;
  public destroy!: (fromScene?: boolean) => void;

  private visual: Phaser.GameObjects.Rectangle;
  private glow: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, x: number, y: number, noteData: BeatmapNote) {
    super(scene, x, y);
    this.noteData = noteData;

    // Determine Color based on lane
    let color;
    switch (noteData.lane) {
        case 0: color = COLORS.LANE_0; break;
        case 1: color = COLORS.LANE_1; break;
        case 2: color = COLORS.LANE_2; break;
        case 3: color = COLORS.LANE_3; break;
        default: color = 0xffffff;
    }

    // Create Note Visual (Neon Bar style)
    const noteHeight = 16;
    this.visual = scene.add.rectangle(0, 0, LANE_WIDTH - 12, noteHeight, color);
    
    // Add strong glow effect for "Neon" look
    this.visual.setStrokeStyle(2, 0xffffff, 0.8);
    
    // Inner Glow
    this.glow = scene.add.circle(0, 0, LANE_WIDTH / 2.5, color, 0.3);
    
    this.add([this.glow, this.visual]);
    scene.add.existing(this);

    // Pulse animation
    scene.tweens.add({
      targets: this.glow,
      scaleX: 1.1,
      scaleY: 1.1,
      alpha: 0.1,
      yoyo: true,
      repeat: -1,
      duration: 200
    });
  }

  public consume() {
    this.isHit = true;
    
    // Quick scale up before destroy for feedback
    this.scene.tweens.add({
        targets: this.visual,
        scaleX: 1.5,
        scaleY: 1.5,
        alpha: 0,
        duration: 100,
        onComplete: () => this.destroy()
    });
  }

  public miss() {
    // Fade out and destroy
    this.scene.tweens.add({
        targets: this,
        alpha: 0,
        y: this.y + 50,
        duration: 200,
        onComplete: () => this.destroy()
    });
  }
}