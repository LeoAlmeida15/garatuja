const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const statusElement = document.getElementById('status');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');

const tileCount = 20;
const tileSize = canvas.width / tileCount;
let snake = [{ x: 10, y: 10 }];
let velocity = { x: 0, y: 0 };
let food = { x: 15, y: 8 };
let score = 0;
let level = 1;
let gameOver = false;
let paused = false;
let speed = 8;
let lastRenderTime = 0;
const snakeHeadImage = new Image();
snakeHeadImage.src = 'snake-head.svg';

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  velocity = { x: 0, y: 0 };
  food = getRandomFoodPosition();
  score = 0;
  level = 1;
  speed = 8;
  gameOver = false;
  paused = false;
  statusElement.textContent = 'Pronto';
  updateInterface();
}

function updateInterface() {
  scoreElement.textContent = score;
  levelElement.textContent = level;
  if (gameOver) {
    statusElement.textContent = 'Game Over';
  } else if (paused) {
    statusElement.textContent = 'Pausado';
  } else if (velocity.x === 0 && velocity.y === 0) {
    statusElement.textContent = 'Pronto';
  } else {
    statusElement.textContent = 'Jogando';
  }
}

function getRandomFoodPosition() {
  let newPosition;
  while (!newPosition || snake.some(segment => segment.x === newPosition.x && segment.y === newPosition.y)) {
    newPosition = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  }
  return newPosition;
}

function gameLoop(currentTime) {
  if (gameOver || paused) {
    requestAnimationFrame(gameLoop);
    return;
  }

  window.requestAnimationFrame(gameLoop);
  const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
  if (secondsSinceLastRender < 1 / speed) return;

  lastRenderTime = currentTime;
  update();
  draw();
}

function update() {
  const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    gameOver = true;
    updateInterface();
    return;
  }

  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    gameOver = true;
    updateInterface();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    level = 1 + Math.floor(score / 50);
    speed = Math.min(16, 8 + Math.floor(score / 30));
    food = getRandomFoodPosition();
  } else {
    snake.pop();
  }

  updateInterface();
}

