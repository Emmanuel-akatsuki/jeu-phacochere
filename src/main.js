const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const highScoreElement = document.getElementById('highScore');

let gameSpeed = 5;
let score = 0;
let lastTime = 0;
let isGameOver = false;
let obstacles = [];
let nextObstacleTimer = 0;

// Initialisation des comportements
const env = new Environment();
const player = new Joueur(canvas.width, canvas.height);
const predator = new Predator(canvas.width, canvas.height);

// chargement du meilleur score
highScoreElement.innerText = GameStorage.getHighScore();

// --- CONTROLS ---
window.addEventListener('keydown', (e) => {
    if (isGameOver) {
        if (e.code === 'Space' || e.code === 'Enter') restartGame();
        return;
    }
    
    if (e.code === 'ArrowUp' || e.code === 'Space') {
        player.jump();
    }
    if (e.code === 'ArrowDown') {
        player.slide();
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowDown') {
        player.stopSlide();
    }
});

// Touches de controles
let touchStartY = 0;
canvas.addEventListener('touchstart', (e) => {
    if (isGameOver) {
        restartGame();
        return;
    }
    touchStartY = e.touches[0].clientY;
}, { passive: true });

canvas.addEventListener('touchend', (e) => {
    if (isGameOver) return;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY - touchEndY;

    if (deltaY > 30) player.jump();
    else if (deltaY < -30) {
        player.slide();
        setTimeout(() => player.stopSlide(), 600);
    } else player.jump();
});

// ---  LOGIque du jeu ---

function spawnObstacle() {
    const type = Math.random() > 0.5 ? 'ROCK' : 'BRANCH';
    const obs = {
        x: canvas.width + 100,
        y: type === 'ROCK' ? 220 : 160,
        w: type === 'ROCK' ? 40 : 60,
        h: type === 'ROCK' ? 40 : 20,
        type: type
    };
    obstacles.push(obs);
}

function update(deltaTime) {
    if (isGameOver) return;

    // Augmentation de la vitesse plus rapide
    const difficultyMultiplier = 1 + score / 3000;
    gameSpeed += 0.0003 * deltaTime * difficultyMultiplier;
    score += Math.floor(gameSpeed / 5);

    env.update(deltaTime);
    player.update(deltaTime);
    predator.update(deltaTime, player.x);

    // gestion des obstacles - beaucoup plus fréquents
    nextObstacleTimer -= deltaTime;
    if (nextObstacleTimer <= 0) {
        spawnObstacle();
        // Distance très courte entre les obstacles
        const baseInterval = 600; 
        const randomFactor = Math.random() * 800;
        nextObstacleTimer = (baseInterval + randomFactor) / (gameSpeed / 5) / difficultyMultiplier;
    }

    obstacles.forEach((obs, index) => {
        obs.x -= gameSpeed;

        // Detection de Collisions avec padding pour réalisme
        const p = 8;
        if (
            player.x + p < obs.x + obs.w - p &&
            player.x + player.w - p > obs.x + p &&
            player.y + p < obs.y + obs.h - p &&
            player.y + player.h - p > obs.y + p
        ) {
            gameOver();
        }

        if (obs.x + obs.w < -100) {
            obstacles.splice(index, 1);
        }
    });
}

function draw() {
    // Background dynamique basé sur l'heure
    let skyColor;
    if (env.gameTime > 6 && env.gameTime < 17) skyColor = '#87CEEB'; // Jour
    else if (env.gameTime >= 17 && env.gameTime < 19) skyColor = '#ff7e5f'; // Crépuscule
    else if (env.gameTime >= 5 && env.gameTime <= 6) skyColor = '#feb47b'; // Aube
    else skyColor = '#05051a'; // Nuit noire
    
    const groundColor = env.isNight ? '#0d0d0d' : '#2e1a05';
    
    ctx.fillStyle = skyColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sol
    ctx.fillStyle = groundColor;
    ctx.fillRect(0, 260, canvas.width, 40);
    
    // Texture du sol (herbes/poussière)
    ctx.fillStyle = env.isNight ? '#050505' : '#1b1204';
    for(let i=0; i<canvas.width; i+=40) {
        ctx.fillRect(i + (score % 40), 260, 2, 5);
        ctx.fillRect(i + ((score*1.2) % 40), 275, 3, 3);
    }

    // Effets météo améliorés
    if (env.weather === 'Rain' || env.weather === 'Storm') {
        ctx.fillStyle = env.isNight ? 'rgba(100, 100, 200, 0.3)' : 'rgba(200, 200, 255, 0.4)';
        for(let i=0; i<40; i++) {
            ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, 1, 12);
        }
    }
    
    if (env.weather === 'Storm' && Math.random() > 0.98) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    predator.draw(ctx);
    player.draw(ctx);

    obstacles.forEach(obs => {
        if (obs.type === 'ROCK') {
            ctx.fillStyle = env.isNight ? '#888' : '#4a4a4a'; // Plus clair la nuit
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y + obs.h);
            ctx.lineTo(obs.x + obs.w/2, obs.y);
            ctx.lineTo(obs.x + obs.w, obs.y + obs.h);
            ctx.fill();
        } else {
            ctx.fillStyle = env.isNight ? '#8d6e63' : '#3e2723'; // Marron clair la nuit
            ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
            ctx.fillStyle = env.isNight ? '#4caf50' : '#2e7d32'; // Vert visible la nuit
            ctx.fillRect(obs.x - 2, obs.y - 2, 10, 6);
        }
    });

    // interface
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "left";
    ctx.shadowBlur = 4;
    ctx.shadowColor = "black";
    ctx.fillText(`Distance: ${score}m`, 20, 30);
    ctx.fillText(`Vitesse: ${Math.floor(gameSpeed * 10)} km/h`, 20, 55);
    ctx.fillText(`Heure locale: ${Math.floor(env.gameTime)}h${Math.floor((env.gameTime % 1) * 60).toString().padStart(2, '0')}`, 20, 80);
    ctx.shadowBlur = 0;
}

function gameOver() {
    isGameOver = true;
    GameStorage.setHighScore(score);
    highScoreElement.innerText = GameStorage.getHighScore();

    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "40px Arial";
    ctx.fillText("ATTRAQUÉ !", canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = "20px Arial";
    ctx.fillText("Appuyez sur ESPACE pour recommencer", canvas.width / 2, canvas.height / 2 + 30);
}

function restartGame() {
    score = 0;
    gameSpeed = 5;
    isGameOver = false;
    obstacles = [];
    nextObstacleTimer = 2000;
    player.y = 215;
    player.dy = 0;
    player.isGrounded = true;
    requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
    if (isGameOver) return;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    update(deltaTime);
    draw();
    
    requestAnimationFrame(gameLoop);
}

// démarrage du jeu
env.update().then(() => {
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
});
