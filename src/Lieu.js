// ici on va gérer l'heure de notre jeu kasongo
function updateTimeContext() {
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 18; //là nous cnsiderons la nuis de 18 à 6h

    if (isNight) {
        document.body.classList.add = ('night-theme');
        console.log("Passons au mode nuit");
    } else {
        document.bidy.classList.remove('night-theme');

    }
    // récupérons les informations de notre lieu grace au gps et de la méteo
    function updataWeatherContext() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                //c'est létape cruciale car il faudra créer un compte gratuit sur OpenWeatherMap
                const apiKey = 'VOTRE_CLE_API'; // Remplacez par votre clé API OpenWeatherMap
                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

                try {
                    const response = await fetch(url);
                    const data = await response.json();
                    const weather = data.weather[0].main;
                    console.log(`Météo actuelle: ${weather}`);
                    // adaptation le thème du jeu en fonction de la météo ici
                    applyWeatherEffect(weather);
                } catch (error) {
                    console.error("Erreur lors de la récupération de la météo:", error);
                }
            }
            );
        }
    }
    function applyWeatherEffect(weather) {
        const container = document.body;
        if(weather === "Rain") {
            container.classList.add('weather-rain');
        } else {
            container.classList.remove('weather-rain');
        }
        if(weather === "Clear") {
            container.classList.add('weather-clear');
        } else {
            container.classList.remove('weather-clear');
        }
        if(weather === "Snow") {
            container.classList.add('weather-snow');
        } else {
            container.classList.remove('weather-snow');
        }
    }
    // lancons le jeu maintenant
    updateTimeContext();
    updataWeatherContext();
}