function drawRoundedRect(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function drawApple(x, y) {
  const centerX = x + tileSize / 2;
  const centerY = y + tileSize / 2 + 2;
  const radius = tileSize * 0.42;

  ctx.fillStyle = '#ff3b3f';
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - radius * 0.55);
  ctx.bezierCurveTo(centerX - radius * 1.05, centerY - radius * 0.85, centerX - radius * 1.3, centerY + radius * 0.35, centerX, centerY + radius);
  ctx.bezierCurveTo(centerX + radius * 1.3, centerY + radius * 0.35, centerX + radius * 1.05, centerY - radius * 0.85, centerX, centerY - radius * 0.55);
  ctx.fill();

  ctx.fillStyle = '#ff7b7d';
  ctx.beginPath();
  ctx.arc(centerX - radius * 0.17, centerY - radius * 0.18, radius * 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#72c257';
  ctx.beginPath();
  ctx.moveTo(centerX + radius * 0.15, centerY - radius * 0.45);
  ctx.quadraticCurveTo(centerX + radius * 0.8, centerY - radius * 0.95, centerX + radius * 0.25, centerY - radius * 0.5);
  ctx.fill();

  ctx.fillStyle = '#5a3c1f';
  ctx.fillRect(centerX - 3, centerY - radius * 0.9, 6, radius * 0.5);
}

function draw() {
  ctx.fillStyle = '#071017';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let x = 0; x < tileCount; x += 1) {
    for (let y = 0; y < tileCount; y += 1) {
      ctx.fillStyle = (x + y) % 2 === 0 ? 'rgba(23, 41, 70, 0.22)' : 'rgba(16, 32, 64, 0.22)';
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }

  ctx.strokeStyle = '#2ec4b6';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  for (let index = snake.length - 1; index >= 0; index -= 1) {
    const segment = snake[index];
    const cx = segment.x * tileSize + tileSize / 2;
    const cy = segment.y * tileSize + tileSize / 2;
    const radius = tileSize * 0.42;

    if (index > 0) {
      const prev = snake[index - 1];
      const prevCx = prev.x * tileSize + tileSize / 2;
      const prevCy = prev.y * tileSize + tileSize / 2;

      ctx.fillStyle = '#1b6f60';
      if (prev.x === segment.x) {
        const height = Math.abs(prevCy - cy);
        ctx.fillRect(cx - radius * 0.55, Math.min(prevCy, cy), radius * 1.1, height + radius * 0.3);
      } else if (prev.y === segment.y) {
        const width = Math.abs(prevCx - cx);
        ctx.fillRect(Math.min(prevCx, cx), cy - radius * 0.55, width + radius * 0.3, radius * 1.1);
      }
    }

    ctx.fillStyle = '#2ec4b6';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#1a5d4c';
    ctx.lineWidth = 3;
    ctx.stroke();

    if (index === 0) {
      if (snakeHeadImage.complete && snakeHeadImage.naturalWidth !== 0) {
        ctx.drawImage(snakeHeadImage, cx - radius, cy - radius, radius * 2, radius * 2);
      } else {
        ctx.fillStyle = '#9dffb7';
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.95, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1a5d4c';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#163c2d';
        ctx.beginPath();
        ctx.arc(cx - radius * 0.35, cy - radius * 0.18, radius * 0.18, 0, Math.PI * 2);
        ctx.arc(cx + radius * 0.35, cy - radius * 0.18, radius * 0.18, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(cx - radius * 0.35, cy - radius * 0.22, radius * 0.08, 0, Math.PI * 2);
        ctx.arc(cx + radius * 0.35, cy - radius * 0.22, radius * 0.08, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx - radius * 0.15, cy + radius * 0.05);
        ctx.quadraticCurveTo(cx, cy + radius * 0.4, cx + radius * 0.25, cy + radius * 0.05);
        ctx.stroke();

        ctx.strokeStyle = '#d82c37';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx + radius * 0.2, cy + radius * 0.3);
        ctx.lineTo(cx + radius * 0.4, cy + radius * 0.55);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + radius * 0.2, cy + radius * 0.3);
        ctx.lineTo(cx + radius * 0.45, cy + radius * 0.1);
        ctx.stroke();
      }
    }
  }

  drawApple(food.x * tileSize, food.y * tileSize);

  if (gameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText('Clique em Reiniciar para jogar de novo', canvas.width / 2, canvas.height / 2 + 24);
  }
}

window.addEventListener('keydown', (event) => {
  if (gameOver) return;

  const directionMap = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    d: { x: 1, y: 0 }
  };

  const newVelocity = directionMap[event.key];
  if (!newVelocity) return;

  if (snake.length > 1 && newVelocity.x === -velocity.x && newVelocity.y === -velocity.y) return;

  velocity = newVelocity;
  if (!paused) {
    statusElement.textContent = 'Jogando';
  }
});

startBtn.addEventListener('click', () => {
  if (!paused && velocity.x === 0 && velocity.y === 0) {
    velocity = { x: 1, y: 0 };
  }
  paused = false;
  gameOver = false;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  restartBtn.disabled = false;
  statusElement.textContent = 'Jogando';
  requestAnimationFrame(gameLoop);
});

pauseBtn.addEventListener('click', () => {
  paused = !paused;
  pauseBtn.textContent = paused ? 'Continuar' : 'Pausar';
  updateInterface();
  if (!paused) {
    requestAnimationFrame(gameLoop);
  }
});

restartBtn.addEventListener('click', () => {
  resetGame();
  draw();
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  pauseBtn.textContent = 'Pausar';
  restartBtn.disabled = false;
});

resetGame();
requestAnimationFrame(draw);
