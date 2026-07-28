import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { WeatherProvider, useWeather } from "./context/WeatherContext";
import { SearchBar } from "./components/SearchBar";
import { HeroSection } from "./components/HeroSection";
import { ForecastSection } from "./components/ForecastSection";
import { DetailCards } from "./components/DetailCards";
import { AQIDashboard } from "./components/AQIDashboard";
import { WeatherMap } from "./components/WeatherMap";
import { ChatBot } from "./components/ChatBot";
import { CloudRain, Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function WeatherApp() {
  const { loading, error, current } = useWeather();

  const getBackgroundClass = () => {
    if (!current) return "bg-slate-900";
    const desc = current.weather[0].main.toLowerCase();
    if (desc.includes("clear")) return "bg-gradient-to-b from-blue-900 to-indigo-950";
    if (desc.includes("rain")) return "bg-gradient-to-b from-slate-900 to-slate-800";
    if (desc.includes("thunderstorm")) return "bg-gradient-to-b from-indigo-950 to-purple-950";
    if (desc.includes("snow")) return "bg-gradient-to-b from-sky-900 to-blue-900";
    if (desc.includes("cloud")) return "bg-gradient-to-b from-slate-800 to-gray-900";
    return "bg-gradient-to-b from-slate-900 to-indigo-950";
  };

  return (
    <div className={`min-h-[100dvh] w-full transition-colors duration-1000 ${getBackgroundClass()} overflow-hidden relative`}>
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <header className="mb-12 flex flex-col items-center">
          <div className="flex items-center gap-2 text-white mb-6">
            <CloudRain className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold tracking-tight">BadalMitra</h1>
          </div>
          <SearchBar />
          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200">
              {error}
            </div>
          )}
        </header>

        {loading && !current ? (
          <div className="flex flex-col items-center justify-center h-64 text-white">
            <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-400" />
            <p className="text-white/60">Fetching weather intelligence...</p>
          </div>
        ) : current ? (
          <div className="space-y-6 pb-24">
            <HeroSection />
            <DetailCards />
            <ForecastSection />
            <AQIDashboard />
            <WeatherMap />
          </div>
        ) : null}
      </div>

      <footer className="absolute bottom-0 w-full text-center py-6 text-white/40 text-sm z-10 border-t border-white/5 backdrop-blur-md">
         © 2026 Shubham Narware· BadalMitra Weather Intelligence
      </footer>

      <ChatBot />
    </div>
  );
}

function Home() {
  return (
    <WeatherProvider>
      <WeatherApp />
    </WeatherProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
