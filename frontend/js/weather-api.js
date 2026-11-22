(() => {
  "use strict";

  const config = window.WEATHER_CONFIG;

  async function requestJson(url) {
    let response;

    try {
      response = await fetch(url);
    } catch {
      throw new Error("Network problem. Check your connection and try again.");
    }

    if (!response.ok) {
      throw new Error("The weather service is having trouble. Please try again shortly.");
    }

    try {
      return await response.json();
    } catch {
      throw new Error("We couldn't read the weather response. Please try again.");
    }
  }

  async function findCity(cityName) {
    const params = new URLSearchParams({
      name: cityName,
      count: "1",
      language: "en",
      format: "json"
    });

    const data = await requestJson(`${config.geocodingUrl}?${params}`);

    if (!data.results || data.results.length === 0) {
      throw new Error("We couldn't find that place. Check the spelling or try a nearby city.");
    }

    const match = data.results[0];

    return {
      name: match.name,
      country: match.country || "",
      admin: match.admin1 || "",
      latitude: match.latitude,
      longitude: match.longitude,
      timezone: match.timezone || "auto"
    };
  }

  async function getWeather(latitude, longitude) {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "is_day",
        "precipitation",
        "weather_code",
        "wind_speed_10m"
      ].join(","),
      daily: "weather_code,temperature_2m_max,temperature_2m_min",
      forecast_days: String(config.forecastDays),
      timezone: "auto"
    });

    return requestJson(`${config.forecastUrl}?${params}`);
  }

  window.WeatherApi = { findCity, getWeather };
})();
