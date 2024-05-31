const apiKey = '7304cd9d105898b7d591d2a6d6a89de5';
const pixabayApiKey = '44073489-bce391c3e610e818abe66b71d';
console.log('JavaScript file loaded'); // Initial console log


async function fetchWeather(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (response.ok) {
            return data;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('Error fetching weather data: ' + error.message);
    }
}

// Event listener for the input field


async function fetchCityImages(city) {
    const url = `https://pixabay.com/api/?key=${pixabayApiKey}&q=${encodeURIComponent(city)}&image_type=photo&category=places`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (response.ok && data.hits.length > 0) {
            return data.hits.map(hit => hit.webformatURL);
        } else {
          // if no images use default
          const defaultImages = [
             './default/clouds.jpg',
             './default/sunset.jpg',
             './default/sunsetsky.jpg'
         ];
         initSlider(defaultImages);
        }
    } catch (error) {
        console.error('Error fetching city images:', error);
       // On error, use default images
       const defaultImages = [
          './default/clouds.jpg',
          './default/sunset.jpg',
          './default/sunsetsky.jpg',
          './default/dandelion.jpg',
          './default/thunderstorm.jpg'
      ];
      initSlider(defaultImages);
    }
 }


 async function getWeatherByCity() {
    const city = document.getElementById('cityInput').value;
    if (city) {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

        try {
            // Fetch weather data
            const weatherResponse = await fetch(weatherUrl);
            const weatherData = await weatherResponse.json();
            if (!weatherResponse.ok) {
                throw new Error(weatherData.message);
            }

            // Fetch forecast data
            const forecastResponse = await fetch(forecastUrl);
            const forecastData = await forecastResponse.json();
            if (!forecastResponse.ok) {
                throw new Error(forecastData.message);
            }

            // Fetch city images
            const cityImages = await fetchCityImages(city);

            // Display weather, forecast, and initialize slider
            displayWeather(weatherData);
            displayForecast(forecastData);
            if (cityImages && Array.isArray(cityImages) && cityImages.length > 0) {
                initSlider(cityImages);
            } else {
                console.warn('No city images available.');
            }
        } catch (error) {
            console.error('Error fetching weather data:', error);
            alert('Error fetching weather data: ' + error.message);
        }
    } else {
        alert('Please enter a city name.');
    }
}
document.getElementById('cityInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        getWeatherByCity();
    }
});


async function getWeatherByLocation() {
   if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(async (position) => {
           const { latitude, longitude } = position.coords;
           const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
           const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
           console.log('Fetching weather and forecast for current location'); // Debugging log
           const weatherData = await fetchWeather(weatherUrl);
           displayWeather(weatherData);
           const forecastData = await fetchWeather(forecastUrl);
           displayForecast(forecastData);
           const cityImages = await fetchCityImages(weatherData.name);
           initSlider(cityImages);
       }, (error) => {
           alert('Geolocation error: ' + error.message);
       });
   } else {
       alert('Geolocation is not supported by this browser.');
   }
}


function displayWeather(data) {
    if (data) {
        const weatherDiv = document.getElementById('weather');
        let iconSrc = '';

        // Extracting keywords from weather description
        const description = data.weather[0].description.toLowerCase();
        if (description.includes('clear')) {
            iconSrc = './img/clear.png';
        } else if (description.includes('clouds')) {
            iconSrc = './img/clouds.png';
        } else if (description.includes('snow')) {
            iconSrc = './img/snow.png';
         } else if (description.includes('fog')) {
            iconSrc = './img/mist.png';
        } else if (description.includes('mist')) {
            iconSrc = './img/fog.png';
        } else if (description.includes('rain')) {
            iconSrc = './img/rain.png';
        } else if (description.includes('thund')) { // Checking for 'thund' to cover thunderstorms
            iconSrc = './img/thunder.png';
        } else {
            //display icon from open weather if no icon match is found
            iconSrc = 'https://openweathermap.org/img/w/${data.weather[0].icon}.png';
        }

        // Displaying weather information with custom icon
        weatherDiv.innerHTML = `
            <img src="${iconSrc}" alt="${data.weather[0].description}">
            <h1 class="temp" id="current-temp">${Math.round(data.main.temp)}°C</h1>
            <h2 class="city">${data.name}</h2>
            <div class="details">
                <div class="col">
                    <img src="./Img/humidity.png" alt="humidity icon">
                    <div>
                        <p class="humidity">${data.main.humidity}%</p>
                        <p>Humidity</p>
                    </div>
                </div>
                <div class="col">
                    <img src="./Img/wind.png" alt="wind icon">
                    <div>
                        <p class="wind">${Math.round(data.wind.speed*3.6)}km/h</p>
                        <p>Wind Speed</p>
                    </div>
                </div>
            </div>
        `;
    }
    document.querySelector(".weather").style.display = "block";
    document.querySelector(".swiper-container").style.display = "block";
    document.querySelector(".search").style.display = "block";
    document.querySelector(".error").style.display = "none";
    document.querySelector(".location-btn").style.display = "none";
    document.querySelector(".seperator").style.display = "none";
    document.querySelector(".labelhead").style.display = "none";
    
};


    
    function displayForecast(data) {
        if (data) {
            const forecastDiv = document.getElementById('forecast');
            const list = data.list.filter((item) => item.dt_txt.includes('12:00:00')); // Get daily forecasts at noon
            forecastDiv.innerHTML = ''
            list.forEach((item) => {
                forecastDiv.innerHTML += `
                <div class="weather-forecast-item">
                <div class="day" id="day">${new Date(item.dt_txt).toLocaleDateString('en-GB', {
                   weekday: 'long'})}</div>
                <img src="https://openweathermap.org/img/w/${item.weather[0].icon}.png" alt="${item.weather[0].description}">
                <div class="temp">${Math.round(item.main.temp)}°C</div>
                <div class="humidity">${item.main.humidity}%</div>
                <div class="wind">${Math.round(item.wind.speed *3.6)}km/h</div>
    
          </div>
                `;
            });
             document.querySelector(".weather").style.display = "block";
             document.querySelector(".error").style.display = "none";
             document.querySelector(".location-btn").style.display = "none";
             document.querySelector(".seperator").style.display = "none";
             document.querySelector(".search").style.display = "block";
             document.querySelector(".labelhead").style.display = "none";
           
              
        }
    }
    

// Function to initialize the Swiper slider
function initSlider(images) {
   const swiper = new Swiper('.swiper-container', {
       slidesPerView: 1, // Display one slide at a time
       spaceBetween: 0, // No space between slides
       loop: true, // Enable infinite loop
       autoplay: {
           delay: 2000, // Autoplay delay in milliseconds
       },
       speed: 1000, // Transition speed in milliseconds
   });
   // Add images to slider
   const sliderWrapper = document.getElementById('city-image-slider');
   images.forEach(image => {
       const slide = document.createElement('div');
       slide.classList.add('swiper-slide');
       slide.innerHTML = `<img src="${image}" alt="City Image" width="250" height="250">`;
       sliderWrapper.appendChild(slide);
   });

   // Update slider
   swiper.update();
}
