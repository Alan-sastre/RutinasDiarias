class Puzzle2 extends Phaser.Scene {
  constructor() {
    super({ key: "Puzzle2" });
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
    const slots = [];
    const startX = 250;
    for (let i = 0; i < 3; i++) {
      const slot = this.add.rectangle(startX + i * 220, 330, 160, 110, 0xffffff, 0.18).setStrokeStyle(2, 0x95a5a6).setDepth(2);
      slots.push(slot);
      this.elements.push(slot);
    }
    const steps = [{ key: "bed" }, { key: "toothbrush" }, { key: "plate" }];
    const cards = [];
    steps.forEach((s, idx) => {
      const card = this.createDom(s.key, "color");
      card.setPosition(250 + idx * 220, 180);
      card.setData("key", s.key);
      card.on("drag", (pointer, dx, dy) => card.setPosition(dx, dy));
      cards.push(card);
      this.elements.push(card);
    });
    this.index = 0;
    const guideNext = () => {
      const neededKey = steps[this.index].key;
      const card = cards.find((c) => c.getData("key") === neededKey);
      const slot = slots[this.index];
      this.moveHand(card.x, card.y - 60, slot.x, slot.y - 60);
    };
    cards.forEach((card, idx) => {
      card.on("dragend", () => {
        const neededKey = steps[this.index].key;
        const slot = slots[this.index];
        const dist = Phaser.Math.Distance.Between(card.x, card.y, slot.x, slot.y);
        if (card.getData("key") === neededKey && dist < 70) {
          card.setPosition(slot.x, slot.y);
          card.disableInteractive();
          this.index += 1;
          if (this.index === 3) {
            slots.forEach((sl) => sl.setStrokeStyle(3, 0x2ecc71));
            this.confetti();
            this.time.delayedCall(1200, () => this.scene.start("Puzzle3"));
          } else {
            guideNext();
          }
        } else {
          this.tweens.add({ targets: card, x: 250 + idx * 220, y: 180, duration: 220, ease: "Back.out" });
        }
      });
    });
    guideNext();
  }
  createDom(type, variant = "color") {
    let style = "";
    if (type === "toothbrush") {
      style = `
        width: 160px; height: 40px;
        position: relative;
        border-radius: 20px;
        background: ${variant === "silhouette" ? "linear-gradient(#bbb,#999)" : "linear-gradient(145deg,#ff6b6b,#ff9f43)"};
        box-shadow: ${variant === "silhouette" ? "inset 0 0 10px rgba(0,0,0,0.3)" : "0 8px 12px rgba(0,0,0,0.25)"};
      `;
    } else if (type === "plate") {
      style = `
        width: 120px; height: 120px;
        border-radius: 50%;
        background: ${variant === "silhouette" ? "radial-gradient(#bbb,#999)" : "radial-gradient(circle at 30% 30%, #ffffff, #dfe6e9)"};
        box-shadow: ${variant === "silhouette" ? "inset 0 0 15px rgba(0,0,0,0.3)" : "0 10px 20px rgba(0,0,0,0.2)"};
        position: relative;
      `;
    } else if (type === "bed") {
      style = `
        width: 160px; height: 80px;
        border-radius: 16px;
        background: ${variant === "silhouette" ? "linear-gradient(#bbb,#999)" : "linear-gradient(145deg,#74b9ff,#0984e3)"};
        box-shadow: ${variant === "silhouette" ? "inset 0 0 10px rgba(0,0,0,0.3)" : "0 12px 18px rgba(0,0,0,0.25)"};
        position: relative;
      `;
    } else {
      style = `
        width: 90px; height: 90px;
        border-radius: 50%;
        background: ${variant === "silhouette" ? "radial-gradient(#bbb,#999)" : "radial-gradient(circle at 30% 30%, #ffeaa7, #fdcb6e)"};
        box-shadow: ${variant === "silhouette" ? "inset 0 0 12px rgba(0,0,0,0.3)" : "0 10px 16px rgba(0,0,0,0.25)"};
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

