import { useWeather } from "../context/WeatherContext";
import { Droplets, Wind, Eye, Gauge, Cloud } from "lucide-react";

export function DetailCards() {
  const { current } = useWeather();
  if (!current) return null;

  const cards = [
    { title: "Humidity", value: `${current.main.humidity}%`, icon: Droplets, desc: "The dew point is feeling muggy" },
    { title: "Wind", value: `${current.wind.speed} m/s`, icon: Wind, desc: "Direction: " + (current.wind.deg ? `${current.wind.deg}°` : "N/A") },
    { title: "Visibility", value: `${(current.visibility / 1000).toFixed(1)} km`, icon: Eye, desc: "Clear view" },
    { title: "Pressure", value: `${current.main.pressure} hPa`, icon: Gauge, desc: "Standard atmospheric pressure" },
    { title: "Cloud Cover", value: `${current.clouds.all}%`, icon: Cloud, desc: "Cloudiness percentage" }
  ];

  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} className="p-5 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 text-white flex flex-col">
            <div className="flex items-center gap-2 text-white/60 mb-4">
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{card.title}</span>
            </div>
            <p className="text-2xl font-bold mb-1">{card.value}</p>
            <p className="text-xs text-white/40 mt-auto">{card.desc}</p>
          </div>
        );
      })}
    </div>
  );
}
