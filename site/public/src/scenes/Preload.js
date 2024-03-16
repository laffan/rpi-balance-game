class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    let loadingBar = this.add.graphics();

    this.load.on("progress", (value) => {
      loadingBar.clear();
      loadingBar.fillStyle(0xffffff, 1);
      loadingBar.fillRect(0, this.cameras.main.centerY, value, 5);
    });

    this.load.path = "./assets/";

    // Preload spritesheet
    this.load.spritesheet("playerSpritesheet", "spritesheets/player.png", {
      frameWidth: 180,
      frameHeight: 180,
    });


    for (let i = 1; i <= 16; i++) {
      this.load.image(`tile${i}`, `img/map-tiles/tile_${i}.jpg`);
    }
    // Debug tiles
    // for (let i = 1; i <= 16; i++) {
    //   this.load.image(`tile${i}`, `img/debug-wrapper-tiles/image_${i}.jpg`);
    // }

    this.load.on("complete", () => {
      loadingBar.destroy();
      this.scene.start("PlayScene");
    });
  }
}
