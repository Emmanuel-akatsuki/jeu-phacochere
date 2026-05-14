/**
 * Player.js - Gestion du Phacochère
 */

export class Player {
    constructor(game) {
        this.game = game;
        
        // Dimensions
        this.baseWidth = 80;
        this.baseHeight = 60;
        this.width = this.baseWidth;
        this.height = this.baseHeight;
        
        // Position initiale (Ligne de sol à 80% de la hauteur)
        this.groundY = this.game.height * 0.8;
        this.x = 100;
        this.y = this.groundY - this.height;
        
        // Physique
        this.vy = 0; // Vitesse verticale
        this.gravity = 0.8;
        this.jumpForce = -18;
        this.isGrounded = true;
        
        // États
        this.isSliding = false;
        this.slideTimer = 0;
        this.lane = 1; // 0: Haut (fond), 1: Milieu, 2: Bas (devant)
        this.laneOffsets = [-40, 0, 40]; // Décalage Y pour simuler les couloirs
        
        this.setupControls();
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            if (!this.game.isRunning) return;

            switch(e.code) {
                case 'Space':
                case 'ArrowUp':
                    this.jump();
                    break;
                case 'ArrowDown':
                    this.startSlide();
                    break;
                case 'ArrowLeft':
                    this.changeLane(-1);
                    break;
                case 'ArrowRight':
                    this.changeLane(1);
                    break;
            }
        });
    }

    jump() {
        if (this.isGrounded && !this.isSliding) {
            this.vy = this.jumpForce;
            this.isGrounded = false;
        }
    }

    startSlide() {
        if (this.isGrounded && !this.isSliding) {
            this.isSliding = true;
            this.height = this.baseHeight * 0.5;
            this.y = this.getTargetY() - this.height;
            this.slideTimer = 500; // ms
        }
    }

    stopSlide() {
        this.isSliding = false;
        this.height = this.baseHeight;
        this.y = this.getTargetY() - this.height;
    }

    changeLane(direction) {
        this.lane = Math.max(0, Math.min(2, this.lane + direction));
    }

    getTargetY() {
        return this.groundY + this.laneOffsets[this.lane];
    }

    update(deltaTime) {
        // Gestion de la gravité
        this.vy += this.gravity;
        this.y += this.vy;

        const targetY = this.getTargetY();

        // Collision avec le sol du couloir actuel
        if (this.y + this.height > targetY) {
            this.y = targetY - this.height;
            this.vy = 0;
            this.isGrounded = true;
        }

        // Gestion du slide
        if (this.isSliding) {
            this.slideTimer -= deltaTime;
            if (this.slideTimer <= 0) {
                this.stopSlide();
            }
        }
        
        // Animation douce pour le changement de couloir (effet de profondeur)
        // Note: Ici le Y est déjà impacté par la lane, on pourrait lisser x et y.
    }

    draw(ctx) {
        // Dessin temporaire du phacochère (Rectangle ou Sprite)
        ctx.fillStyle = this.isSliding ? "#8e44ad" : "#e67e22";
        
        // Ombre portée
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.getTargetY(), this.width/2, 5, 0, 0, Math.PI*2);
        ctx.fill();

        // Corps
        ctx.fillStyle = this.isSliding ? "#d35400" : "#e67e22";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Directional indicator (Yeux?)
        ctx.fillStyle = "black";
        ctx.fillRect(this.x + this.width - 15, this.y + 15, 5, 5);
    }
}
