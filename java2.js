// --- Configuração Inicial ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const cooldownDisplay = document.getElementById('cooldownDisplay');
const gameOverMessage = document.getElementById('gameOverMessage');
const finalScoreSpan = document.getElementById('finalScore');

// --- Variáveis do Jogo ---
let score = 0;
let isGameOver = false;
let obstacles = [];
let bullets = [];
let gameTime = 0;
let shootCooldown = 0;
const SHOOT_COOLDOWN_TIME = 180; // Aproximadamente 3 segundos (60 fps * 3s)

const GRAVITY = 0.5;
const JUMP_POWER = -12;
const OBSTACLE_SPEED = 5;

// Objeto para rastrear o estado das teclas
const keys = {};

// --- Objeto do Dinossauro ---
const dino = {
    x: 50,
    y: 200,
    width: 30,
    height: 50,
    color: '#535353',
    velocityY: 0,
    isOnGround: false,
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
};

// --- Classe para os Obstáculos ---
class Obstacle {
    constructor() {
        this.width = Math.random() > 0.5 ? 20 : 40; // Cactos pequenos ou grandes
        this.height = this.width === 20 ? 40 : 60;
        this.x = canvas.width;
        this.y = canvas.height - 50 - this.height;
        this.speed = OBSTACLE_SPEED;
    }
    draw() {
        ctx.fillStyle = '#535353';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// --- Classe para os Projéteis ---
class Bullet {
    constructor() {
        this.x = dino.x + dino.width / 2;
        this.y = dino.y + dino.height / 2;
        this.width = 10;
        this.height = 5;
        this.speed = 10;
    }
    draw() {
        ctx.fillStyle = 'orange';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// --- Funções do Jogo ---

function startGame() {
    isGameOver = false;
    score = 0;
    gameTime = 0;
    shootCooldown = 0;
    obstacles = [];
    bullets = [];
    
    dino.y = 200;
    dino.velocityY = 0;
    dino.isOnGround = true;

    scoreDisplay.innerText = `Pontos: 0`;
    cooldownDisplay.style.color = 'green';
    cooldownDisplay.innerText = "Tiro Pronto!";
    gameOverMessage.classList.add('hidden');

    gameLoop();
}

function createBullet() {
    if (shootCooldown <= 0) {
        bullets.push(new Bullet());
        shootCooldown = SHOOT_COOLDOWN_TIME;
        cooldownDisplay.innerText = "Recarregando...";
        cooldownDisplay.style.color = 'red';
    }
}

function update() {
    if (isGameOver) return;

    // --- Lógica do Dinossauro ---
    dino.velocityY += GRAVITY;
    dino.y += dino.velocityY;

    if (dino.y + dino.height > canvas.height - 50) {
        dino.y = canvas.height - 50 - dino.height;
        dino.velocityY = 0;
        dino.isOnGround = true;
    }

    // --- Lógica de Movimento e Geração de Obstáculos ---
    if (gameTime % 120 === 0) { // Gera um novo obstáculo a cada 2 segundos
        obstacles.push(new Obstacle());
    }
    obstacles.forEach(obstacle => {
        obstacle.x -= OBSTACLE_SPEED;
    });

    // --- Lógica do Projétil e Cooldown ---
    bullets.forEach(bullet => {
        bullet.x += bullet.speed;
    });
    if (shootCooldown > 0) {
        shootCooldown--;
        if (shootCooldown === 0) {
            cooldownDisplay.innerText = "Tiro Pronto!";
            cooldownDisplay.style.color = 'green';
        }
    }

    // --- Colisões ---
    // Dino vs. Obstáculo
    obstacles.forEach(obstacle => {
        if (
            dino.x < obstacle.x + obstacle.width &&
            dino.x + dino.width > obstacle.x &&
            dino.y < obstacle.y + obstacle.height &&
            dino.y + dino.height > obstacle.y
        ) {
            isGameOver = true;
        }
    });

    // Projétil vs. Obstáculo
    let obstaclesToKeep = [];
    let bulletsToKeep = [];

    obstacles.forEach(obstacle => {
        let wasHit = false;
        bullets.forEach(bullet => {
            if (
                bullet.x < obstacle.x + obstacle.width &&
                bullet.x + bullet.width > obstacle.x &&
                bullet.y < obstacle.y + obstacle.height &&
                bullet.y + bullet.height > obstacle.y
            ) {
                wasHit = true;
                score += 50; // Pontos por destruir um obstáculo
            }
        });
        if (!wasHit) {
            obstaclesToKeep.push(obstacle);
        }
    });
    
    bullets.forEach(bullet => {
        let hitSomething = false;
        obstacles.forEach(obstacle => {
            if (
                bullet.x < obstacle.x + obstacle.width &&
                bullet.x + bullet.width > obstacle.x &&
                bullet.y < obstacle.y + obstacle.height &&
                bullet.y + bullet.height > obstacle.y
            ) {
                hitSomething = true;
            }
        });
        if (!hitSomething) {
            bulletsToKeep.push(bullet);
        }
    });

    obstacles = obstaclesToKeep.filter(o => o.x + o.width > 0);
    bullets = bulletsToKeep.filter(b => b.x < canvas.width);
    
    // Atualiza a pontuação baseada no tempo
    if (gameTime % 10 === 0) {
        score++;
    }
    scoreDisplay.innerText = `Pontos: ${score}`;
    gameTime++;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa a tela
    
    // Desenha o chão
    ctx.fillStyle = '#535353';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    // Desenha o dinossauro, obstáculos e projéteis
    dino.draw();
    obstacles.forEach(o => o.draw());
    bullets.forEach(b => b.draw());

    if (isGameOver) {
        finalScoreSpan.innerText = score;
        gameOverMessage.classList.remove('hidden');
    }
}

function gameLoop() {
    update();
    draw();
    if (!isGameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// --- Event Listeners para os Controles ---
window.addEventListener('keydown', (e) => {
    // Pular com a barra de espaço
    if (e.key === ' ' && dino.isOnGround) {
        dino.velocityY = JUMP_POWER;
        dino.isOnGround = false;
    }
    // Atirar com a tecla 'A'
    if (e.key === 'a' || e.key === 'A') {
        createBullet();
    }
    // Reiniciar com a tecla 'R'
    if (e.key === 'r' || e.key === 'R') {
        startGame();
    }
});

// Inicia o jogo
startGame();
