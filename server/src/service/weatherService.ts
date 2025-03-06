import dayjs from 'dayjs';
import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state: string;
}

// TODO: Define a class for the Weather object
class Weather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  temp: number;
  wind: number;
  humidity: number;

  constructor(
    city: string,
    date: string,
    icon: string,
    iconDescription: string,
    temp: number,
    wind: number,
    humidity: number,
  ) {
    this.city = city;
    this.date = date;
    this.icon = icon;
    this.iconDescription = iconDescription;
    this.temp = temp;
    this.wind = wind;
    this.humidity = humidity;
  }
}

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL?: string;
  private apiKey?: string;
  private city = '';

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
  }
  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string) {
    try {
      if (!this.baseURL || !this.apiKey) {
        throw new Error('Invalid API credentials');
      }

      const response: Coordinates[] = await fetch(query).then((res) => 
        res.json()
      );

      return response[0]; 
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    if (!locationData) {
      throw new Error('City could not be found');
    }
    const { name, lat, lon, country, state } = locationData;

    const coordinates: Coordinates = {
      name,
      lat,
      lon,
      country,
      state,
    };

    return coordinates;
  }
  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    const geocodeQuery = `${this.baseURL}/geo/1.0/direct?q=${this.city}&limit=1&appid=${this.apiKey}`;
    return geocodeQuery;
  }
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    const weatherQuery = `${this.baseURL}/data/2.5/forcast?lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&appid=${this.apiKey}`;
    return weatherQuery;
  }
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    return await this.fetchLocationData(this.buildGeocodeQuery()).then((data) =>
      this.destructureLocationData(data)
    );
  }
  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    try {
      const weatherData = await fetch(this.buildWeatherQuery(coordinates)).then((res) =>
        res.json()
      );
      if (!weatherData) {
        throw new Error('Weather data not found');
      }

      const currentWeather = this.parseCurrentWeather(
        weatherData.list[0]
      );

      const forecast: Weather[] = this.buildForecastArray(
        currentWeather,
        weatherData.list
      );

      return forecast;

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    const date = dayjs().format('MM/DD/YYYY');

    const currentWeather = new Weather(
      this.city,
      date,
      response.weather[0].icon,
      response.weather[0].description,
      response.temp,
      response.wind,
      response.humidity,
    );

    return currentWeather;
  }
  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    const forecast: Weather[] = [currentWeather];
    
    for (let i = 1; i < weatherData.length; i++) {
      const weather = weatherData[i];
      const forecastWeather = new Weather(
        this.city,
        dayjs.unix(weather.dt).format('MM/DD/YYYY'),
        weather.weather[0].icon,
        weather.weather[0].description,
        weather.temp,
        weather.wind,
        weather.humidity,
      );
      forecast.push(forecastWeather);
    }

    return forecast;
  }
  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    try {
      this.city = city;
      const coordinates = await this.fetchAndDestructureLocationData();
      if (coordinates) {
        const weather = await this.fetchWeatherData(coordinates);
        return weather;
      }

    } catch (error) {
      console.error(error);
      return error;
    }
    return null;
  }
}

export default new WeatherService();