/**
 * Weather.js - Gestion de la météo réelle et du cycle jour/nuit
 */

export class WeatherSystem {
    constructor(game) {
        this.game = game;
        this.weatherData = {
            temp: 20,
            condition: 'clear', // clear, rainy, foggy, snowy
            isDay: true,
            city: 'Inconnu'
        };
        
        this.init();
    }

    async init() {
        try {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const { latitude, longitude } = position.coords;
                    await this.fetchWeather(latitude, longitude);
                });
            } else {
                console.log("Géolocalisation non disponible");
                this.applyMockWeather();
            }
        } catch (error) {
            console.error("Erreur Weather:", error);
            this.applyMockWeather();
        }
    }

    async fetchWeather(lat, lon) {
        try {
            // Utilisation de Open-Meteo (Gratuit, pas de clé requise)
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            const data = await response.json();
            
            const weatherCode = data.current_weather.weathercode;
            this.weatherData.isDay = data.current_weather.is_day === 1;
            this.weatherData.temp = data.current_weather.temperature;
            
            // Mapping des codes Open-Meteo
            if (weatherCode >= 51 && weatherCode <= 67) this.weatherData.condition = 'rainy';
            else if (weatherCode >= 45 && weatherCode <= 48) this.weatherData.condition = 'foggy';
            else if (weatherCode >= 71 && weatherCode <= 86) this.weatherData.condition = 'snowy';
            else this.weatherData.condition = 'clear';

            this.updateUI();
        } catch (e) {
            this.applyMockWeather();
        }
    }

    applyMockWeather() {
        // Simulation si l'API échoue ou si refus de géo
        const hours = new Date().getHours();
        this.weatherData.isDay = hours > 6 && hours < 20;
        this.updateUI();
    }

    updateUI() {
        const icon = document.getElementById('weather-icon');
        const loc = document.getElementById('location-name');
        
        const icons = {
            clear: this.weatherData.isDay ? '☀️' : '🌙',
            rainy: '🌧️',
            foggy: '🌫️',
            snowy: '❄️'
        };
        
        if (icon) icon.innerText = icons[this.weatherData.condition] || '⛅';
        if (loc) loc.innerText = this.weatherData.isDay ? 'Mode Jour' : 'Mode Nuit';
        
        // Appliquer les styles au jeu via le Game Engine
        this.applyToGame();
    }

    applyToGame() {
        // Cette méthode sera appelée par Game pour ajuster les couleurs du fond
        // On peut stocker des thèmes de couleurs ici
    }

    getTheme() {
        if (!this.weatherData.isDay) {
            return {
                skyTop: '#000428',
                skyBottom: '#004e92',
                ground: '#1a1a1a',
                particles: 'rgba(255,255,255,0.1)'
            };
        }
        
        if (this.weatherData.condition === 'rainy') {
            return {
                skyTop: '#4B515D',
                skyBottom: '#959595',
                ground: '#2c3e50',
                particles: 'rgba(100,100,255,0.5)'
            };
        }

        // Default Clear Day
        return {
            skyTop: '#1a2a6c',
            skyBottom: '#b21f1f',
            ground: '#3d2b1f',
            particles: 'rgba(255,255,255,0.2)'
        };
    }
}
