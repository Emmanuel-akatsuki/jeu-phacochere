class Environment {
    constructor() {
        this.isNight = false;
        this.weather = 'Clear';
        this.temp = 25;
        this.locationInfo = 'Chargement...';
        // Synchronisation avec l'heure réelle
        this.gameTime = new Date().getHours() + new Date().getMinutes() / 60;
        this.timeSpeed = 0.001; // Ralentissement de la progression du temps
        this.weatherTimer = 0;
    }

    async update(deltaTime = 0) {
        // Progression lente basée sur le temps réel ou accélérée légèrement
        this.gameTime = (this.gameTime + (deltaTime / 100 / 60)) % 24; // 10x temps réel
        this.isNight = this.gameTime < 6 || this.gameTime > 18;
        
        // Random weather changes
        this.weatherTimer -= deltaTime;
        if (this.weatherTimer <= 0) {
            this.changeWeather();
            this.weatherTimer = 3000 + Math.random() * 6000;
        }

        this.applyTheme();
    }

    changeWeather() {
        const weathers = ['Clear', 'Cloudy', 'Rain', 'Storm'];
        this.weather = weathers[Math.floor(Math.random() * weathers.length)];
        this.locationInfo = `Climat: ${this.weather}`;
        const weatherInfo = document.getElementById('weatherInfo');
        if (weatherInfo) weatherInfo.innerText = this.locationInfo;
    }

    applyTheme() {
        if (this.isNight) {
            document.body.classList.add('night-theme');
            document.body.classList.remove('day-theme');
        } else {
            document.body.classList.add('day-theme');
            document.body.classList.remove('night-theme');
        }
    }

    async updateWeather() {
        if ("geolocation" in navigator) {
            return new Promise((resolve) => {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const { latitude, longitude } = position.coords;
                    // Utilisation d'une API gratuite sans clé si possible, ou OpenWeatherMap
                    // Pour ce TP, on va essayer de récupérer les infos de base
                    try {
                        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
                        const data = await response.json();
                        this.temp = data.current_weather.temperature;
                        const code = data.current_weather.weathercode;
                        
                        // Mapping simple des codes WMO
                        if (code === 0) this.weather = 'Clear';
                        else if (code <= 3) this.weather = 'Cloudy';
                        else if (code >= 51 && code <= 67) this.weather = 'Rain';
                        else if (code >= 71 && code <= 77) this.weather = 'Snow';
                        else if (code >= 95) this.weather = 'Storm';
                        
                        this.locationInfo = `Climat: ${this.weather}, ${this.temp}°C`;
                        document.getElementById('weatherInfo').innerText = this.locationInfo;
                        this.applyWeatherEffects();
                        resolve();
                    } catch (error) {
                        console.error("Erreur météo:", error);
                        this.locationInfo = "Erreur météo";
                        resolve();
                    }
                }, (error) => {
                    console.error("Erreur géo:", error);
                    this.locationInfo = "Position refusée";
                    resolve();
                });
            });
        }
    }

    applyWeatherEffects() {
        document.body.className = document.body.className.replace(/weather-\w+/g, '');
        document.body.classList.add(`weather-${this.weather.toLowerCase()}`);
    }
}
