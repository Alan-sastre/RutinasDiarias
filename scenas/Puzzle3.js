class Puzzle3 extends Phaser.Scene {
  constructor() {
    super({ key: "Puzzle3" });
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
    this.hand = this.add.text(0, 0, "👆🏻", { fontFamily: "Nunito, Arial", fontSize: "44px" }).setOrigin(0.5).setDepth(1000);
    this.handTween = null;
    this.setup();
  }
  setup() {
    const center = { x: this.scale.width / 2, y: 320 };
    const rays = 6;
    const radius = 120;
    const slots = [];
    for (let i = 0; i < rays; i++) {
      const angle = (Math.PI * 2 * i) / rays;
      const sx = center.x + Math.cos(angle) * radius;
      const sy = center.y + Math.sin(angle) * radius;
      const slot = this.add.circle(sx, sy, 46, 0xffffff, 0.25).setStrokeStyle(2, 0x95a5a6);
      slots.push({ slot, filled: false });
      this.elements.push(slot);
    }
    const pieces = [];
    for (let i = 0; i < rays; i++) {
      const piece = this.createDom("sun-piece", "color");
      piece.setPosition(220 + i * 120, 180);
      piece.setData("index", i);
      piece.on("drag", (pointer, dx, dy) => piece.setPosition(dx, dy));
      this.elements.push(piece);
      pieces.push(piece);
    }
    const nextGuide = () => {
      const freeIdx = slots.findIndex((s) => !s.filled);
      if (freeIdx === -1) return;
      const target = slots[freeIdx].slot;
      const candidate = pieces.find((p) => p.input && p.input.enabled);
      if (!candidate) return;
      this.moveHand(candidate.x, candidate.y - 60, target.x, target.y - 60);
    };
    pieces.forEach((piece, i0) => {
      piece.on("dragend", () => {
        let snapped = false;
        for (let j = 0; j < slots.length; j++) {
          const s = slots[j];
          const dist = Phaser.Math.Distance.Between(piece.x, piece.y, s.slot.x, s.slot.y);
          if (dist < 50 && !s.filled) {
            piece.setPosition(s.slot.x, s.slot.y);
            piece.disableInteractive();
            s.filled = true;
            snapped = true;
            break;
          }
        }
        if (!snapped) {
          this.tweens.add({ targets: piece, x: 220 + i0 * 120, y: 180, duration: 220, ease: "Back.out" });
        } else {
          const done = slots.every((s) => s.filled);
          if (done) {
            const core = this.add.circle(center.x, center.y, 70, 0xf1c40f, 1).setStrokeStyle(6, 0xfdcb6e).setDepth(3);
            this.elements.push(core);
            this.confetti(1600);
          } else {
            nextGuide();
          }
        }
      });
    });
    nextGuide();
  }
  createDom(type, variant = "color") {
    let style = "";
    if (type === "sun-piece") {
      style = `
        width: 90px; height: 90px;
        border-radius: 50%;
        background: ${variant === "silhouette" ? "radial-gradient(#bbb,#999)" : "radial-gradient(circle at 30% 30%, #ffeaa7, #fdcb6e)"};
        box-shadow: ${variant === "silhouette" ? "inset 0 0 12px rgba(0,0,0,0.3)" : "0 10px 16px rgba(0,0,0,0.25)"};
      `;
    } else {
      style = `
        width: 100px; height: 100px;
        border-radius: 20px;
        background: ${variant === "silhouette" ? "linear-gradient(#bbb,#999)" : "linear-gradient(145deg,#a29bfe,#6c5ce7)"};
        box-shadow: ${variant === "silhouette" ? "inset 0 0 10px rgba(0,0,0,0.3)" : "0 8px 12px rgba(0,0,0,0.25)"};
      `;
    }
    const div = document.createElement("div");
    div.setAttribute("style", style);
    const dom = this.add.dom(0, 0, div).setOrigin(0.5).setDepth(5);
    dom.setInteractive();
    this.input.setDraggable(dom);
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

