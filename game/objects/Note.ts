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
    const color = (noteData.lane === 0 || noteData.lane === 3) 
      ? COLORS.LANE_0 
      : COLORS.LANE_1;

    // Create Note Visual
    const noteHeight = 20;
    this.visual = scene.add.rectangle(0, 0, LANE_WIDTH - 10, noteHeight, color);
    this.visual.setStrokeStyle(2, 0xffffff);
    
    // Add Glow effect
    this.glow = scene.add.circle(0, 0, LANE_WIDTH / 2, color, 0.4);
    
    this.add([this.glow, this.visual]);
    scene.add.existing(this);

    // Initial glow animation
    scene.tweens.add({
      targets: this.glow,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0.1,
      yoyo: true,
      repeat: -1,
      duration: 300
    });
  }

  public consume() {
    this.isHit = true;
    this.destroy();
  }

  public miss() {
    // Fade out and destroy
    this.scene.tweens.add({
        targets: this,
        alpha: 0,
        duration: 200,
        onComplete: () => this.destroy()
    });
  }
}