import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'dummy'; // Will fail if not provided but avoids crash
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

export interface WeatherData {
  name: string;
  sys: { country: string; sunrise: number; sunset: number };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  wind: { speed: number; deg?: number };
  weather: Array<{ id: number; main: string; description: string; icon: string }>;
  visibility: number;
  clouds: { all: number };
  coord: { lat: number; lon: number };
  timezone: number;
  dt: number;
}

export interface ForecastItem {
  dt: number;
  dt_txt: string;
  main: { temp: number; temp_min: number; temp_max: number; humidity: number };
  weather: Array<{ main: string; description: string; icon: string }>;
  wind: { speed: number };
  rain?: { '3h': number };
  pop: number; // Probability of precipitation
}

export interface AQIData {
  list: Array<{
    main: { aqi: number };
    components: { co: number; no: number; no2: number; o3: number; so2: number; pm2_5: number; pm10: number; nh3: number };
  }>;
}

export interface DailyForecast {
  date: string;
  minTemp: number;
  maxTemp: number;
  icon: string;
  description: string;
  pop: number;
}

interface WeatherContextType {
  current: WeatherData | null;
  forecast: DailyForecast[];
  hourly: ForecastItem[];
  aqi: AQIData | null;
  loading: boolean;
  error: string | null;
  searchSuggestions: any[];
  fetchWeather: (city: string) => Promise<void>;
  fetchByCoords: (lat: number, lon: number) => Promise<void>;
  detectLocation: () => void;
  getSearchSuggestions: (query: string) => Promise<void>;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider = ({ children }: { children: ReactNode }) => {
  const [current, setCurrent] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [hourly, setHourly] = useState<ForecastItem[]>([]);
  const [aqi, setAqi] = useState<AQIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);

  const processForecast = (list: ForecastItem[]) => {
    // Hourly: next 24 hours (8 items, 3h intervals)
    setHourly(list.slice(0, 8));

    // Daily: group by day
    const dailyMap = new Map<string, ForecastItem[]>();
    list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyMap.has(date)) dailyMap.set(date, []);
      dailyMap.get(date)?.push(item);
    });

    const dailyArr: DailyForecast[] = [];
    dailyMap.forEach((items, date) => {
      let minTemp = items[0].main.temp_min;
      let maxTemp = items[0].main.temp_max;
      let maxPop = 0;
      const icons: Record<string, number> = {};
      const descriptions: Record<string, number> = {};

      items.forEach(item => {
        if (item.main.temp_min < minTemp) minTemp = item.main.temp_min;
        if (item.main.temp_max > maxTemp) maxTemp = item.main.temp_max;
        if (item.pop > maxPop) maxPop = item.pop;
        
        const icon = item.weather[0].icon;
        icons[icon] = (icons[icon] || 0) + 1;
        
        const desc = item.weather[0].description;
        descriptions[desc] = (descriptions[desc] || 0) + 1;
      });

      const commonIcon = Object.keys(icons).reduce((a, b) => icons[a] > icons[b] ? a : b);
      const commonDesc = Object.keys(descriptions).reduce((a, b) => descriptions[a] > descriptions[b] ? a : b);

      dailyArr.push({
        date,
        minTemp,
        maxTemp,
        icon: commonIcon,
        description: commonDesc,
        pop: maxPop
      });
    });

    setForecast(dailyArr.slice(0, 7)); // max days we have
  };

  const fetchAllData = async (lat: number, lon: number, cityName?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentRes = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
      if (!currentRes.ok) throw new Error('Failed to fetch current weather');
      const currentData = await currentRes.json();
      setCurrent(currentData);

      const forecastRes = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
        processForecast(forecastData.list);
      }

      const aqiRes = await fetch(`${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
      if (aqiRes.ok) {
        const aqiData = await aqiRes.json();
        setAqi(aqiData);
      }

    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (city: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('City not found, try another name');
        throw new Error('Network error, check connection');
      }
      const data = await res.json();
      await fetchAllData(data.coord.lat, data.coord.lon, data.name);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  const fetchByCoords = async (lat: number, lon: number) => {
    await fetchAllData(lat, lon);
  };

  const detectLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchByCoords(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          setError('Location access denied');
        }
      );
    } else {
      setError('Geolocation not supported');
    }
  };

  const getSearchSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`${GEO_URL}/direct?q=${query}&limit=5&appid=${API_KEY}`);
      if (res.ok) {
        const data = await res.json();
        setSearchSuggestions(data);
      }
    } catch {
      setSearchSuggestions([]);
    }
  };

  // Initial load
  useEffect(() => {
    fetchWeather('Mumbai');
  }, []);

  return (
    <WeatherContext.Provider value={{
      current, forecast, hourly, aqi, loading, error, searchSuggestions,
      fetchWeather, fetchByCoords, detectLocation, getSearchSuggestions
    }}>
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};
