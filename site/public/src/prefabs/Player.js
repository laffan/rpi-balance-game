class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "playerSpritesheet");

    this.game = scene;
    // Initialize tilt values
    this.tiltY = 0; // Range from -1 to 1
    this.tiltX = 0; // Range from -1 to 1
    this.spritesheetSize = 11; // grid size
    this.turnSpeed = 0.1;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5);

    // Physics setup

    console.log(this);

    this.body.setSize(130, 80);
    this.body.setOffset(30, 40);

    // Initially update the frame based on default tilt values
    // Should make this a little cleaner.
    this.updateFrame();


  }

  update() {
  }

  updateFrame() {
    const centerIndex = Math.floor(this.spritesheetSize / 2);

    // Convert tiltX and tiltY to frame indices
    let frameX = centerIndex + Math.round(this.tiltX * centerIndex);
    let frameY = centerIndex + Math.round(this.tiltY * centerIndex);

    let frameNumber = frameY * this.spritesheetSize + frameX;

    this.setFrame(frameNumber);
  }

  setTilt(tiltX, tiltY) {
    this.tiltX = Phaser.Math.Clamp(tiltX, -1, 1);
    this.tiltY = Phaser.Math.Clamp(tiltY, -1, 1);
    this.updateFrame();
  }
}
