/**
 * Game.js - Le moteur principal du jeu Phacochère
 */
import { Player } from './player.js';
import { ObstacleManager } from './obstacles.js';
import { Pursuer } from './pursuer.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Configuration initiale
        this.width = 0;
        this.height = 0;
        this.lastTime = 0;
        this.isRunning = false;
        
        // Paramètres de jeu
        this.speed = 5;
        this.maxSpeed = 20;
        this.score = 0;
        
        // Entités
        this.player = null;
        this.obstacleManager = null;
        this.pursuer = null;
        
        // Initialisation
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // UI Elements
        this.startMenu = document.getElementById('start-menu');
        this.gameOverMenu = document.getElementById('game-over-menu');
        this.startButton = document.getElementById('start-button');
        this.restartButton = document.getElementById('restart-button');
        this.scoreElement = document.getElementById('current-score');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.startButton.addEventListener('click', () => this.start());
        this.restartButton.addEventListener('click', () => this.start());
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        if (this.player) {
            this.player.groundY = this.height * 0.8;
        }
    }

    start() {
        this.score = 0;
        this.speed = 7;
        this.isRunning = true;
        this.lastTime = performance.now();
        
        this.startMenu.classList.add('hidden');
        this.gameOverMenu.classList.add('hidden');
        
        // Initialisation des entités
        this.player = new Player(this);
        this.obstacleManager = new ObstacleManager(this);
        this.pursuer = new Pursuer(this);
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    gameOver() {
        this.isRunning = false;
        this.gameOverMenu.classList.remove('hidden');
        document.getElementById('final-score').innerText = Math.floor(this.score);
    }

    update(deltaTime) {
        if (!this.isRunning) return;

        // Mise à jour du score
        this.score += deltaTime * 0.01;
        this.scoreElement.innerText = `Score: ${Math.floor(this.score)}`;

        // Accélération progressive
        if (this.speed < this.maxSpeed) {
            this.speed += 0.0005 * deltaTime;
        }

        // Mise à jour des entités
        if (this.player) this.player.update(deltaTime);
        if (this.obstacleManager) this.obstacleManager.update(deltaTime);
        if (this.pursuer) this.pursuer.update(deltaTime);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.drawBackground();

        // Dessiner les entités (le poursuivant est derrière le joueur)
        if (this.pursuer) this.pursuer.draw(this.ctx);
        if (this.obstacleManager) this.obstacleManager.draw(this.ctx);
        if (this.player) this.player.draw(this.ctx);
    }

    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#1a2a6c');
        gradient.addColorStop(0.5, '#b21f1f');
        gradient.addColorStop(1, '#fdbb2d');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Sol
        this.ctx.fillStyle = "#3d2b1f";
        this.ctx.fillRect(0, this.height * 0.8, this.width, this.height * 0.2);
        
        // Lignes de couloirs pour la perspective
        this.ctx.strokeStyle = "rgba(255,255,255,0.1)";
        this.ctx.lineWidth = 2;
        const groundY = this.height * 0.8;
        [-40, 0, 40].forEach(offset => {
            this.ctx.beginPath();
            this.ctx.moveTo(0, groundY + offset);
            this.ctx.lineTo(this.width, groundY + offset);
            this.ctx.stroke();
        });
    }

    gameLoop(timeStamp) {
        if (!this.isRunning) return;

        const deltaTime = timeStamp - this.lastTime;
        this.lastTime = timeStamp;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

window.addEventListener('load', () => {
    new Game();
});
