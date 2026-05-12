class Joueur {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.w = 40;
        this.h = 60;
        this.baseH = 60;
        this.slideH = 30;
        this.x = 150;
        this.y = 200;
        this.dy = 0;
        this.jumpF = -15;
        this.gravity = 0.8;
        this.isGrounded = true;
        this.isSliding = false;
        this.groundY = 260;

        // Animation state
        this.frame = 0;
        this.animSpeed = 0.15;
        this.rotation = 0;
    }

    jump() {
        if (this.isGrounded && !this.isSliding) {
            this.dy = this.jumpF;
            this.isGrounded = false;
            this.rotation = -0.2; // Lean back when jumping
        }
    }

    slide() {
        if (this.isGrounded && !this.isSliding) {
            this.isSliding = true;
            this.h = this.slideH;
            this.y = this.groundY - this.h;
            this.rotation = 0.1; // Lean forward when sliding
        }
    }

    stopSlide() {
        if (this.isSliding) {
            this.isSliding = false;
            this.h = this.baseH;
            this.y = this.groundY - this.h;
            this.rotation = 0;
        }
    }

    update(deltaTime) {
        // Physics
        if (!this.isGrounded) {
            this.dy += this.gravity;
            this.y += this.dy;
            
            // Rotate in air
            if (this.dy > 0) {
                this.rotation += 0.02; // Start leaning forward during fall
            }
        } else {
            if (!this.isSliding) {
                this.rotation = 0;
            }
        }

        // Ground collision
        if (this.y + this.h >= this.groundY) {
            this.y = this.groundY - this.h;
            this.dy = 0;
            this.isGrounded = true;
        }

        // Animation logic
        this.frame += this.animSpeed;
    }

    draw(ctx) {
        ctx.save();
        
        // Apply transformations for animation
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        ctx.rotate(this.rotation);
        
        // Simple representation of a phacochere
        // Body
        ctx.fillStyle = this.isSliding ? '#8d6e63' : '#5d4037'; // Brownish colors
        ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
        
        // Head/Snout (if running or jumping)
        if (!this.isSliding) {
            ctx.fillStyle = '#4e342e';
            ctx.fillRect(this.w / 2 - 5, -this.h / 2 + 5, 15, 15);
            
            // Tusk (défense)
            ctx.fillStyle = 'white';
            ctx.fillRect(this.w / 2 + 5, -this.h / 2 + 12, 10, 4);
        }

        // Add a simple "bounce" animation when running
        let bobbing = 0;
        if (this.isGrounded && !this.isSliding) {
            bobbing = Math.sin(this.frame) * 3;
            ctx.translate(0, bobbing);
        }
        
        // Eye
        ctx.fillStyle = 'black';
        ctx.fillRect(this.w / 2 - 2, -this.h / 2 + 8, 3, 3);
        
        ctx.restore();
        
        // Dust effect when running or sliding
        if (this.isGrounded) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            const dustSize = 5 + Math.sin(this.frame * 2) * 2;
            ctx.beginPath();
            ctx.arc(this.x, this.groundY - 2, dustSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

if (typeof module !== 'undefined') {
    module.exports = Joueur;
}
