import { useWeather } from "../context/WeatherContext";
import { format, parseISO } from "date-fns";

export function ForecastSection() {
  const { forecast, hourly } = useWeather();

  if (!forecast.length) return null;

  return (
    <div className="w-full space-y-8 mt-8">
      {/* Hourly Forecast */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">24-Hour Forecast</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
          {hourly.map((item, i) => (
            <div 
              key={i} 
              className="min-w-[100px] flex-shrink-0 snap-center flex flex-col items-center p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white"
            >
              <span className="text-sm text-white/70">
                {format(parseISO(item.dt_txt), "ha")}
              </span>
              <img 
                src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                alt="weather icon"
                className="w-12 h-12 my-2 drop-shadow-md"
              />
              <span className="text-xl font-semibold">{Math.round(item.main.temp)}&deg;</span>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">7-Day Forecast</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {forecast.map((day, i) => (
            <div 
              key={i} 
              className="flex lg:flex-col items-center justify-between p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white"
            >
              <span className="text-sm font-medium w-16 lg:w-auto lg:mb-2">
                {i === 0 ? "Today" : format(parseISO(day.date), "EEE")}
              </span>
              
              <div className="flex items-center justify-center lg:mb-2">
                <img 
                  src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                  alt="weather icon"
                  className="w-12 h-12 drop-shadow-md"
                />
              </div>

              <div className="flex gap-3 text-sm w-24 justify-end lg:justify-center">
                <span className="font-bold">{Math.round(day.maxTemp)}&deg;</span>
                <span className="text-white/50">{Math.round(day.minTemp)}&deg;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
