class PlayScene extends Phaser.Scene {
  constructor() {
    super({ key: "PlayScene" });

    // Tilemap setup
    this.gridSize = 4;
    this.tileSize = 2000;
    this.tileStartX = -1000;
    this.tileStartY = -1000;

    // Player options
    this.forwardSpeed = 200;
    this.turnSpeed = 0.1;
    this.currentZoom = 1;
    this.minZoom = 0.2;
    this.maxZoom = 0.7;
    this.zoomSpeed = 0.002;

    // Camera options
    this.followOffsetY = 100;
    this.edgeDetectOffset = -200;

    // Initializers
    this.tiles = [];
    this.tileOrder = [];
    this.player = null;
  }

  initializeTileOrder() {
    let count = 1;
    for (let y = 0; y < this.gridSize; y++) {
      this.tileOrder[y] = [];
      for (let x = 0; x < this.gridSize; x++) {
        this.tileOrder[y][x] = count++;
      }
    }
  }

  create() {
    this.initializeTileOrder();
    this.renderTiles();

    this.player = new Player(
      this,
      this.cameras.main.width / 2,
      this.cameras.main.height
    );

    this.player.setDepth(1);

    this.cursors = this.input.keyboard.createCursorKeys();

    // Connect to WebSocket
    const ws = new WebSocket("ws://0.0.0.0:3000");
    // const ws = new WebSocket("ws://10.0.0.129:3000");
    ws.onmessage = async (event) => {
      if (event.data instanceof Blob) {
        const data = await event.data.text();
        const [x, y, z, pitch, roll] = data.split(",").map(parseFloat);
        this.lastX = x;
        this.lastY = y;
        this.lastZ = z;
        this.lastPitch = pitch;
        this.lastRoll = roll;

        if (roll > 20 || roll < -30) {
          this.timer = 0;
          this.events.emit("updateTimer", 0);
        }
      }
    };

    this.setPlayerForwardVelocity();

    this.cameras.main.zoom = this.currentZoom;

    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
    this.cameras.main.setFollowOffset(0, this.followOffsetY);

    this.timer = 0;
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timer++;
        this.events.emit("updateTimer", this.timer);
      },
      callbackScope: this,
      loop: true,
    });

    // Every second check tile visibility
    this.time.addEvent({
      delay: 1000,
      callback: this.checkVisible,
      callbackScope: this,
      loop: true,
    });
  }

  update() {
    // Constant forward movement in the direction the player is facing

    // Rotating the player based on input
    if (this.lastX < -0.1 || this.cursors.left.isDown) {
      this.player.angle -= this.turnSpeed;
    } else if (this.lastX > 0.1 || this.cursors.right.isDown) {
      this.player.angle += this.turnSpeed;
    }

    if (this.lastY > 0.1 || this.cursors.up.isDown) {
      this.currentZoom += this.zoomSpeed;
    } else if (this.lastY < -0.1 || this.cursors.down.isDown) {
      this.currentZoom -= this.zoomSpeed;
    }

    this.setPlayerForwardVelocity();
    this.setZoom();
    this.setRotation();
    this.player.setTilt(this.lastX, this.lastY);
  }

  updateTimer() {}

  checkVisible() {
    const visibleEdges = this.detectVisibleEdges();
    if (visibleEdges.length > 0) {
      this.shiftTiles(visibleEdges);
      this.renderTiles(); // Rerender tiles after shifting
    }
  }

  setRotation() {
    this.cameras.main.rotation = Phaser.Math.DegToRad(-this.player.angle);
  }

  setZoom() {
    // Clamp zoom to increase REALITY.
    this.currentZoom = Phaser.Math.Clamp(
      this.currentZoom,
      this.minZoom,
      this.maxZoom
    ); // Zoom range
    this.cameras.main.zoom = this.currentZoom;

    // Ensure zoom level stays within reasonable bounds
    this.cameras.main.zoom = this.currentZoom;
    this.player.setScale(1 / this.currentZoom);
  }

  setPlayerForwardVelocity() {
    // degrees to radians
    let radians = Phaser.Math.DegToRad(this.player.angle);

    // velocity based on the angle
    let vy = this.forwardSpeed * Math.cos(radians);
    let vx = this.forwardSpeed * Math.sin(radians);

    // Set the player's velocity
    this.player.setVelocity(vx, -vy);
  }

  shiftTiles(visibleEdges) {
    visibleEdges.forEach((edge) => {
      switch (edge) {
        case "N":
          const southRow = this.tileOrder.pop();
          this.tileOrder.unshift(southRow);
          this.tileStartY -= this.tileSize;
          break;
        case "S":
          const northRow = this.tileOrder.shift();
          this.tileOrder.push(northRow);
          this.tileStartY += this.tileSize;
          break;
        case "W":
          this.tileOrder.forEach((row) => {
            const eastTile = row.pop();
            row.unshift(eastTile);
          });
          this.tileStartX -= this.tileSize;
          break;
        case "E":
          this.tileOrder.forEach((row) => {
            const westTile = row.shift();
            row.push(westTile);
          });
          this.tileStartX += this.tileSize;
          break;
      }
    });
  }

  renderTiles() {
    this.tiles.forEach((tile) => tile.sprite.destroy()); // Remove old tiles
    this.tiles = [];

    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const tileNumber = this.tileOrder[y][x];
        const tileX = x * this.tileSize + this.tileStartX;
        const tileY = y * this.tileSize + this.tileStartY;
        const tile = this.add
          .image(tileX, tileY, `tile${tileNumber}`)
          .setOrigin(0, 0);
        this.tiles.push({
          sprite: tile,
          number: tileNumber,
          x: tileX,
          y: tileY,
          active: true,
        });
      }
    }
  }

  detectVisibleEdges() {
    let visibleEdges = [];

    const view = this.cameras.main.worldView;
    const leftEdgeX = view.x + this.edgeDetectOffset;
    const rightEdgeX = view.x + view.width + this.edgeDetectOffset;
    const topEdgeY = view.y + this.edgeDetectOffset;
    const bottomEdgeY = view.y + view.height + this.edgeDetectOffset;

    // left edge
    if (leftEdgeX <= this.tiles[0].x) {
      visibleEdges.push("W");
      console.log("West edge visible");
    }

    // right edge
    if (rightEdgeX >= this.tiles[this.tiles.length - 1].x + this.tileSize) {
      visibleEdges.push("E");
      console.log("East edge visible");
    }

    // top edge
    if (topEdgeY <= this.tiles[0].y) {
      visibleEdges.push("N");
    }

    // bottom edge
    if (bottomEdgeY >= this.tiles[this.tiles.length - 1].y + this.tileSize) {
      visibleEdges.push("S");
    }

    console.log(this.tileOrder);
    return visibleEdges;
  }
}
