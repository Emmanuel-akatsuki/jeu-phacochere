class Obstacle {
    constructor(type, x, y, width, height) {
        this.type = type;     // 'ground' ou 'air'
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isActive = true;
    }

    draw(ctx) {
        // Dessiner selon le type d'obstacle
        if (this.type === 'ground') {
            // Obstacle au sol (rocher / buisson)
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Détail visuel
            ctx.fillStyle = '#5C3317';
            ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, 5);
            ctx.fillRect(this.x + 8, this.y + 12, this.width - 16, 5);
        } else {
            // Obstacle aérien (branche / barrière)
            ctx.fillStyle = '#2E8B57';
            ctx.fillRect(this.x, this.y, this.width, this.height * 0.6);
            
            // Détail visuel
            ctx.fillStyle = '#228B22';
            ctx.fillRect(this.x + 3, this.y + 5, this.width - 6, 3);
            ctx.fillRect(this.x + 5, this.y + 10, this.width - 10, 3);
        }
        
        // Hitbox (optionnel pour debug)
        if (window.showHitboxes) {
            ctx.strokeStyle = 'red';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }

    update(speed) {
        this.x -= speed;
        return this.x + this.width > 0; // retourne true si toujours visible
    }

    getHitbox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

class ObstacleManager {
    constructor(canvas, gameSpeed) {
        this.canvas = canvas;
        this.obstacles = [];
        this.gameSpeed = gameSpeed;
        this.spawnTimer = 0;
        this.minSpawnDelay = 1000;   // 1 seconde minimum
        this.maxSpawnDelay = 3000;   // 3 secondes maximum
        this.nextSpawnDelay = this.getRandomSpawnDelay();
        
        // Configuration des dimensions
        this.groundObstacleHeight = 25;
        this.airObstacleHeight = 15;
        this.obstacleWidth = 25;
        
        // Niveaux de difficulté
        this.difficulty = 1;
        this.lastScoreThreshold = 0;
    }

    getRandomSpawnDelay() {
        return Math.random() * (this.maxSpawnDelay - this.minSpawnDelay) + this.minSpawnDelay;
    }

    updateDifficulty(currentScore) {
        // Augmente la difficulté tous les 500 points
        const newDifficulty = Math.floor(currentScore / 500) + 1;
        if (newDifficulty !== this.difficulty) {
            this.difficulty = newDifficulty;
            // Plus le niveau est haut, plus les obstacles sont fréquents
            const speedMultiplier = Math.min(1.5, 1 + (this.difficulty - 1) * 0.1);
            this.minSpawnDelay = Math.max(500, 1000 / speedMultiplier);
            this.maxSpawnDelay = Math.max(1500, 3000 / speedMultiplier);
        }
    }

    spawnObstacle(groundY) {
        // Choisir aléatoirement le type d'obstacle
        const isGroundObstacle = Math.random() > 0.5;
        
        let y;
        if (isGroundObstacle) {
            // Obstacle au sol (collision seulement si pas en saut)
            y = groundY - this.groundObstacleHeight;
        } else {
            // Obstacle aérien (collision seulement si pas en glisser)
            y = groundY - this.airObstacleHeight - 35; // Position plus haute
        }
        
        const type = isGroundObstacle ? 'ground' : 'air';
        
        const obstacle = new Obstacle(
            type,
            this.canvas.width,
            y,
            this.obstacleWidth,
            isGroundObstacle ? this.groundObstacleHeight : this.airObstacleHeight
        );
        
        this.obstacles.push(obstacle);
        return obstacle;
    }

    update(deltaTime, groundY, currentScore, gameActive) {
        if (!gameActive) return [];

        // Mettre à jour la difficulté
        this.updateDifficulty(currentScore);
        
        // Gestion du spawn
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.nextSpawnDelay) {
            this.spawnObstacle(groundY);
            this.spawnTimer = 0;
            this.nextSpawnDelay = this.getRandomSpawnDelay();
        }
        
        // Mettre à jour tous les obstacles
        const obstaclesToRemove = [];
        for (let i = 0; i < this.obstacles.length; i++) {
            const obstacle = this.obstacles[i];
            const isVisible = obstacle.update(this.gameSpeed);
            
            if (!isVisible) {
                obstaclesToRemove.push(i);
            }
        }
        
        // Supprimer les obstacles invisibles (en partant de la fin)
        for (let i = obstaclesToRemove.length - 1; i >= 0; i--) {
            this.obstacles.splice(obstaclesToRemove[i], 1);
        }
        
        return this.obstacles;
    }

    draw(ctx) {
        for (const obstacle of this.obstacles) {
            obstacle.draw(ctx);
        }
    }

    checkCollision(playerHitbox, isJumping, isSliding) {
        for (const obstacle of this.obstacles) {
            const obstacleHitbox = obstacle.getHitbox();
            
            // Vérifier collision AABB
            if (playerHitbox.x < obstacleHitbox.x + obstacleHitbox.width &&
                playerHitbox.x + playerHitbox.width > obstacleHitbox.x &&
                playerHitbox.y < obstacleHitbox.y + obstacleHitbox.height &&
                playerHitbox.y + playerHitbox.height > obstacleHitbox.y) {
                
                // Collision détectée - vérifier si le joueur a la bonne posture
                if (obstacle.type === 'ground' && !isJumping) {
                    // Obstacle au sol mais pas en saut → collision mortelle
                    return true;
                }
                
                if (obstacle.type === 'air' && !isSliding) {
                    // Obstacle aérien mais pas en glisser → collision mortelle
                    return true;
                }
                
                // Bonne posture → obstacle traversé (pas de mort)
                // On supprime l'obstacle pour éviter double collision
                const index = this.obstacles.indexOf(obstacle);
                if (index > -1) {
                    this.obstacles.splice(index, 1);
                }
            }
        }
        return false;
    }

    reset() {
        this.obstacles = [];
        this.spawnTimer = 0;
        this.difficulty = 1;
        this.minSpawnDelay = 1000;
        this.maxSpawnDelay = 3000;
        this.nextSpawnDelay = this.getRandomSpawnDelay();
    }

    // Ajuster la vitesse globale du jeu
    setGameSpeed(speed) {
        this.gameSpeed = speed;
    }
}

// Export pour utilisation (si modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Obstacle, ObstacleManager };
}
