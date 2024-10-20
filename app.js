const apiKey = 'e92d77cd5696959572165b80ec187006'; 
let isCelsius = true; 
document.querySelector('button').addEventListener('click', getWeather);
document.getElementById('unit-switch').addEventListener('change', () => {
    isCelsius = !isCelsius; 
    getWeather(); 
});
window.onload = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByLocation(latitude, longitude); 
            },
            (error) => {
                console.error("Geolocation error:", error);
                alert("Unable to retrieve your location. Please enter a city name.");
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
};
async function getWeatherByLocation(lat, lon) {
    try {
        const weatherResponse = await fetchWeatherDataByCoords(lat, lon);
        const forecastResponse = await fetchForecastDataByCoords(lat, lon);

        if (weatherResponse && forecastResponse) {
            updateWeatherInfo(weatherResponse);
            createCharts(forecastResponse);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Error fetching data. Please try again.");
    }
}
async function fetchWeatherDataByCoords(lat, lon) {
    try {
        const units = isCelsius ? 'metric' : 'imperial';
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`);
        if (!response.ok) {
            handleAPIError(response.status);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching weather data:", error);
        throw error;
    }
}
async function fetchForecastDataByCoords(lat, lon) {
    try {
        const units = isCelsius ? 'metric' : 'imperial';
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`);
        if (!response.ok) {
            handleAPIError(response.status);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching forecast data:", error);
        throw error;
    }
}
async function getWeather() {
    const city = document.getElementById('city-input').value.trim();
    if (!city) {
        alert("Please enter a city name");
        return;
    }
    try {
        const weatherResponse = await fetchWeatherData(city);
        const forecastResponse = await fetchForecastData(city);

        if (weatherResponse && forecastResponse) {
            updateWeatherInfo(weatherResponse);
            createCharts(forecastResponse);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Error fetching data. Please try again.");
    }
}
async function fetchWeatherData(city) {
    try {
        const units = isCelsius ? 'metric' : 'imperial';
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`);
        if (!response.ok) {
            handleAPIError(response.status);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching weather data:", error);
        throw error;
    }
}
async function fetchForecastData(city) {
    try {
        const units = isCelsius ? 'metric' : 'imperial';
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${units}`);
        if (!response.ok) {
            handleAPIError(response.status);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching forecast data:", error);
        throw error;
    }
}
function updateWeatherInfo(data) {
    document.getElementById('city-name').textContent = data.name;
    document.getElementById('temp').textContent = `${data.main.temp}°${isCelsius ? 'C' : 'F'}`;
    document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
    document.getElementById('wind-speed').textContent = `Wind Speed: ${data.wind.speed} ${isCelsius ? 'm/s' : 'mph'}`;
    document.getElementById('weather-desc').textContent = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    document.getElementById('weather-icon').src = iconUrl;
    const weatherDesc = data.weather[0].main.toLowerCase();
    const weatherInfo = document.getElementById('weather-info');
    if (weatherDesc.includes('cloud')) {
        weatherInfo.style.backgroundColor = 'gray';
    } else if (weatherDesc.includes('rain')) {
        weatherInfo.style.backgroundColor = 'blue';
    } else if (weatherDesc.includes('clear')) {
        weatherInfo.style.backgroundColor = 'yellow';
    } else {
        weatherInfo.style.backgroundColor = 'lightblue';
    }
}
function createCharts(forecastData) {
    const labels = forecastData.list.map(item => new Date(item.dt_txt).toLocaleDateString());
    const temps = forecastData.list.map(item => item.main.temp);
    const tempBarChart = new Chart(document.getElementById('tempBarChart'), {
        type: 'bar',
        data: {
            labels: labels.slice(0, 5),
            datasets: [{
                label: `Temperature (${isCelsius ? '°C' : '°F'})`,
                data: temps.slice(0, 5),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            animation: {
                duration: 1000, 
                easing: 'easeOutBounce' 
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    const tempLineChart = new Chart(document.getElementById('tempLineChart'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Temperature Forecast (${isCelsius ? '°C' : '°F'})`,
                data: temps,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            animation: {
                duration: 1500, 
                easing: 'easeOutQuad' 
            }
        }
    });
    const tempClassData = [
        temps.filter(temp => isCelsius ? temp < 10 : temp < 50).length,
        temps.filter(temp => isCelsius ? temp >= 10 && temp < 20 : temp >= 50 && temp < 68).length,
        temps.filter(temp => isCelsius ? temp >= 20 && temp < 30 : temp >= 68 && temp < 86).length,
        temps.filter(temp => isCelsius ? temp >= 30 : temp >= 86).length
    ];
    const weatherDoughnutChart = new Chart(document.getElementById('weatherDoughnutChart'), {
        type: 'doughnut',
        data: {
            labels: ['< 10°C', '10°C - 20°C', '20°C - 30°C', '> 30°C'],
            datasets: [{
                label: 'Temperature Categories',
                data: tempClassData,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
            }]
        },
        options: {
            responsive: true,
            animation: {
                animateScale: true, 
                animateRotate: true
            }
        }
    });
}
function handleAPIError(status) {
    if (status === 404) {
        alert("City not found. Please try a different city.");
    } else {
        alert("An error occurred while fetching the data.");
    }
}
