/**
 * Obstacles.js - Gestion des obstacles
 */

export class Obstacle {
    constructor(game) {
        this.game = game;
        
        // Type aléatoire
        const types = ['barrier', 'branch', 'hole', 'wall'];
        this.type = types[Math.floor(Math.random() * types.length)];
        
        // Couloir aléatoire
        this.lane = Math.floor(Math.random() * 3);
        
        // Dimensions selon le type
        this.width = 50;
        this.height = this.type === 'barrier' ? 40 : 80;
        
        // Position
        this.x = this.game.width + 100;
        this.groundY = this.game.height * 0.8 + [-40, 0, 40][this.lane];
        this.y = this.groundY - this.height;
        
        // Si c'est un trou, il est au niveau du sol
        if (this.type === 'hole') {
            this.height = 20;
            this.y = this.groundY;
            this.width = 100;
        }

        this.markedForDeletion = false;
    }

    update(deltaTime) {
        // Déplacement vers la gauche
        this.x -= this.game.speed * (deltaTime / 16.6); // Normalisé à 60fps
        
        // Supprimer si hors écran
        if (this.x + this.width < 0) {
            this.markedForDeletion = true;
        }

        // Collision Check (simplifié ici, sera raffiné dans game.js)
        this.checkCollision();
    }

    checkCollision() {
        const player = this.game.player;
        if (!player) return;

        // Même couloir ?
        if (player.lane === this.lane) {
            // Collision rectangulaire
            if (
                player.x < this.x + this.width &&
                player.x + player.width > this.x &&
                player.y < this.y + this.height &&
                player.y + player.height > this.y
            ) {
                this.onHit();
            }
        }
    }

    onHit() {
        // Système de dégâts : on augmente la proximité du poursuivant
        if (this.game.pursuer) {
            this.game.pursuer.increaseProximity(0.3);
            this.markedForDeletion = true; // L'obstacle disparaît après le choc
            
            // Effet visuel de flash rouge (facultatif ici)
            document.body.style.backgroundColor = "red";
            setTimeout(() => {
                document.body.style.backgroundColor = "#1a1a1a";
            }, 100);
        } else {
            this.game.gameOver();
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.getStyle();
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Petit effet de profondeur / ombre
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(this.x, this.y + this.height, this.width, 5);
    }

    getStyle() {
        switch(this.type) {
            case 'barrier': return '#e74c3c';
            case 'branch': return '#2ecc71';
            case 'hole': return '#000000';
            case 'wall': return '#95a5a6';
            default: return 'white';
        }
    }
}

export class ObstacleManager {
    constructor(game) {
        this.game = game;
        this.obstacles = [];
        this.timer = 0;
        this.interval = 1500; // ms entre obstacles
    }

    update(deltaTime) {
        this.timer += deltaTime;
        
        if (this.timer > this.interval) {
            this.obstacles.push(new Obstacle(this.game));
            this.timer = 0;
            // Réduire l'intervalle avec la vitesse
            this.interval = Math.max(600, 1500 - (this.game.speed * 50));
        }

        this.obstacles.forEach(obs => obs.update(deltaTime));
        this.obstacles = this.obstacles.filter(obs => !obs.markedForDeletion);
    }

    draw(ctx) {
        this.obstacles.forEach(obs => obs.draw(ctx));
    }
}
