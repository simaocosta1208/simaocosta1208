const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const startBtn = document.getElementById("start");
const restartBtn = document.getElementById("restart");

const lanes = [120, 240, 360];
const roadTop = 40;
const roadBottom = canvas.height - 40;

const player = {
  laneIndex: 1,
  y: canvas.height - 120,
  width: 46,
  height: 80,
  speed: 6,
};

let obstacles = [];
let speed = 3;
let score = 0;
let bestScore = 0;
let running = false;
let lastTime = 0;

const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  ArrowDown: false,
};

const spawnInterval = 950;
let spawnTimer = 0;

function resetGame() {
  obstacles = [];
  speed = 3;
  score = 0;
  player.laneIndex = 1;
  spawnTimer = 0;
  lastTime = 0;
  updateHud();
}

function updateHud() {
  scoreEl.textContent = Math.floor(score);
  bestEl.textContent = Math.floor(bestScore);
}

function drawRoad() {
  ctx.fillStyle = "#0f111a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#141626";
  ctx.fillRect(60, roadTop, canvas.width - 120, roadBottom - roadTop);

  ctx.strokeStyle = "#2e3150";
  ctx.lineWidth = 4;
  ctx.strokeRect(60, roadTop, canvas.width - 120, roadBottom - roadTop);

  ctx.strokeStyle = "#3d4066";
  ctx.setLineDash([18, 14]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, roadTop);
  ctx.lineTo(canvas.width / 2, roadBottom);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPlayer() {
  const x = lanes[player.laneIndex];
  const y = player.y;
  ctx.fillStyle = "#f9a826";
  ctx.fillRect(x - player.width / 2, y, player.width, player.height);
  ctx.fillStyle = "#ffd56b";
  ctx.fillRect(x - player.width / 2 + 6, y + 10, player.width - 12, 20);
  ctx.fillStyle = "#1f212f";
  ctx.fillRect(x - player.width / 2 + 4, y + 60, player.width - 8, 12);
}

function drawObstacle(obstacle) {
  ctx.fillStyle = obstacle.color;
  ctx.fillRect(
    obstacle.x - obstacle.width / 2,
    obstacle.y,
    obstacle.width,
    obstacle.height
  );
  ctx.fillStyle = "#1f212f";
  ctx.fillRect(
    obstacle.x - obstacle.width / 2 + 6,
    obstacle.y + 10,
    obstacle.width - 12,
    12
  );
}

function spawnObstacle() {
  const laneIndex = Math.floor(Math.random() * lanes.length);
  const colors = ["#ff4e50", "#5dd6ff", "#8bff66", "#f25aff"];
  obstacles.push({
    laneIndex,
    x: lanes[laneIndex],
    y: roadTop - 100,
    width: 46,
    height: 80,
    color: colors[Math.floor(Math.random() * colors.length)],
  });
}

function updateObstacles(delta) {
  obstacles.forEach((obstacle) => {
    obstacle.y += speed * delta;
  });

  obstacles = obstacles.filter((obstacle) => obstacle.y < roadBottom + 120);
}

function detectCollision() {
  return obstacles.some((obstacle) => {
    if (obstacle.laneIndex !== player.laneIndex) {
      return false;
    }

    const playerTop = player.y;
    const playerBottom = player.y + player.height;
    const obstacleTop = obstacle.y;
    const obstacleBottom = obstacle.y + obstacle.height;

    return playerBottom > obstacleTop + 8 && playerTop < obstacleBottom - 8;
  });
}

function updatePlayer(delta) {
  if (keys.ArrowUp) {
    speed = Math.min(speed + 0.04 * delta, 6.5);
  } else if (keys.ArrowDown) {
    speed = Math.max(speed - 0.08 * delta, 2.2);
  } else {
    speed = Math.max(speed - 0.02 * delta, 3);
  }
}

function updateScore(delta) {
  score += delta * speed * 0.4;
  if (score > bestScore) {
    bestScore = score;
  }
  updateHud();
}

function loop(timestamp) {
  if (!running) {
    return;
  }

  const delta = lastTime ? (timestamp - lastTime) / 16 : 1;
  lastTime = timestamp;

  spawnTimer += timestamp - (lastTime - delta * 16);
  if (spawnTimer >= spawnInterval) {
    spawnObstacle();
    spawnTimer = 0;
  }

  updatePlayer(delta);
  updateObstacles(delta);
  updateScore(delta);

  drawRoad();
  obstacles.forEach(drawObstacle);
  drawPlayer();

  if (detectCollision()) {
    endGame();
    return;
  }

  requestAnimationFrame(loop);
}

function startGame() {
  if (running) {
    return;
  }
  running = true;
  startBtn.disabled = true;
  requestAnimationFrame(loop);
}

function endGame() {
  running = false;
  startBtn.disabled = false;
  ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 32px Segoe UI";
  ctx.textAlign = "center";
  ctx.fillText("Fim de jogo", canvas.width / 2, canvas.height / 2 - 10);
  ctx.font = "16px Segoe UI";
  ctx.fillText("Clique em reiniciar para tentar de novo", canvas.width / 2, canvas.height / 2 + 26);
}

function handleKeyDown(event) {
  if (event.key in keys) {
    keys[event.key] = true;
  }

  if (event.key === "ArrowLeft") {
    player.laneIndex = Math.max(0, player.laneIndex - 1);
  }

  if (event.key === "ArrowRight") {
    player.laneIndex = Math.min(lanes.length - 1, player.laneIndex + 1);
  }
}

function handleKeyUp(event) {
  if (event.key in keys) {
    keys[event.key] = false;
  }
}

startBtn.addEventListener("click", () => {
  if (!running) {
    resetGame();
    startGame();
  }
});

restartBtn.addEventListener("click", () => {
  resetGame();
  startGame();
});

window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

resetGame();
endGame();
