import { NormalizedWeather, WeatherProvider } from "./types";

export class DemoWeatherAdapter implements WeatherProvider {
  async getWeatherForecast(lat: number, lon: number): Promise<NormalizedWeather> {
    // Deterministic forecast designed for the Hero Farmer Ravi Kumar (Ranchi)
    const isRanchiRegion = Math.abs(lat - 23.34) < 1.0;
    
    return {
      temperatureC: isRanchiRegion ? 28.5 : 29.0,
      humidityPercent: isRanchiRegion ? 88 : 75,
      rainfallMm: 42.0,
      rainProbabilityPercent: 85,
      windSpeedKmh: 14.5,
      condition: "Heavy Rain Expected Tomorrow (कल भारी वर्षा)",
      isRainExpected: true,
      forecastDate: new Date(Date.now() + 86400000),
      summary: "85% probability of heavy monsoon rainfall (42mm) expected within the next 24-36 hours.",
    };
  }
}

export class OpenWeatherAdapter implements WeatherProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getWeatherForecast(lat: number, lon: number): Promise<NormalizedWeather> {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`
      );
      if (!res.ok) throw new Error(`OpenWeather API returned ${res.status}`);
      const data = await res.json();
      const first = data.list[0];
      const rainChance = Math.round((first.pop || 0) * 100);
      const rainfall = first.rain ? (first.rain["3h"] || 0) : 0;

      return {
        temperatureC: first.main.temp,
        humidityPercent: first.main.humidity,
        rainfallMm: rainfall,
        rainProbabilityPercent: rainChance,
        windSpeedKmh: Math.round(first.wind.speed * 3.6),
        condition: first.weather[0]?.description || "Partly Cloudy",
        isRainExpected: rainChance > 50 || rainfall > 5,
        forecastDate: new Date(first.dt * 1000),
        summary: `Forecast: ${first.weather[0]?.main}, Rain Probability ${rainChance}%, Temp ${first.main.temp}°C.`,
      };
    } catch (err) {
      console.warn("OpenWeatherAdapter failed, falling back to DemoWeatherAdapter:", err);
      return new DemoWeatherAdapter().getWeatherForecast(lat, lon);
    }
  }
}

const isExplicitDemo = process.env.DEMO_MODE === "true";
const weatherKey = process.env.WEATHER_API_KEY;

export const weatherProvider: WeatherProvider =
  !isExplicitDemo && weatherKey
    ? new OpenWeatherAdapter(weatherKey)
    : new DemoWeatherAdapter();
