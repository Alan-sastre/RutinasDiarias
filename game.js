var config = {
  type: Phaser.AUTO,
  transparent: true,
  dom: {
    createContainer: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    parent: "game",
    width: 1000,
    height: 500,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  render: {
    pixelArt: true,
    antialias: true,
    roundPixels: false,
    willReadFrequently: true,
    transparent: true,
  },
  scene: [Puzzle1, Puzzle2, Puzzle3],
};

function getViewportHeight() {
  return window.visualViewport
    ? window.visualViewport.height
    : window.innerHeight;
}

function isPortraitOrientation() {
  const byMedia = window.matchMedia("(orientation: portrait)").matches;
  const bySize = window.innerHeight > window.innerWidth;
  return byMedia || bySize;
}

// Crear el contenedor del juego
const gameContainer = document.createElement("div");
gameContainer.id = "game";
document.body.appendChild(gameContainer);

// Crear el juego
var game = new Phaser.Game(config);

function updateLayoutForDevice() {
  const viewportHeight = getViewportHeight();
  gameContainer.style.height = `${viewportHeight}px`;

  const turnElement = document.getElementById("turn");
  if (turnElement) {
    turnElement.style.display = isPortraitOrientation() ? "flex" : "none";
  }

  if (game && game.scale) {
    game.scale.refresh();
  }
}

window.addEventListener("resize", updateLayoutForDevice);
window.addEventListener("orientationchange", updateLayoutForDevice);
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", updateLayoutForDevice);
}

updateLayoutForDevice();
