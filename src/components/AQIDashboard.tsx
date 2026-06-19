import { useWeather } from "../context/WeatherContext";

export function AQIDashboard() {
  const { aqi } = useWeather();

  if (!aqi || !aqi.list.length) return null;

  const data = aqi.list[0];
  const index = data.main.aqi;
  
  const aqiMap = {
    1: { label: "Good", color: "text-green-400", bg: "bg-green-400/20" },
    2: { label: "Fair", color: "text-yellow-400", bg: "bg-yellow-400/20" },
    3: { label: "Moderate", color: "text-orange-400", bg: "bg-orange-400/20" },
    4: { label: "Poor", color: "text-red-400", bg: "bg-red-400/20" },
    5: { label: "Very Poor", color: "text-purple-400", bg: "bg-purple-400/20" },
  };

  const current = aqiMap[index as keyof typeof aqiMap];

  return (
    <div className="w-full p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 text-white mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Air Quality Index</h3>
        <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${current.bg} ${current.color}`}>
          {index} - {current.label}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { name: "PM2.5", value: data.components.pm2_5 },
          { name: "PM10", value: data.components.pm10 },
          { name: "NO2", value: data.components.no2 },
          { name: "O3", value: data.components.o3 },
        ].map((item) => (
          <div key={item.name} className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <p className="text-sm text-white/50 mb-1">{item.name}</p>
            <p className="text-xl font-semibold">{item.value.toFixed(1)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
