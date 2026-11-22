(() => {
  "use strict";

  const elements = {
    form: document.querySelector("#search-form"),
    input: document.querySelector("#city-input"),
    button: document.querySelector("#search-button"),
    status: document.querySelector("#status-message"),
    statusText: document.querySelector("#status-text"),
    content: document.querySelector("#weather-content"),
    empty: document.querySelector("#empty-state"),
    place: document.querySelector("#place-name"),
    date: document.querySelector("#local-date"),
    icon: document.querySelector("#current-icon"),
    condition: document.querySelector("#current-condition"),
    temperature: document.querySelector("#current-temperature"),
    feelsLike: document.querySelector("#feels-like"),
    wind: document.querySelector("#wind-speed"),
    humidity: document.querySelector("#humidity"),
    daylight: document.querySelector("#daylight"),
    forecast: document.querySelector("#forecast-list")
  };

  const conditions = {
    0: ["Clear sky", "sun"],
    1: ["Mainly clear", "sun-cloud"],
    2: ["Partly cloudy", "cloud-sun"],
    3: ["Overcast", "cloud"],
    45: ["Fog", "fog"],
    48: ["Depositing rime fog", "fog"],
    51: ["Light drizzle", "drizzle"],
    53: ["Drizzle", "drizzle"],
    55: ["Dense drizzle", "drizzle"],
    56: ["Freezing drizzle", "drizzle"],
    57: ["Heavy freezing drizzle", "drizzle"],
    61: ["Light rain", "rain"],
    63: ["Rain", "rain"],
    65: ["Heavy rain", "rain"],
    66: ["Freezing rain", "rain"],
    67: ["Heavy freezing rain", "rain"],
    71: ["Light snow", "snow"],
    73: ["Snow", "snow"],
    75: ["Heavy snow", "snow"],
    77: ["Snow grains", "snow"],
    80: ["Rain showers", "rain"],
    81: ["Rain showers", "rain"],
    82: ["Heavy showers", "rain"],
    85: ["Snow showers", "snow"],
    86: ["Heavy snow showers", "snow"],
    95: ["Thunderstorm", "storm"],
    96: ["Thunderstorm with hail", "storm"],
    99: ["Heavy thunderstorm", "storm"]
  };

  const iconPaths = {
    sun: '<circle cx="32" cy="32" r="10"/><path d="M32 5v7M32 52v7M5 32h7M52 32h7M13 13l5 5M46 46l5 5M51 13l-5 5M18 46l-5 5"/>',
    "sun-cloud": '<circle cx="39" cy="21" r="8"/><path d="M39 5v4M39 33v4M23 21h4M51 21h4M28 10l3 3M47 29l3 3"/><path d="M17 47h29a9 9 0 0 0 0-18 12 12 0 0 0-23-2 10 10 0 0 0-6 20Z"/>',
    "cloud-sun": '<path d="M15 46h31a9 9 0 0 0 0-18 12 12 0 0 0-23-2 10 10 0 0 0-8 20Z"/><path d="M16 12v6M5 23h6M8 15l4 4"/>',
    cloud: '<path d="M13 47h34a10 10 0 0 0 0-20 13 13 0 0 0-25-3 11 11 0 0 0-9 23Z"/>',
    fog: '<path d="M14 35h33a9 9 0 0 0 0-18 12 12 0 0 0-23-2 10 10 0 0 0-10 20ZM9 44h38M16 52h29"/>',
    drizzle: '<path d="M13 35h34a9 9 0 0 0 0-18 12 12 0 0 0-23-2 10 10 0 0 0-11 20Z"/><path d="m22 43-2 5m14-5-2 5m14-5-2 5"/>',
    rain: '<path d="M13 32h34a9 9 0 0 0 0-18 12 12 0 0 0-23-2 10 10 0 0 0-11 20Z"/><path d="m21 40-4 10m17-10-4 10m17-10-4 10"/>',
    snow: '<path d="M13 31h34a9 9 0 0 0 0-18 12 12 0 0 0-23-2 10 10 0 0 0-11 20Z"/><path d="M21 42v10m-4-5h8m-6-3 4 6m0-6-4 6m17-8v10m-4-5h8m-6-3 4 6m0-6-4 6"/>',
    storm: '<path d="M13 33h34a9 9 0 0 0 0-18 12 12 0 0 0-23-2 10 10 0 0 0-11 20Z"/><path d="m32 35-8 12h8l-3 10 13-16h-9l4-6"/>'
  };

  function weatherInfo(code) {
    return conditions[code] || ["Conditions unavailable", "cloud"];
  }

  function makeIcon(kind, className = "") {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 64 64");
    svg.setAttribute("class", className);
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2.5");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");

    const drawing = document.createElementNS("http://www.w3.org/2000/svg", "g");
    drawing.innerHTML = iconPaths[kind] || iconPaths.cloud;
    svg.appendChild(drawing);
    return svg;
  }

  function setStatus(message, state = "info") {
    elements.statusText.textContent = message;
    elements.status.dataset.state = state;
    elements.status.hidden = false;
  }

  function setLoading(isLoading) {
    elements.button.disabled = isLoading;
    elements.input.disabled = isLoading;
    elements.button.textContent = isLoading ? "Checking…" : "Check weather →";
    elements.status.classList.toggle("is-loading", isLoading);
  }

  function formatDate(dateString, options) {
    return new Date(`${dateString}T12:00:00`).toLocaleDateString(undefined, options);
  }

  function renderForecast(daily) {
    elements.forecast.replaceChildren();

    daily.time.forEach((date, index) => {
      const [label, iconName] = weatherInfo(daily.weather_code[index]);
      const item = document.createElement("article");
      item.className = "forecast-day";

      const day = document.createElement("p");
      day.className = "forecast-day-name";
      day.textContent = index === 0 ? "Today" : formatDate(date, { weekday: "short" });

      const dateLabel = document.createElement("p");
      dateLabel.className = "forecast-date";
      dateLabel.textContent = formatDate(date, { day: "numeric", month: "short" });

      const iconHolder = document.createElement("div");
      iconHolder.className = "forecast-icon";
      iconHolder.appendChild(makeIcon(iconName));

      const condition = document.createElement("p");
      condition.className = "forecast-condition";
      condition.textContent = label;

      const temps = document.createElement("p");
      temps.className = "forecast-temps";

      const high = document.createElement("strong");
      high.textContent = `${Math.round(daily.temperature_2m_max[index])}°`;

      const low = document.createElement("span");
      low.textContent = `${Math.round(daily.temperature_2m_min[index])}°`;

      temps.append(high, low);
      item.append(day, dateLabel, iconHolder, condition, temps);
      elements.forecast.appendChild(item);
    });
  }

  function renderWeather(city, weather) {
    const current = weather.current;
    const [label, iconName] = weatherInfo(current.weather_code);
    const placeParts = [city.name, city.admin, city.country].filter(Boolean);

    elements.place.textContent = placeParts.join(", ");
    elements.date.textContent = `Updated for ${formatDate(current.time.slice(0, 10), {
      weekday: "long", day: "numeric", month: "long"
    })}`;
    elements.icon.replaceChildren(makeIcon(iconName, "current-weather-icon"));
    elements.condition.textContent = label;
    elements.temperature.textContent = Math.round(current.temperature_2m);
    elements.feelsLike.textContent = Math.round(current.apparent_temperature);
    elements.wind.textContent = Math.round(current.wind_speed_10m);
    elements.humidity.textContent = `${Math.round(current.relative_humidity_2m)}%`;
    elements.daylight.textContent = current.is_day ? "Daytime" : "Night";
    renderForecast(weather.daily);

    elements.content.hidden = false;
    elements.empty.hidden = true;
  }

  async function searchWeather(cityName) {
    const cleanName = cityName.trim();

    if (!cleanName) {
      setStatus("Please enter a city or town name to get started.", "error");
      elements.input.focus();
      return;
    }

    setLoading(true);
    setStatus(`Looking up ${cleanName}…`, "loading");
    elements.content.hidden = true;
    elements.empty.hidden = true;

    try {
      const city = await window.WeatherApi.findCity(cleanName);
      setStatus(`Getting the latest conditions for ${city.name}…`, "loading");
      const weather = await window.WeatherApi.getWeather(city.latitude, city.longitude);

      if (!weather.current || !weather.daily || !weather.daily.time) {
        throw new Error("The forecast is incomplete right now. Please try again.");
      }

      renderWeather(city, weather);
      setStatus(`Showing the latest available report for ${city.name}.`, "success");
      localStorage.setItem(window.WEATHER_CONFIG.storageKey, city.name);
    } catch (error) {
      elements.content.hidden = true;
      elements.empty.hidden = false;
      setStatus(error.message || "Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    searchWeather(elements.input.value);
  });

  const savedCity = localStorage.getItem(window.WEATHER_CONFIG.storageKey);
  if (savedCity) {
    elements.input.value = savedCity;
    searchWeather(savedCity);
  } else {
    elements.empty.hidden = false;
    setStatus("Search for a city to see its weather report.");
  }
})();
