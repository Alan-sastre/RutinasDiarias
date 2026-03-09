class Puzzle2 extends Phaser.Scene {
  constructor() {
    super({ key: "Puzzle2" });
  }
  preload() {
    this.load.audio("musica1", "components/musica1.mp3");
    this.load.image("bgLogo", "roblogo.png");
  }
  create() {
    // Eliminamos setBackgroundColor para que se vea el fondo de roblogo.png definido en el CSS
    this.createAmbientBackground();
    this.audioManager = new AudioManager(this, "musica1", {
      defaultVolume: 0.4,
      x: this.scale.width - 220,
      y: 30,
      panelWidth: 200,
      panelHeight: 50,
      primaryColor: 0x6eb29f,
      secondaryColor: 0x5f8f80,
      textColor: "#ffffff",
    });
    this.input.dragDistanceThreshold = 0;
    this.input.dragTimeThreshold = 0;
    this.input.setPollAlways();
    this.hand = this.createGuideHand();
    this.handTween = null;
    this.add
      .text(this.scale.width / 2, 62, "🦾 ⚙️ 🔋 🧽", {
        fontFamily: "Fredoka One, Arial",
        fontSize: "60px",
        color: "#2d3436",
        stroke: "#ffffff",
        strokeThickness: 8,
      })
      .setOrigin(0.5);
    this.buildStations();
    this.buildTasks();
    this.guideNextTask();
  }
  buildStations() {
    this.houses = [
      { key: "clean", icon: "🧽", x: 210, y: 330, color: 0x9fd0b7 },
      { key: "energy", icon: "🔋", x: 500, y: 330, color: 0xf1d7a1 },
      { key: "build", icon: "⚙️", x: 790, y: 330, color: 0xa9c7e8 },
    ];
    this.houseByKey = {};
    this.houses.forEach((h) => {
      const base = this.add
        .rectangle(h.x, h.y, 220, 150, h.color, 0.86)
        .setStrokeStyle(4, 0xffffff)
        .setDepth(2);
      const icon = this.add
        .text(h.x, h.y, h.icon, {
          fontFamily: "Nunito, Arial",
          fontSize: "84px",
        })
        .setOrigin(0.5)
        .setDepth(3);
      const zone = this.add.zone(h.x, h.y, 220, 150);
      this.houseByKey[h.key] = { base, icon, zone };
    });
  }
  buildTasks() {
    this.cards = [];
    const animals = Phaser.Utils.Array.Shuffle([
      { key: "clean", icon: "🪥", a: "#8dc9ae", b: "#6daa90" },
      { key: "clean", icon: "🚿", a: "#8dc9ae", b: "#6daa90" },
      { key: "energy", icon: "🍽️", a: "#e8ca93", b: "#c6a96f" },
      { key: "energy", icon: "🔌", a: "#e8ca93", b: "#c6a96f" },
      { key: "build", icon: "🧱", a: "#9ebde0", b: "#7d9dc0" },
      { key: "build", icon: "🦾", a: "#9ebde0", b: "#7d9dc0" },
    ]);
    for (let i = 0; i < animals.length; i++) {
      const x = 130 + i * 150;
      const y = 170;
      const card = this.createCard(animals[i].icon, animals[i].a, animals[i].b);
      card.setPosition(x, y);
      card.setData("type", animals[i].key);
      card.setData("startX", x);
      card.setData("startY", y);
      card.on("drag", (pointer, dragX, dragY) =>
        card.setPosition(dragX, dragY),
      );
      card.on("dragend", () => this.onDrop(card));
      this.cards.push(card);
    }
  }
  createCard(icon, colorA, colorB) {
    const div = document.createElement("div");
    div.setAttribute(
      "style",
      `
      width: 102px;
      height: 102px;
      border-radius: 22px;
      background: linear-gradient(155deg, ${colorA}, ${colorB});
      border: 3px solid rgba(255,255,255,0.8);
      box-shadow: 0 8px 14px rgba(0,0,0,0.2);
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:54px;
      touch-action:none;
      user-select:none;
      cursor:grab;
    `,
    );
    div.innerHTML = `<span style="display:inline-flex;align-items:center;justify-content:center;width:100%;height:100%;transform:translateY(-1px);">${icon}</span>`;
    const dom = this.add.dom(0, 0, div).setOrigin(0.5).setDepth(8);
    dom.setInteractive();
    this.input.setDraggable(dom);
    dom.on("dragstart", () => {
      dom.setDepth(20);
      dom.node.style.cursor = "grabbing";
    });
    dom.on("dragend", () => {
      dom.setDepth(8);
      dom.node.style.cursor = "grab";
    });
    return dom;
  }
  onDrop(card) {
    const type = card.getData("type");
    const home = this.houseByKey[type].zone;
    const d = Phaser.Math.Distance.Between(card.x, card.y, home.x, home.y);
    if (d < 112) {
      card.setPosition(
        home.x + Phaser.Math.Between(-64, 64),
        home.y + Phaser.Math.Between(-36, 36),
      );
      card.disableInteractive();
      this.bounceHouse(type);
      const pending = this.cards.filter((c) => c.input && c.input.enabled);
      if (pending.length === 0) {
        if (this.handTween) this.handTween.stop();
        this.hand.setVisible(false);
        this.confetti(1600);
        this.time.delayedCall(1200, () => this.scene.start("Puzzle3"));
      } else {
        this.guideNextTask();
      }
      return;
    }
    this.tweens.add({
      targets: card,
      x: card.getData("startX"),
      y: card.getData("startY"),
      duration: 170,
      ease: "Back.out",
    });
  }
  bounceHouse(type) {
    const base = this.houseByKey[type].base;
    this.tweens.add({
      targets: base,
      scaleX: 1.06,
      scaleY: 1.06,
      duration: 150,
      yoyo: true,
      ease: "Sine.inOut",
    });
  }
  guideNextTask() {
    const next = this.cards.find((c) => c.input && c.input.enabled);
    if (!next) return;
    const target = this.houseByKey[next.getData("type")].zone;
    this.moveHand(next.x, next.y - 60, target.x, target.y - 60);
  }
  moveHand(fromX, fromY, toX, toY) {
    this.hand.setVisible(true);
    this.hand.setPosition(fromX, fromY);
    if (this.handTween) this.handTween.stop();
    this.handTween = this.tweens.add({
      targets: this.hand,
      x: toX,
      y: toY,
      duration: 820,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  }
  createGuideHand() {
    const div = document.createElement("div");
    div.setAttribute(
      "style",
      `
      font-size: 62px;
      line-height: 1;
      filter: drop-shadow(0 6px 6px rgba(0,0,0,0.25));
      pointer-events: none;
      user-select: none;
      touch-action: none;
    `,
    );
    div.innerText = "👆🏻";
    return this.add.dom(0, 0, div).setOrigin(0.5).setDepth(3000);
  }
  createLogoBackground() {
    const logo = this.add
      .image(this.scale.width / 2, this.scale.height / 2, "bgLogo")
      .setDepth(-2)
      .setAlpha(0.18);
    const ratio = Math.max(
      this.scale.width / logo.width,
      this.scale.height / logo.height,
    );
    logo.setScale(ratio * 0.9);
  }
  createAmbientBackground() {
    const colors = [0xdcf4ea, 0xe0f2ff, 0xf7ead8, 0xe3e4f8, 0xd8efe5];
    for (let i = 0; i < 14; i++) {
      const c = this.add
        .circle(
          Phaser.Math.Between(30, this.scale.width - 30),
          Phaser.Math.Between(30, this.scale.height - 30),
          Phaser.Math.Between(16, 64),
          colors[i % colors.length],
          0.5,
        )
        .setDepth(-1);
      this.tweens.add({
        targets: c,
        x: c.x + Phaser.Math.Between(-34, 34),
        y: c.y + Phaser.Math.Between(-34, 34),
        alpha: Phaser.Math.FloatBetween(0.26, 0.62),
        duration: Phaser.Math.Between(1400, 3200),
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
    }
  }
  confetti(duration = 1200) {
    const colors = [0xe74c3c, 0xf1c40f, 0x2ecc71, 0x3498db, 0x9b59b6, 0x1abc9c];
    for (let i = 0; i < 110; i++) {
      const x = Phaser.Math.Between(0, this.scale.width);
      const y = -Phaser.Math.Between(0, 180);
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
        duration: duration + Phaser.Math.Between(-280, 280),
        ease: "Quad.out",
        onComplete: () => rect.destroy(),
      });
    }
  }
}
