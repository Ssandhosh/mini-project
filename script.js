const apiKey = '0cde15700e1d06866934fa32a198ff9d';
let chartInstance = null;

function updateGraph(data) {
    const ctx = document.getElementById("tempChart").getContext("2d");

    let labels = [];
    let temps = [];

    let dailyTemps = {};
    data.list.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString("en-US", { weekday: "short" });

        if (!dailyTemps[day]) {
            dailyTemps[day] = item.main.temp;
        }
    });

    labels = Object.keys(dailyTemps).slice(0, 7);
    temps = Object.values(dailyTemps).slice(0, 7);

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Temperature (°C)",
                    data: temps,
                    borderColor: "#FFA500",
                    backgroundColor: "rgba(255,165,0,0.2)",
                    borderWidth: 2,
                    tension: 0.4
                }
            ]
        }
    });
}

function fetchWeather(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&cnt=40&appid=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => updateWeatherUI(data))
        .catch(error => console.error("Error fetching data:", error));
}

function searchWeather() {
    const city = document.getElementById("city-input").value;
    if (city) {
        fetchWeather(city);
    } else {
        alert("Please enter a city name.");
    }
}

function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        }, () => {
            alert("Location access denied.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function fetchWeatherByCoords(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&cnt=40&appid=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => updateWeatherUI(data))
        .catch(error => console.error("Error fetching data:", error));
}

function updateWeatherUI(data) {
    document.getElementById("city-name").innerText = data.city.name;
    document.getElementById("temperature").innerText = `${Math.round(data.list[0].main.temp)}°C`;
    document.getElementById("description").innerText = data.list[0].weather[0].description;
    document.getElementById("humidity").innerText = `Humidity: ${data.list[0].main.humidity}%`;
    document.getElementById("wind").innerText = `Wind: ${data.list[0].wind.speed} km/h`;

    updateForecast(data);
    updateGraph(data);  // Ensuring updateGraph is called here after it's defined
}

function updateForecast(data) {
    const forecastDiv = document.getElementById("weekly-forecast");
    forecastDiv.innerHTML = "";

    let dailyForecast = {};
    data.list.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

        if (!dailyForecast[day]) {
            dailyForecast[day] = item.main.temp;
        }
    });

    Object.keys(dailyForecast).slice(0, 7).forEach(day => {
        forecastDiv.innerHTML += `
            <div class="forecast-item">
                <p>${day}</p>
                <p>${Math.round(dailyForecast[day])}°C</p>
            </div>
        `;
    });
}

document.getElementById("location-btn").addEventListener("click", getLocationWeather);
fetchWeather("New York");
