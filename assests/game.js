import { ObstacleManager } from './obstacles.js';

// ========== ÉLÉMENTS HTML ==========
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const bestScoreElement = document.getElementById('bestScore');

// ========== CONFIGURATION ==========
canvas.width = 800;
canvas.height = 400;

// ========== VARIABLES JOUEUR ==========
const player = {
    x: 100,                    // Position X fixe
    y: 0,                      // Position Y (calculée dynamiquement)
    width: 30,
    height: 50,
    groundY: canvas.height - 70,
    velocityY: 0,
    gravity: 0.8,
    jumpPower: -12,
    isJumping: false,
    isSliding: false,
    normalHeight: 50,
    slideHeight: 30,
    invincibleFrames: 0        // Frames d'invincibilité après collision
};

// Initialiser Y du joueur
player.y = player.groundY - player.height;

// ========== VARIABLES JEU ==========
let gameActive = true;
let score = 0;
let bestScore = localStorage.getItem('bestScore') || 0;
let frame = 0;
let gameSpeed = 5;
let speedIncreaseTimer = 0;

// ========== OBSTACLES ==========
const obstacleManager = new ObstacleManager(canvas, gameSpeed);

// ========== AFFICHAGE MEILLEUR SCORE ==========
if (bestScoreElement) {
    bestScoreElement.textContent = Math.floor(bestScore);
}

// ========== CONTRÔLES CLAVIER ==========
document.addEventListener('keydown', (e) => {
    if (!gameActive) {
        if (e.code === 'Space' || e.code === 'Enter') {
            resetGame();
        }
        return;
    }
    
    switch(e.key) {
        case 'ArrowUp':
        case ' ':
            e.preventDefault();
            jump();
            break;
        case 'ArrowDown':
            e.preventDefault();
            startSlide();
            break;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowDown') {
        endSlide();
    }
});

// ========== CONTRÔLES TACTILES ==========
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const y = touch.clientY;
    const halfScreen = canvas.height / 2;
    
    if (!gameActive) {
        resetGame();
        return;
    }
    
    if (y < halfScreen) {
        jump();
    } else {
        startSlide();
    }
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    endSlide();
});

canvas.addEventListener('mousedown', (e) => {
    if (!gameActive) {
        resetGame();
        return;
    }
    
    const halfScreen = canvas.height / 2;
    if (e.clientY < halfScreen) {
        jump();
    } else {
        startSlide();
    }
});

canvas.addEventListener('mouseup', () => {
    endSlide();
});

// ========== FONCTIONS JOUEUR ==========
function jump() {
    if (!player.isJumping && !player.isSliding) {
        player.velocityY = player.jumpPower;
        player.isJumping = true;
    }
}

function startSlide() {
    if (!player.isJumping) {
        player.isSliding = true;
        player.height = player.slideHeight;
        player.y = player.groundY - player.height;
    }
}

function endSlide() {
    player.isSliding = false;
    player.height = player.normalHeight;
    player.y = player.groundY - player.height;
}

function updatePlayer() {
    if (player.isJumping) {
        player.velocityY += player.gravity;
        player.y += player.velocityY;
        
        if (player.y >= player.groundY - player.height) {
            player.y = player.groundY - player.height;
            player.velocityY = 0;
            player.isJumping = false;
        }
    }
    
    // Réduction des frames d'invincibilité
    if (player.invincibleFrames > 0) {
        player.invincibleFrames--;
    }
}

// ========== HITBOX JOUEUR ==========
function getPlayerHitbox() {
    let hitboxY = player.y;
    let hitboxHeight = player.height;
    
    // Ajustement hitbox en glissant
    if (player.isSliding) {
        hitboxHeight = player.slideHeight;
    }
    
    return {
        x: player.x + 5,
        y: hitboxY + 5,
        width: player.width - 10,
        height: hitboxHeight - 5
    };
}

// ========== GESTION SCORE ==========
function updateScore() {
    if (!gameActive) return;
    
    score += 0.1;
    if (scoreElement) {
        scoreElement.textContent = Math.floor(score);
    }
    
    // Augmentation progressive de la vitesse
    speedIncreaseTimer++;
    if (speedIncreaseTimer > 300 && gameSpeed < 12) {
        gameSpeed += 0.2;
        speedIncreaseTimer = 0;
        obstacleManager.setGameSpeed(gameSpeed);
    }
}

