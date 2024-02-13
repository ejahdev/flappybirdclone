var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var backgroundImage = new Image();
backgroundImage.src = 'background.jpg';

var backgroundX = 0;
var backgroundSpeed = 1;

var imageSwitchDelay = 5;

var frameCounter = 0;

function drawBackground() {
    ctx.drawImage(backgroundImage, backgroundX, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, backgroundX + canvas.width, 0, canvas.width, canvas.height);

    backgroundX -= backgroundSpeed;

    if (backgroundX <= -canvas.width) {
        backgroundX = 0;
    }
}

var bird = {
  x: 50,
  y: canvas.height / 2,
  width: 50,
  height: 45,
  velocityY: 0,
  gravity: 0.04 
};

var birdImages = [];
var currentBirdImageIndex = 0;

for (var i = 0; i < 4; i++) {
  var image = new Image();
  image.src = 'bird_' + i + '.png'
  birdImages.push(image);
}

var birdRotation = -.3;

var obstacles = [];
var obstacleWidth = 50;
var minGap = 85;
var maxGap = 200;
var obstacleSpeed = 1; 
var lastObstacleAddedTime = 0;

var gameStarted = false;
var score = 0;
var gameOver = false;

function generateObstacle() {
    var gap = Math.random() * (maxGap - minGap) + minGap;
    var obstacleHeight = Math.random() * (canvas.height - gap);
    obstacles.push({
      x: canvas.width,
      y: 0,
      height: obstacleHeight
    });
    obstacles.push({
      x: canvas.width,
      y: obstacleHeight + gap,
      height: canvas.height - obstacleHeight - gap
    });
  }

function moveObstacles() {
    for (var i = 0; i < obstacles.length; i++) {
      obstacles[i].x -= obstacleSpeed;
    }
  }

function drawObstacles() {
    for (var i = 0; i < obstacles.length; i++) {
      ctx.fillStyle = "green";
      ctx.fillRect(obstacles[i].x, obstacles[i].y, obstacleWidth, obstacles[i].height);
    }
  }

function checkCollision() {
    for (var i = 0; i < obstacles.length; i++) {
      if (
        bird.x < obstacles[i].x + obstacleWidth &&
        bird.x + bird.width > obstacles[i].x &&
        bird.y < obstacles[i].y + obstacles[i].height &&
        bird.y + bird.height > obstacles[i].y
      ) {
        birdFall();
        endGame();
        return;
      }
    }

    if (bird.y >= canvas.height - bird.height || bird.y + bird.height <= 0) {
      birdFall();
      endGame();
    }
  }

function drawBird() {
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(birdRotation);

    ctx.drawImage(birdImages[currentBirdImageIndex], -bird.width / 2, -bird.height / 2, bird.width, bird.height);
    ctx.restore();
  }

  function updateBirdRotation() {
    if (!gameStarted) return;

    if (bird.velocityY < 0) {
        birdRotation = -0.3;
    } else {
      birdRotation += 0.03;
      if (birdRotation > 1.5708) {
        birdRotation = 1.5708
      }
    }
  }

function update() {
    if (!gameStarted) return;

    bird.velocityY += bird.gravity;
    bird.y += bird.velocityY;

    if (bird.y >= canvas.height || bird.y + bird.height <= 0) {
        endGame();
    }

    updateBirdRotation();

    if (Date.now() - lastObstacleAddedTime > 2000) {
      generateObstacle();
      lastObstacleAddedTime = Date.now();
    }

    moveObstacles();

    obstacleSpeed += 0.0005;

    score += 0.1;
}

function jump() {
    bird.velocityY = -2;
    birdRotation = -0.3;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();

    drawBird();
    drawObstacles();

    ctx.font = "16px Arial";
    ctx.fillStyle = "#000";
    ctx.fillText("Score: " + Math.floor(score), 8, 20);

    if (!gameStarted) {
      ctx.fillText("Click to start playing", 150, canvas.height / 2);
    }

    else if (gameOver) {
      ctx.fillText("GAME OVER", 150, canvas.height / 2);
      ctx.fillText("Your Score: " + Math.floor(score), 150, canvas.height / 2 + 20);
      ctx.fillText("Click to play again", 150, canvas.height / 2 + 40);
    }
}

function birdFall() {
  if (bird.y < canvas.height - bird.height && bird.y > 0 && gameOver) {
    bird.y += 5;
  }
}

// Main game loop
function gameLoop() {
    update();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw();
    checkCollision();

    frameCounter++;

    if (frameCounter >= imageSwitchDelay) {
      currentBirdImageIndex = (currentBirdImageIndex + 1) % birdImages.length;
      frameCounter = 0;
    }

    if (gameOver) {
      birdFall();
      ctx.fillText("GAME OVER", 150, canvas.height / 2);
      ctx.fillText("Your Score: " + Math.floor(score), 150, canvas.height / 2 + 20);
      ctx.fillText("Click to play again", 150, canvas.height / 2 + 40);
    }

    if (!gameOver) {
      requestAnimationFrame(gameLoop);
    }
}

gameLoop();

document.addEventListener("mousedown", function(event) {
    if (event.button === 0) {
      if (!gameStarted) {
        gameStarted = true;
        lastObstacleAddedTime = Date.now();
      } else if (gameOver) {
        resetGame();
      } else {
        jump();
      }
    }
});

function endGame() {
    gameOver = true;
}

function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocityY = 0;
    birdRotation = 0;
    obstacles = [];
    obstacleSpeed = 1;
    score = 0;
    gameOver = false;
    gameStarted = true;
    lastObstacleAddedTime = Date.now();
    requestAnimationFrame(gameLoop);
}
