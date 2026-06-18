import { useWeather } from "../context/WeatherContext";
import { Sunrise, Sunset } from "lucide-react";

export function HeroSection() {
  const { current } = useWeather();
  if (!current) return null;

  const sunrise = new Date((current.sys.sunrise + current.timezone) * 1000);
  const sunset = new Date((current.sys.sunset + current.timezone) * 1000);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  };

  const countryCode = current.sys.country.toLowerCase();

  return (
    <div className="w-full flex flex-col items-center justify-center py-12 text-center text-white">
      <div className="flex items-center justify-center gap-3 mb-2">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          {current.name}, {current.sys.country}
        </h1>
        <img
          src={`https://flagcdn.com/w40/${countryCode}.png`}
          srcSet={`https://flagcdn.com/w80/${countryCode}.png 2x`}
          alt={current.sys.country}
          title={current.sys.country}
          className="rounded-md shadow-md"
          style={{ height: '28px', width: 'auto' }}
        />
      </div>

      <div className="flex items-center justify-center gap-4 my-6">
        <img
          src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png`}
          alt={current.weather[0].description}
          className="w-32 h-32 drop-shadow-2xl"
        />
        <div className="text-8xl md:text-[8rem] font-light tracking-tighter">
          {Math.round(current.main.temp)}&deg;
        </div>
      </div>

      <p className="text-xl md:text-2xl font-medium capitalize text-white/90">
        {current.weather[0].description}
      </p>
      <p className="text-white/70 mt-2">
        Feels like {Math.round(current.main.feels_like)}&deg;C
      </p>

      <div className="flex items-center gap-6 mt-8 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
        <div className="flex items-center gap-2">
          <Sunrise className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-medium">{formatTime(sunrise)}</span>
        </div>
        <div className="w-px h-6 bg-white/20"></div>
        <div className="flex items-center gap-2">
          <Sunset className="w-5 h-5 text-orange-500" />
          <span className="text-sm font-medium">{formatTime(sunset)}</span>
        </div>
      </div>
    </div>
  );
}
