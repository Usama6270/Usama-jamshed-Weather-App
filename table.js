let currentPage = 1;
const rowsPerPage = 10;
let weatherData = [];
let filteredData = [];
let unit = 'metric'; 
function fetchWeatherForecast(city = 'London') {
    const apiKey = 'e92d77cd5696959572165b80ec187006'; 
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unit}&appid=${apiKey}`;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            weatherData = data.list; 
            filteredData = weatherData; 
            displayTable(weatherData, currentPage);
        })
        .catch(error => console.error('Error fetching weather data:', error));
}
function displayTable(data, page) {
    const tableBody = document.querySelector('#weatherTable tbody');
    tableBody.innerHTML = ''; 
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = data.slice(start, end);
    paginatedData.forEach(item => {
        const row = document.createElement('tr');
        const tempUnit = unit === 'metric' ? '°C' : '°F'; 
        row.innerHTML = `
            <td>${new Date(item.dt_txt).toLocaleDateString()}</td>
            <td>${item.main.temp} ${tempUnit}</td>
            <td>${item.weather[0].description}</td>
        `;
        tableBody.appendChild(row);
    });
    document.getElementById('pageNumber').innerText = `Page ${currentPage}`;
    updatePaginationButtons(data.length);
}
function updatePaginationButtons(totalRows) {
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage * rowsPerPage >= totalRows;
}
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayTable(filteredData, currentPage);
    }
}
function nextPage() {
    if (currentPage * rowsPerPage < filteredData.length) {
        currentPage++;
        displayTable(filteredData, currentPage);
    }
}
function searchWeather() {
    const city = document.getElementById('cityInput').value;
    if (city) {
        fetchWeatherForecast(city);
    } else {
        alert("Please enter a city name.");
    }
}
function toggleUnits() {
    const unitToggle = document.getElementById('unitToggle');
    unit = unitToggle.checked ? 'imperial' : 'metric'; 
    const city = document.getElementById('cityInput').value || 'London'; 
    fetchWeatherForecast(city);
}
function handleFilterChange(value) {
    switch (value) {
        case '0':
            sortByTemperatureAsc();
            break;
        case '1':
            sortByTemperatureDesc();
            break;
        case '2':
            showHighestTemp();
            break;
        case '3':
            filterRainyDays();
            break;
    }
}
function sortByTemperatureAsc() {
    filteredData.sort((a, b) => a.main.temp - b.main.temp);
    displayTable(filteredData, 1);
}
function sortByTemperatureDesc() {
    filteredData.sort((a, b) => b.main.temp - a.main.temp);
    displayTable(filteredData, 1);
}
function showHighestTemp() {
    const highestTempDay = weatherData.reduce((prev, current) => (prev.main.temp > current.main.temp) ? prev : current);
    filteredData = [highestTempDay]; 
    displayTable(filteredData, 1);
}
function filterRainyDays() {
    filteredData = weatherData.filter(item => item.weather[0].description.includes('rain'));
    displayTable(filteredData, 1);
}
window.onload = () => {
    fetchWeatherForecast();
};
async function handleChat() {
    const input = document.getElementById('chatInput').value;
    const responseDiv = document.getElementById('chatResponse');
    if (input.toLowerCase().includes('weather')) {
        const cityMatch = input.match(/weather in (\w+)/i);
        const city = cityMatch ? cityMatch[1] : 'London'; 
        try {
            const weatherInfo = await fetchWeatherData(city);
            if (weatherInfo) {
                responseDiv.innerHTML = `The weather in ${city} is ${weatherInfo.description} with a temperature of ${weatherInfo.temp} ${unit === 'metric' ? '°C' : '°F'}.`;
            } else {
                responseDiv.innerHTML = `Sorry, I couldn't retrieve the weather data for "${city}". Please check the city name and try again.`;
            }
        } catch (error) {
            responseDiv.innerHTML = `An error occurred while fetching weather data. Please try again later.`;
        }
    } else {
        responseDiv.innerHTML = `I am currently able to answer weather-related queries only.`;
    }
    document.getElementById('chatInput').value = '';
}
async function fetchWeatherData(city) {
    const apiKey = 'e92d77cd5696959572165b80ec187006'; 
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${apiKey}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (data.cod === 200) {
            const weatherInfo = {
                temp: data.main.temp,
                description: data.weather[0].description
            };
            return weatherInfo;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching current weather data:', error);
        return null;
    }
}
window.onload = () => {
    fetchWeatherData('London').then(info => {
        console.log('Default weather data fetched:', info);
    });
};
