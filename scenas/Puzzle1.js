class Puzzle1 extends Phaser.Scene {
  constructor() {
    super({ key: "Puzzle1" });
  }
  preload() {
    this.load.audio("musica1", "components/musica1.mp3");
    this.load.image("bgLogo", "roblogo.png");
  }
  create() {
    this.cameras.main.setBackgroundColor(0xffe5d9); // Un color melocotón suave en lugar del blanco/azul pálido
    this.createLogoBackground();
    this.createAmbientBackground();
    this.audioManager = new AudioManager(this, "musica1", {
      defaultVolume: 0.4,
      x: this.scale.width - 220,
      y: 30,
      panelWidth: 200,
      panelHeight: 50,
      primaryColor: 0x6ca9d9,
      secondaryColor: 0x5f84bc,
      textColor: "#ffffff",
    });
    this.add
      .text(this.scale.width / 2, 62, "🤖🧠🔋", {
        fontFamily: "Fredoka One, Arial",
        fontSize: "64px",
        color: "#2d3436",
        stroke: "#ffffff",
        strokeThickness: 8,
      })
      .setOrigin(0.5);
    this.revealed = [];
    this.lockInput = false;
    this.createBoard();
  }
  createBoard() {
    const symbols = ["🪥", "🚿", "🍽️", "🛏️"];
    const deck = Phaser.Utils.Array.Shuffle([...symbols, ...symbols]);
    const startX = 300;
    const startY = 170;
    const gapX = 135;
    const gapY = 140;
    this.cards = [];
    for (let i = 0; i < deck.length; i++) {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = startX + col * gapX;
      const y = startY + row * gapY;
      const card = this.createCard(x, y, deck[i]);
      this.cards.push(card);
    }
  }
  createCard(x, y, symbol) {
    const back = this.add
      .rectangle(0, 0, 110, 124, 0x77a8d9, 1)
      .setStrokeStyle(4, 0xffffff);
    const sparkle = this.add
      .text(0, 0, "🤖", {
        fontFamily: "Nunito, Arial",
        fontSize: "46px",
      })
      .setOrigin(0.5);
    const front = this.add
      .rectangle(0, 0, 110, 124, 0xffffff, 0.92)
      .setStrokeStyle(4, 0x4f6d94);
    const icon = this.add
      .text(0, 0, symbol, {
        fontFamily: "Nunito, Arial",
        fontSize: "56px",
      })
      .setOrigin(0.5);
    front.setVisible(false);
    icon.setVisible(false);
    const container = this.add
      .container(x, y, [back, sparkle, front, icon])
      .setSize(110, 124);
    container.setData("symbol", symbol);
    container.setData("back", back);
    container.setData("sparkle", sparkle);
    container.setData("front", front);
    container.setData("icon", icon);
    container.setData("matched", false);
    container.setData("revealed", false);
    container.setInteractive();
    container.on("pointerdown", () => this.onCardTap(container));
    return container;
  }
  onCardTap(card) {
    if (this.lockInput) return;
    if (card.getData("matched")) return;
    if (card.getData("revealed")) return;
    this.flipCard(card, true);
    this.revealed.push(card);
    if (this.revealed.length < 2) return;
    const [a, b] = this.revealed;
    this.lockInput = true;
    if (a.getData("symbol") === b.getData("symbol")) {
      this.time.delayedCall(220, () => {
        a.setData("matched", true);
        b.setData("matched", true);
        this.pulse(a);
        this.pulse(b);
        this.revealed = [];
        this.lockInput = false;
        const pending = this.cards.filter((c) => !c.getData("matched"));
        if (pending.length === 0) {
          this.confetti(1600);
          this.time.delayedCall(1300, () => this.scene.start("Puzzle2"));
        }
      });
      return;
    }
    this.time.delayedCall(620, () => {
      this.flipCard(a, false);
      this.flipCard(b, false);
      this.revealed = [];
      this.lockInput = false;
    });
  }
  flipCard(card, reveal) {
    card.setData("revealed", reveal);
    this.tweens.add({
      targets: card,
      scaleX: 0.08,
      duration: 110,
      ease: "Sine.inOut",
      onComplete: () => {
        card.getData("back").setVisible(!reveal);
        card.getData("sparkle").setVisible(!reveal);
        card.getData("front").setVisible(reveal);
        card.getData("icon").setVisible(reveal);
        this.tweens.add({
          targets: card,
          scaleX: 1,
          duration: 110,
          ease: "Sine.inOut",
        });
      },
    });
  }
  pulse(target) {
    this.tweens.add({
      targets: target,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 140,
      yoyo: true,
      ease: "Sine.inOut",
    });
  }
  createLogoBackground() {
    const logo = this.add
      .image(this.scale.width / 2, this.scale.height / 2, "bgLogo")
      .setDepth(-2)
      .setAlpha(0.5); // Aumentamos la opacidad para que sea más visible como fondo
    const ratio = Math.max(
      this.scale.width / logo.width,
      this.scale.height / logo.height,
    );
    logo.setScale(ratio); // Ajustamos a la escala completa para que sea fondo real (tipo "cover")
  }
  createAmbientBackground() {
    const palette = [0xddeeff, 0xe7f4df, 0xf9ecd8, 0xe4e3f7, 0xe0eef8];
    for (let i = 0; i < 14; i++) {
      const bubble = this.add
        .circle(
          Phaser.Math.Between(30, this.scale.width - 30),
          Phaser.Math.Between(30, this.scale.height - 30),
          Phaser.Math.Between(16, 64),
          palette[i % palette.length],
          0.46,
        )
        .setDepth(-1);
      this.tweens.add({
        targets: bubble,
        x: bubble.x + Phaser.Math.Between(-34, 34),
        y: bubble.y + Phaser.Math.Between(-34, 34),
        alpha: Phaser.Math.FloatBetween(0.24, 0.58),
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
