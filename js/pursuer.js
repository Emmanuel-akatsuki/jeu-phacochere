/**
 * Pursuer.js - La créature qui poursuit le phacochère
 */

export class Pursuer {
    constructor(game) {
        this.game = game;
        
        this.width = 120;
        this.height = 100;
        
        // Proximité : 0 (très loin) à 1 (attrapé)
        this.proximity = 0.3; 
        this.targetProximity = 0.3;
        
        this.x = -200; // Hors écran à gauche initialement
        this.y = this.game.height * 0.7;
    }

    update(deltaTime) {
        // Lissage de la proximité
        const ease = 0.05;
        this.proximity += (this.targetProximity - this.proximity) * ease;
        
        // Position X basée sur la proximité
        // 0% -> x = -200
        // 100% -> x = player.x
        const minX = -150;
        const maxX = this.game.player ? this.game.player.x - 20 : 100;
        this.x = minX + (maxX - minX) * this.proximity;
        
        // Suivre le couloir du joueur avec un léger retard
        if (this.game.player) {
            const targetY = this.game.player.getTargetY() - this.height;
            this.y += (targetY - this.y) * 0.1;
        }

        // Si proximité >= 1 -> Game Over
        if (this.proximity > 0.95 && this.game.isRunning) {
            this.game.gameOver();
        }

        // Récupération lente si pas d'erreurs
        if (this.targetProximity > 0.3) {
            this.targetProximity -= 0.0001 * deltaTime;
        }
    }

    increaseProximity(amount) {
        this.targetProximity = Math.min(1, this.targetProximity + amount);
    }

    draw(ctx) {
        // Dessin de la créature sombre (Silhouète avec yeux rouges)
        ctx.save();
        
        // Effet d'ombre/flou
        ctx.shadowBlur = 20;
        ctx.shadowColor = "red";
        
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        
        // Corps informe
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.y + this.height/2, this.width/2, this.height/2, 0, 0, Math.PI*2);
        ctx.fill();
        
        // Yeux
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(this.x + this.width * 0.7, this.y + this.height * 0.4, 5, 0, Math.PI*2);
        ctx.arc(this.x + this.width * 0.8, this.y + this.height * 0.4, 5, 0, Math.PI*2);
        ctx.fill();
        
        ctx.restore();
    }
}
