const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameSpeed = 5;
let lastTime = 0;
let isGameOver = false;

// Initialize Player
const player = new Joueur(canvas.width, canvas.height);

// --- CONTROLS ---

// Keyboard Controls
window.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    
    if (e.code === 'ArrowUp') {
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

// Touch Controls
let touchStartY = 0;

window.addEventListener('touchstart', (e) => {
    if (isGameOver) return;
    touchStartY = e.touches[0].clientY;
});

window.addEventListener('touchend', (e) => {
    if (isGameOver) return;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY - touchEndY;

    if (deltaY > 30) {
        // Swipe Up
        player.jump();
    } else if (deltaY < -30) {
        // Swipe Down
        player.slide();
        setTimeout(() => player.stopSlide(), 500); // Auto stop slide for touch if no "end slide" gesture
    } else {
        // Tap
        player.jump();
    }
});

// Simple swipe end for touch
window.addEventListener('touchmove', (e) => {
    // Prevent scrolling
    if (e.target === canvas) {
        e.preventDefault();
    }
}, { passive: false });


// --- GAME LOOP ---

function update(deltaTime) {
    if (isGameOver) return;
    player.update(deltaTime);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Ground (placeholder)
    ctx.fillStyle = '#1b3d1b';
    ctx.fillRect(0, 260, canvas.width, 40);
    
    player.draw(ctx);
}

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    update(deltaTime);
    draw();
    
    requestAnimationFrame(gameLoop);
}

// Start Game
requestAnimationFrame(gameLoop);
