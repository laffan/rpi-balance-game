class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: "UIScene", active: true });
  }

  create() {
    this.counter = 0;
    const { width, height } = this.cameras.main;
    this.backgroundCircle = this.add.circle(
      width / 2,
      height + 10,
      100,
      0x000000,
      0.3
    );
    this.backgroundCircle.setOrigin(0.5, 0.5);

    this.label = this.add
      .text(width / 2, height - 70, "0", {
        font: "50px Arial",
        fill: "#ffffff",
      })
      .setScrollFactor(0)
      .setOrigin(0.5, 0);
    this.scene
      .get("PlayScene")
      .events.on("updateTimer", this.updateTimer, this);
  }

  updateTimer(timer) {
    this.label.setText(timer);
    // Make it red when you're resetting
    if (timer < 1) {
      this.backgroundCircle.setFillStyle(0xff0000, 0.5);
    } else {
      this.backgroundCircle.setFillStyle(0x000000, 0.5); 
    }
  }
}
