const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 480,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, 
      // debug: true,
    },
  },
  scene: [PreloadScene, PlayScene, UIScene],
};

const game = new Phaser.Game(config);