function saveBestScore() {
    const currentScore = Math.floor(score);
    if (currentScore > bestScore) {
        bestScore = currentScore;
        localStorage.setItem('bestScore', bestScore);
        if (bestScoreElement) {
            bestScoreElement.textContent = bestScore;
        }
    }
}

// ========== DESSIN ==========
function drawPlayer() {
    ctx.save();
    
    // Effet clignotant quand invincible
    if (player.invincibleFrames > 0 && Math.floor(Date.now() / 50) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }
    
    // Corps du phacochère
    ctx.fillStyle = '#8B6914';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Oreilles
    ctx.fillStyle = '#A0792C';
    ctx.fillRect(player.x - 5, player.y + 5, 5, 15);
    ctx.fillRect(player.x + player.width, player.y + 5, 5, 15);
    
    // Yeux
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x + 5, player.y + 10, 8, 8);
    ctx.fillRect(player.x + 17, player.y + 10, 8, 8);
    ctx.fillStyle = 'black';
    ctx.fillRect(player.x + 7, player.y + 12, 4, 4);
    ctx.fillRect(player.x + 19, player.y + 12, 4, 4);
    
    // Défenses
    ctx.fillStyle = '#F5F5DC';
    ctx.fillRect(player.x + 8, player.y + player.height - 5, 4, 8);
    ctx.fillRect(player.x + 18, player.y + player.height - 5, 4, 8);
    
    ctx.restore();
}

function drawGround() {
    ctx.fillStyle = '#5C4033';
    ctx.fillRect(0, player.groundY, canvas.width, canvas.height - player.groundY);
    
    // Ligne d'herbe
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, player.groundY - 3, canvas.width, 3);
}

function drawScore() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(`Score: ${Math.floor(score)}`, 10, 30);
    ctx.fillStyle = 'gray';
    ctx.fillText(`Best: ${bestScore}`, 10, 60);
}

function drawGameOver() {
    ctx.font = '40px Arial';
    ctx.fillStyle = 'red';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);
    
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(`Score final: ${Math.floor(score)}`, canvas.width / 2, canvas.height / 2);
    ctx.fillText('Appuyez sur Espace ou tapez pour rejouer', canvas.width / 2, canvas.height / 2 + 40);
    ctx.textAlign = 'left';
}

// ========== COLLISION ==========
function checkCollisions() {
    if (player.invincibleFrames > 0) return false;
    
    const playerHitbox = getPlayerHitbox();
    
    // Vérification avec les obstacles
    const collision = obstacleManager.checkCollision(
        playerHitbox, 
        player.isJumping, 
        player.isSliding
    );
    
    if (collision) {
        player.invincibleFrames = 30; // 30 frames d'invincibilité
        return true;
    }
    
    return false;
}

// ========== BOUCLE PRINCIPALE ==========
let lastTimestamp = 0;
let lastFrameTime = 0;

function gameLoop(currentTime = 0) {
    requestAnimationFrame(gameLoop);
    
    // Delta time (limité à 32ms pour éviter les bonds)
    let deltaTime = Math.min(32, currentTime - lastFrameTime);
    if (deltaTime < 0) deltaTime = 16;
    lastFrameTime = currentTime;
    
    // Mise à jour du jeu
    if (gameActive) {
        updatePlayer();
        updateScore();
        
        // Mise à jour des obstacles avec deltaTime
        obstacleManager.update(deltaTime, player.groundY, score, gameActive);
        
        // Vérifier collisions
        const wasHit = checkCollisions();
        if (wasHit) {
            // Option: réduction de score ou mort immédiate
            // Ici on continue avec invincibilité
        }
        
        // Vérifier si mort (option hardcore - collision = mort)
        if (wasHit && player.invincibleFrames <= 0) {
            gameActive = false;
            saveBestScore();
        }
    }
    
    // Dessin
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGround();
    obstacleManager.draw(ctx);
    drawPlayer();
    drawScore();
    
    if (!gameActive) {
        drawGameOver();
    }
}

// ========== RÉINITIALISATION ==========
function resetGame() {
    gameActive = true;
    score = 0;
    gameSpeed = 5;
    speedIncreaseTimer = 0;
    player.isJumping = false;
    player.isSliding = false;
    player.velocityY = 0;
    player.y = player.groundY - player.height;
    player.height = player.normalHeight;
    player.invincibleFrames = 0;
    
    obstacleManager.reset();
    obstacleManager.setGameSpeed(gameSpeed);
    
    if (scoreElement) {
        scoreElement.textContent = '0';
    }
}

// ========== DÉMARRAGE ==========
resetGame();
gameLoop();
