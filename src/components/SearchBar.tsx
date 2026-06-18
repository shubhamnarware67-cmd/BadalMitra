import { useState, useEffect, useRef } from "react";
import { useWeather } from "../context/WeatherContext";
import { Search, MapPin, Loader2, Mic } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export function SearchBar() {
  const { fetchWeather, detectLocation, getSearchSuggestions, searchSuggestions } = useWeather();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      getSearchSuggestions(query);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      fetchWeather(query);
      setIsFocused(false);
      setQuery("");
    }
  };

  const handleSelect = (city: string) => {
    fetchWeather(city);
    setIsFocused(false);
    setQuery("");
  };

  const startVoiceSearch = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setQuery(text);
      fetchWeather(text);
    };
    recognition.start();
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto z-50">
      <form onSubmit={handleSearch} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Search city..."
            className="pl-10 pr-10 py-6 text-lg rounded-2xl bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/50"
          />
          <button 
            type="button" 
            onClick={startVoiceSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors text-muted-foreground"
          >
            <Mic className="h-5 w-5" />
          </button>
        </div>
        <Button 
          type="button" 
          onClick={detectLocation}
          variant="outline"
          className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white"
        >
          <MapPin className="h-5 w-5" />
        </Button>
      </form>

      {isFocused && searchSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
          {searchSuggestions.map((s: any, i) => (
            <button
              key={i}
              onMouseDown={() => handleSelect(`${s.name}, ${s.country}`)}
              className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-lg text-white transition-colors flex items-center gap-2"
            >
              <MapPin className="h-4 w-4 text-primary" />
              <span>{s.name}</span>
              {s.state && <span className="text-white/50 text-sm">, {s.state}</span>}
              <span className="text-white/50 text-sm ml-auto">{s.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
