class Predator {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.w = 80;
        this.h = 60;
        this.x = 20;
        this.y = 200;
        this.offsetY = 0;
        this.frame = 0;
    }

    update(deltaTime, playerX) {
        // Le prédateur oscille pour simuler la course
        this.frame += 0.2; // Faster oscillation
        this.offsetY = Math.sin(this.frame) * 8;
        
        // Jitter effect to make it more scary
        this.x = 20 + Math.random() * 5;
    }

    draw(ctx) {
        ctx.save();
        
        // Corps du Lion (Orange)
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(this.x, this.y + this.offsetY, this.w, this.h);
        
        // Crinière
        ctx.fillStyle = '#d35400';
        ctx.fillRect(this.x + this.w - 20, this.y + this.offsetY - 10, 30, 80);
        
        // Yeux
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x + this.w - 5, this.y + this.offsetY + 15, 5, 5);
        
        // Queue
        ctx.strokeStyle = '#e67e22';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.h / 2 + this.offsetY);
        ctx.quadraticCurveTo(this.x - 20, this.y + this.offsetY, this.x - 10, this.y + this.h + this.offsetY);
        ctx.stroke();

        ctx.restore();
    }
}
