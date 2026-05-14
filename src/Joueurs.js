class Joueur {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.w = 60; // Légèrement plus large pour l'image
        this.h = 45;
        this.baseH = 45;
        this.slideH = 25;
        this.x = 150;
        this.y = 215;
        this.dy = 0;
        this.jumpF = -15;
        this.gravity = 0.8;
        this.isGrounded = true;
        this.isSliding = false;
        this.groundY = 260;

        this.image = new Image();
        this.image.src = 'assets/images/phacochere.png';
        this.imageLoaded = false;
        this.image.onload = () => {
            this.imageLoaded = true;
        };

        // Animation state
        this.frame = 0;
        this.animSpeed = 0.15;
        this.rotation = 0;
        
        // Head movement state
        this.headAngle = 0;
        this.headTimer = 0;
        this.isMovingHead = false;
    }

    jump() {
        if (this.isGrounded && !this.isSliding) {
            this.dy = this.jumpF;
            this.isGrounded = false;
        }
    }

    slide() {
        if (this.isGrounded && !this.isSliding) {
            this.isSliding = true;
            this.h = this.slideH;
            this.y = this.groundY - this.h;
        }
    }

    stopSlide() {
        if (this.isSliding) {
            this.isSliding = false;
            this.h = this.baseH;
            this.y = this.groundY - this.h;
        }
    }

    update(deltaTime) {
        if (!this.isGrounded) {
            this.dy += this.gravity;
            this.y += this.dy;
        }

        if (this.y + this.h >= this.groundY) {
            this.y = this.groundY - this.h;
            this.dy = 0;
            this.isGrounded = true;
        }

        this.frame += this.animSpeed;

        // Head movement logic
        this.headTimer -= deltaTime;
        if (this.headTimer <= 0) {
            this.isMovingHead = !this.isMovingHead;
            this.headTimer = 500 + Math.random() * 2000;
        }

        if (this.isMovingHead) {
            this.headAngle = Math.sin(this.frame * 0.5) * 0.1;
        } else {
            this.headAngle *= 0.9;
        }
    }

    draw(ctx) {
        ctx.save();
        
        if (this.isSliding) {
            ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
            ctx.scale(1, 0.5); // Écraser l'image pour glisser
            ctx.translate(-(this.x + this.w / 2), -(this.y + this.h / 2));
        }

        // Apply a bit of tilt based on vertical movement or head movement
        const tilt = this.dy * 0.02 + this.headAngle;
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        ctx.rotate(tilt);
        ctx.translate(-(this.x + this.w / 2), -(this.y + this.h / 2));

        if (this.imageLoaded) {
            // Effet pour fondre l'animal dans le paysage (teinte ambiante)
            if (env.isNight) {
                ctx.filter = 'brightness(0.5) sepia(0.5) hue-rotate(200deg)';
            } else if (env.gameTime > 17 || env.gameTime < 7) {
                ctx.filter = 'brightness(0.8) sepia(0.3) hue-rotate(-20deg)';
            }
            
            ctx.drawImage(this.image, this.x, this.y, this.w, this.h);
            ctx.filter = 'none';
        } else {
            // Fallback si l'image ne charge pas
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(this.x, this.y, this.w, this.h);
        }
        
        ctx.restore();

        // Effet de poussière
        if (this.isGrounded) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            const dustSize = 3 + Math.sin(this.frame * 2) * 2;
            ctx.beginPath();
            ctx.arc(this.x, this.groundY, dustSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
