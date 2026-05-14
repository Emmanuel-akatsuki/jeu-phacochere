class GameStorage {
    static getHighScore() {
        return parseInt(localStorage.getItem('phacochere_highscore')) || 0;
    }

    static setHighScore(score) {
        const currentHighScore = this.getHighScore();
        if (score > currentHighScore) {
            localStorage.setItem('phacochere_highscore', score);
            return true;
        }
        return false;
    }
}
