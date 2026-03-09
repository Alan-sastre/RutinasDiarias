class Puzzle3 extends Phaser.Scene {
  constructor() {
    super({ key: "Puzzle3" });
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
      primaryColor: 0x79ae82,
      secondaryColor: 0x648d6a,
      textColor: "#ffffff",
    });
    this.add
      .text(this.scale.width / 2, 62, "🤖🔎🤖", {
        fontFamily: "Fredoka One, Arial",
        fontSize: "62px",
        color: "#2d3436",
        stroke: "#ffffff",
        strokeThickness: 8,
      })
      .setOrigin(0.5);
    this.hand = this.createGuideHand();
    this.handTween = null;
    this.round = 0;
    this.maxRounds = 4;
    this.gridItems = [];
    this.currentOddCard = null;
    this.startRound();
  }
  startRound() {
    this.round += 1;
    this.clearGrid();
    const themes = [
      { main: "🪥", odd: "🧼", colorA: "#f1c58e", colorB: "#d9aa73" },
      { main: "🔋", odd: "🔌", colorA: "#b9d3ef", colorB: "#97b6d6" },
      { main: "⚙️", odd: "🦾", colorA: "#f0d68f", colorB: "#d6bb6f" },
      { main: "🛏️", odd: "🌙", colorA: "#e7c2e9", colorB: "#cb9fce" },
    ];
    const theme = themes[(this.round - 1) % themes.length];
    const oddIndex = Phaser.Math.Between(0, 8);
    const startX = 330;
    const startY = 155;
    const gap = 170;
    for (let i = 0; i < 9; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = startX + col * gap;
      const y = startY + row * 108;
      const icon = i === oddIndex ? theme.odd : theme.main;
      const card = this.createSpotCard(
        x,
        y,
        icon,
        theme.colorA,
        theme.colorB,
        i === oddIndex,
      );
      this.gridItems.push(card);
      if (i === oddIndex) this.currentOddCard = card;
    }
    this.time.delayedCall(220, () => this.guideOddCard());
  }
  createSpotCard(x, y, icon, colorA, colorB, isOdd) {
    const div = document.createElement("div");
    div.setAttribute(
      "style",
      `
      width: 132px;
      height: 92px;
      border-radius: 22px;
      background: linear-gradient(155deg, ${colorA}, ${colorB});
      border: 3px solid rgba(255,255,255,0.82);
      box-shadow: 0 8px 14px rgba(0,0,0,0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 54px;
      line-height: 1;
      touch-action: none;
      user-select: none;
      cursor: pointer;
    `,
    );
    div.innerHTML = `<span style="display:inline-flex;align-items:center;justify-content:center;width:100%;height:100%;transform:translateY(-1px);">${icon}</span>`;
    const dom = this.add.dom(x, y, div).setOrigin(0.5).setDepth(5);
    dom.setInteractive();
    dom.setData("odd", isOdd);
    dom.on("pointerdown", () => this.onTapCard(dom));
    return dom;
  }
  onTapCard(card) {
    const isOdd = card.getData("odd");
    if (!isOdd) {
      this.cameras.main.shake(120, 0.003);
      this.tweens.add({
        targets: card,
        scaleX: 0.92,
        scaleY: 0.92,
        duration: 90,
        yoyo: true,
        ease: "Sine.inOut",
      });
      this.time.delayedCall(200, () => this.guideOddCard());
      return;
    }
    this.tweens.add({
      targets: card,
      scaleX: 1.16,
      scaleY: 1.16,
      duration: 140,
      yoyo: true,
      ease: "Sine.inOut",
    });
    this.time.delayedCall(320, () => {
      if (this.round >= this.maxRounds) {
        if (this.handTween) this.handTween.stop();
        this.hand.setVisible(false);
        this.clearGrid(); // Limpiamos las cartas para que no tapen el mensaje
        this.showFinalScreen();
        return;
      }
      this.startRound();
    });
  }
  showFinalScreen() {
    this.confetti(4000);

    const overlay = this.add
      .rectangle(
        this.scale.width / 2,
        this.scale.height / 2,
        this.scale.width,
        this.scale.height,
        0x000000,
        0.75, // Un poco más oscuro para que resalte más
      )
      .setDepth(200); // Subimos la profundidad considerablemente

    const title = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2 - 80,
        "¡FELICITACIONES!",
        {
          fontFamily: "Fredoka One, Arial",
          fontSize: "72px",
          color: "#ffffff",
          stroke: "#2ecc71",
          strokeThickness: 10,
        },
      )
      .setOrigin(0.5)
      .setDepth(201) // Más profundo que el overlay
      .setAlpha(0);

    const subtitle = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2,
        "¡Has completado todos los desafíos! 🤖🏆",
        {
          fontFamily: "Nunito, Arial",
          fontSize: "32px",
          color: "#ffffff",
        },
      )
      .setOrigin(0.5)
      .setDepth(201)
      .setAlpha(0);

    this.tweens.add({
      targets: [title, subtitle],
      alpha: 1,
      y: "-=20",
      duration: 800,
      ease: "Back.out",
    });

    const btnDiv = document.createElement("div");
    btnDiv.setAttribute(
      "style",
      `
      padding: 15px 40px;
      background: linear-gradient(145deg, #2ecc71, #27ae60);
      color: white;
      font-family: 'Fredoka One', Arial;
      font-size: 28px;
      border-radius: 50px;
      cursor: pointer;
      box-shadow: 0 10px 20px rgba(0,0,0,0.3);
      border: 4px solid white;
      transition: transform 0.2s;
      user-select: none;
    `,
    );
    btnDiv.innerText = "VOLVER A JUGAR 🔄";

    const replayBtn = this.add
      .dom(this.scale.width / 2, this.scale.height / 2 + 100, btnDiv)
      .setOrigin(0.5)
      .setDepth(205) // Mayor profundidad para asegurar visibilidad
      .setAlpha(0);

    this.tweens.add({
      targets: replayBtn,
      alpha: 1,
      scale: { from: 0.5, to: 1 },
      duration: 600,
      delay: 500,
      ease: "Back.out",
    });

    replayBtn.addListener("click");
    replayBtn.on("click", () => {
      this.scene.start("Puzzle1");
    });

    btnDiv.onmouseover = () => (btnDiv.style.transform = "scale(1.1)");
    btnDiv.onmouseout = () => (btnDiv.style.transform = "scale(1.0)");
  }
  clearGrid() {
    this.gridItems.forEach((item) => item.destroy());
    this.gridItems = [];
  }
  guideOddCard() {
    if (!this.currentOddCard || !this.currentOddCard.active) return;
    const x = this.currentOddCard.x;
    const y = this.currentOddCard.y;
    this.moveHand(x - 46, y - 58, x + 18, y - 12);
  }
  moveHand(fromX, fromY, toX, toY) {
    this.hand.setVisible(true);
    this.hand.setPosition(fromX, fromY);
    if (this.handTween) this.handTween.stop();
    this.handTween = this.tweens.add({
      targets: this.hand,
      x: toX,
      y: toY,
      duration: 760,
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
    const colors = [0xdde9da, 0xe9ddd8, 0xdde2ef, 0xe6e0d3, 0xd6e5dd];
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
        alpha: Phaser.Math.FloatBetween(0.28, 0.6),
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
