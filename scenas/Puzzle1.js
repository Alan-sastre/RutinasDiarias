class Puzzle1 extends Phaser.Scene {
  constructor() {
    super({ key: "Puzzle1" });
  }
  preload() {
    this.load.audio("musica1", "components/musica1.mp3");
  }
  create() {
    this.cameras.main.setBackgroundColor(0xdef3ff);
    this.audioManager = new AudioManager(this, "musica1", {
      defaultVolume: 0.4,
      x: this.scale.width - 220,
      y: 30,
      panelWidth: 200,
      panelHeight: 50,
      primaryColor: 0x00cec9,
      secondaryColor: 0x2d3436,
      textColor: "#ffffff",
    });
    this.elements = [];
    this.hand = this.add
      .text(0, 0, "👆🏻", { fontFamily: "Nunito, Arial", fontSize: "44px" })
      .setOrigin(0.5)
      .setDepth(1000);
    this.handTween = null;
    this.setup();
  }
  setup() {
    const bins = [
      { color: "red", x: 220, y: 330 },
      { color: "blue", x: 500, y: 330 },
      { color: "green", x: 780, y: 330 },
    ];
    const piecesData = [
      { color: "red", x: 220, y: 180 },
      { color: "red", x: 340, y: 180 },
      { color: "blue", x: 500, y: 180 },
      { color: "blue", x: 620, y: 180 },
      { color: "green", x: 780, y: 180 },
      { color: "green", x: 900, y: 180 },
    ];
    this.binZones = {};
    bins.forEach((b) => {
      const binDom = this.createBin(b.color);
      binDom.setPosition(b.x, b.y);
      const zone = this.add.zone(b.x, b.y, 200, 130).setInteractive();
      this.elements.push(binDom, zone);
      this.binZones[b.color] = zone;
    });
    this.pieces = [];
    piecesData.forEach((p) => {
      const piece = this.createPiece(p.color);
      piece.setPosition(p.x, p.y);
      piece.setData("color", p.color);
      this.elements.push(piece);
      this.pieces.push(piece);
      piece.on("drag", (pointer, dx, dy) => piece.setPosition(dx, dy));
      piece.on("dragend", () => {
        const zone = this.binZones[piece.getData("color")];
        const dist = Phaser.Math.Distance.Between(
          piece.x,
          piece.y,
          zone.x,
          zone.y,
        );
        if (dist < 80) {
          piece.setPosition(
            zone.x + Phaser.Math.Between(-40, 40),
            zone.y + Phaser.Math.Between(-30, 30),
          );
          piece.disableInteractive();
          const remaining = this.pieces.filter(
            (o) => o.input && o.input.enabled,
          );
          if (remaining.length === 0) {
            this.confetti();
            this.time.delayedCall(1200, () => this.scene.start("Puzzle2"));
          } else {
            const next = remaining[0];
            const target = this.binZones[next.getData("color")];
            this.moveHand(next.x, next.y - 60, target.x, target.y - 60);
          }
        } else {
          this.tweens.add({
            targets: piece,
            x: p.x,
            y: p.y,
            duration: 250,
            ease: "Back.out",
          });
        }
      });
    });
    const first = this.pieces[0];
    const targetFirst = this.binZones[first.getData("color")];
    this.moveHand(first.x, first.y - 60, targetFirst.x, targetFirst.y - 60);
  }
  createPiece(color) {
    let bg = "";
    if (color === "red") bg = "linear-gradient(145deg,#ff7675,#d63031)";
    else if (color === "blue") bg = "linear-gradient(145deg,#74b9ff,#0984e3)";
    else bg = "linear-gradient(145deg,#55efc4,#00b894)";
    const style = `
      width: 90px; height: 90px;
      border-radius: 50%;
      background: ${bg};
      box-shadow: 0 10px 16px rgba(0,0,0,0.25);
    `;
    const div = document.createElement("div");
    div.setAttribute("style", style);
    const dom = this.add.dom(0, 0, div).setOrigin(0.5).setDepth(5);
    dom.setInteractive();
    this.input.setDraggable(dom);
    return dom;
  }
  createBin(color) {
    let bg = "";
    if (color === "red") bg = "linear-gradient(145deg,#ffadad,#ff6b6b)";
    else if (color === "blue") bg = "linear-gradient(145deg,#a5d8ff,#74b9ff)";
    else bg = "linear-gradient(145deg,#a8e6cf,#55efc4)";
    const style = `
      width: 200px; height: 130px;
      border-radius: 20px;
      background: ${bg};
      box-shadow: inset 0 0 12px rgba(0,0,0,0.25), 0 8px 12px rgba(0,0,0,0.15);
    `;
    const div = document.createElement("div");
    div.setAttribute("style", style);
    const dom = this.add.dom(0, 0, div).setOrigin(0.5).setDepth(4);
    return dom;
  }
  moveHand(fromX, fromY, toX, toY) {
    this.hand.setPosition(fromX, fromY);
    if (this.handTween) this.handTween.stop();
    this.handTween = this.tweens.add({
      targets: this.hand,
      x: toX,
      y: toY,
      duration: 800,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  }
  confetti(duration = 1200) {
    const colors = [0xe74c3c, 0xf1c40f, 0x2ecc71, 0x3498db, 0x9b59b6, 0x1abc9c];
    for (let i = 0; i < 120; i++) {
      const x = Phaser.Math.Between(0, this.scale.width);
      const y = -Phaser.Math.Between(0, 200);
      const w = Phaser.Math.Between(6, 14);
      const h = Phaser.Math.Between(8, 18);
      const color = colors[Phaser.Math.Between(0, colors.length - 1)];
      const rect = this.add.rectangle(x, y, w, h, color, 1).setDepth(999);
      rect.rotation = Phaser.Math.FloatBetween(0, Math.PI);
      this.tweens.add({
        targets: rect,
        y: this.scale.height + 30,
        x: x + Phaser.Math.Between(-80, 80),
        rotation: rect.rotation + Phaser.Math.FloatBetween(1, 4),
        duration: duration + Phaser.Math.Between(-300, 300),
        ease: "Quad.out",
        onComplete: () => rect.destroy(),
      });
    }
  }
}
