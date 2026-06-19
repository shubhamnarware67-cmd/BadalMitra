import { useState, useRef, useEffect } from 'react';
import { useWeather } from '../context/WeatherContext';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

function detectLang(text: string): 'hi' | 'en' {
  const hindiWords = ['kya','hai','bahar','mausam','kaisa','aaj','jana','chahiye','nahi','kyun','kitna','garmi','thandi','baarish','barish','hawa','batao','bata','accha','theek','kal','aur','kuch','hoga','hua','kar','mein','me','se','ko','ka','ki','ke','ye','vo','toh','phir','pehnu','kapde','niklu','jaun','chhata','suno','yaar','bhai','didi','sir','namaste','hii','helo','achi'];
  const lower = text.toLowerCase();
  const found = hindiWords.filter(w => lower.split(/\s+/).includes(w) || lower.includes(w));
  return found.length >= 1 ? 'hi' : 'en';
}

function getReply(weather: any, aqi: any, userMsg: string, lang: 'hi' | 'en'): string {
  if (!weather) {
    return lang === 'hi'
      ? "Yaar pehle koi city search karo upar, tab main kuch bata sakta hoon! 😅"
      : "Search a city first up top, then I can help! 😅";
  }

  const temp = Math.round(weather.main.temp);
  const feelsLike = Math.round(weather.main.feels_like);
  const desc = weather.weather[0].description.toLowerCase();
  const humidity = weather.main.humidity;
  const wind = weather.wind.speed;
  const city = weather.name;
  const country = weather.sys.country;
  const aqiIndex: number = aqi?.list?.[0]?.main?.aqi ?? 1;
  const pm25 = aqi?.list?.[0]?.components?.pm2_5?.toFixed(1) ?? 'N/A';

  const isRain = desc.includes('rain') || desc.includes('drizzle') || desc.includes('shower');
  const isClear = desc.includes('clear');
  const isCloud = desc.includes('cloud');
  const isThunder = desc.includes('thunder') || desc.includes('storm');
  const isHot = temp > 35;
  const isWarm = temp > 25 && temp <= 35;
  const isCool = temp >= 15 && temp <= 25;
  const isCold = temp < 15;
  const isBadAQI = aqiIndex >= 4;
  const isModAQI = aqiIndex === 3;
  const msg = userMsg.toLowerCase();

  const aqiLabels: Record<number, string> = { 1: 'Good 😊', 2: 'Fair 🙂', 3: 'Moderate 😐', 4: 'Poor 😷', 5: 'Very Poor ☠️' };

  // Greetings
  if (/^(hi|hello|hey|hii|helo|namaste|namaskar|sup|yo)\b/.test(msg)) {
    return lang === 'hi'
      ? `Namaste! 🙏 Main hoon BadalMitra Bot! ${city} ka mausam dekhke bata sakta hoon — bahar jaana chahiye ya nahi, kya pehnu, baarish aayegi, hawa kaisi hai — sab kuch! Poocho jaldi 😄`
      : `Hey hey! 👋 I'm BadalMitra Bot! Ask me about ${city}'s weather — should you go out, what to wear, rain check, AQI — anything! 😄`;
  }

  // Going outside
  if (msg.includes('bahar') || msg.includes('outside') || msg.includes('jana') || msg.includes('go out') || msg.includes('niklu') || msg.includes('jaun') || msg.includes('nikal') || msg.includes('ghoomne')) {
    if (lang === 'hi') {
      if (isThunder) return `Bhai ${city} mein bijli karak rahi hai! ⛈️ Bahar jaana toh bilkul mat — ghar mein raho, chai piyo aur Netflix dekho. Safety pehle!`;
      if (isRain) return `${city} mein baarish chal rahi hai! 🌧️ Agar bahut zaruri hai toh chhata + waterproof jacket leke jaao, warna ghar pe raho. Main hota toh nahi jaata. 😅`;
      if (isBadAQI) return `${city} ki hawa bohot kharab hai (AQI: ${aqiIndex}/5 — Poor)! 😷 Agar bahar jaana hi hai toh N95 mask zaroor pehno. Warna ghar pe hi raho yaar.`;
      if (isModAQI) return `${city} ka AQI ${aqiIndex}/5 hai — thoda moderate. 😐 Mask pehno aur zyada time bahar mat bitao. Short trip theek hai.`;
      if (isHot) return `${city} mein ${temp}°C chal raha hai bhai! 🥵 Bahar nikal rahe ho toh: paani ki bottle, sunscreen, aur thoda himmat. Dono waqt (subah/shaam) better rahega.`;
      if (isCold) return `${city} mein ${temp}°C — baraf jaisi thandi! 🥶 Sweater + jacket + muffler ke saath jaao. Chai thermos mein pack karo, seriously.`;
      if (isClear && !isBadAQI) return `${city} mein aaj mausam ekdum zabardast hai! ☀️ ${temp}°C, AQI ${aqiIndex}/5 — perfect din ghoomne ka! Jaldi niklo bahar! 🎉`;
      return `${city} mein ${temp}°C aur ${desc} hai. Theek theek mausam hai — nikal sakte ho! Paani bottle saath rakhna. 💧`;
    } else {
      if (isThunder) return `${city} has a thunderstorm right now! ⛈️ Absolutely do NOT go out. Stay safe indoors, grab a hot drink.`;
      if (isRain) return `It's raining in ${city}! 🌧️ Only go out if necessary — take a waterproof jacket + umbrella. I'd personally stay in. 😅`;
      if (isBadAQI) return `AQI in ${city} is ${aqiIndex}/5 (Poor air quality)! 😷 If you must go out, wear an N95 mask. Better to stay indoors.`;
      if (isHot) return `${city} is ${temp}°C — scorching! 🥵 Go out early morning or evening, take water, wear light clothes & sunscreen.`;
      if (isCold) return `${city} is ${temp}°C — quite cold! 🥶 Layer up: sweater + jacket + scarf. You'll be fine with the right gear.`;
      if (isClear && !isBadAQI) return `Beautiful day in ${city}! ☀️ ${temp}°C, AQI ${aqiIndex}/5 — ideal conditions. Go out and enjoy! 🎉`;
      return `${city} is ${temp}°C with ${desc}. Decent weather — go ahead! Stay hydrated. 💧`;
    }
  }

  // Temperature
  if (msg.includes('temp') || msg.includes('kitna') || msg.includes('degree') || msg.includes('garmi') || msg.includes('thandi') || msg.includes('garam') || msg.includes('hot') || msg.includes('cold') || msg.includes('warm') || msg.includes('cool')) {
    if (lang === 'hi') {
      if (isHot) return `${city} mein aaj ${temp}°C — matlab sun hi zameen pe aa gaya! 🔥 Feels like ${feelsLike}°C. Paani peete raho, warna tan jaoge.`;
      if (isCold) return `${city} mein sirf ${temp}°C hai bhai! 🥶 Feels like ${feelsLike}°C. Kambal odho, raza daal lo — perfect sone ka mausam!`;
      return `${city} mein abhi ${temp}°C chal raha hai (feels like ${feelsLike}°C). Humidity ${humidity}% — ${humidity > 70 ? 'thoda chipchipa sa lagega!' : 'kaafi comfortable hai.'} 😊`;
    } else {
      if (isHot) return `${city} is ${temp}°C right now — HOT! 🔥 Feels like ${feelsLike}°C. Drink lots of water and avoid peak afternoon sun.`;
      if (isCold) return `${city} is only ${temp}°C! 🥶 Feels like ${feelsLike}°C. Perfect weather to stay in with a blanket and hot cocoa.`;
      return `${city} is ${temp}°C (feels like ${feelsLike}°C). Humidity is ${humidity}%. ${humidity > 70 ? 'Bit humid though! 😅' : 'Pretty comfortable! 😊'}`;
    }
  }

  // Rain
  if (msg.includes('baarish') || msg.includes('rain') || msg.includes('barish') || msg.includes('umbrella') || msg.includes('chhata') || msg.includes('bheeg')) {
    if (lang === 'hi') {
      return isRain
        ? `Haan haan, ${city} mein baarish chal rahi hai! 🌧️ Chhata leke chalo, warna bheeg ke soup ban jaoge.`
        : `Nahi, ${city} mein abhi baarish nahi hai. ${isClear ? '☀️ Bilkul saaf mausam hai aaj.' : `Aaj ${desc} hai.`} Chhata ghar pe hi chhod do! 😄`;
    } else {
      return isRain
        ? `Yes! It's raining in ${city} right now! 🌧️ Grab that umbrella before stepping out.`
        : `No rain in ${city} right now. ${isClear ? '☀️ It\'s actually clear outside!' : `Currently ${desc}.`} Umbrella can stay home today! 😄`;
    }
  }

  // AQI / Air quality
  if (msg.includes('aqi') || msg.includes('air') || msg.includes('pollution') || msg.includes('hawa') || msg.includes('pradushan') || msg.includes('pm') || msg.includes('breathe') || msg.includes('sans')) {
    if (lang === 'hi') {
      return `${city} ka AQI abhi ${aqiIndex}/5 — ${aqiLabels[aqiIndex]}. PM2.5: ${pm25} µg/m³. ${isBadAQI ? '😷 Bhai mask pehno, hawa kharab hai! Zyada time bahar mat raho.' : isModAQI ? '😐 Thoda dhyan rakho, mask helpful rahega.' : '🌬️ Hawa kaafi sahi hai aaj! Khul ke saans lo.'}`;
    } else {
      return `AQI in ${city}: ${aqiIndex}/5 — ${aqiLabels[aqiIndex]}. PM2.5: ${pm25} µg/m³. ${isBadAQI ? '😷 Air quality is bad — wear a mask outside!' : isModAQI ? '😐 Moderate air — a mask is helpful.' : '🌬️ Air quality is good — breathe easy!'}`;
    }
  }

  // What to wear
  if (msg.includes('pehnu') || msg.includes('kapde') || msg.includes('wear') || msg.includes('clothes') || msg.includes('outfit') || msg.includes('dress')) {
    if (lang === 'hi') {
      if (isHot) return `${city} mein ${temp}°C! 🥵 Halka cotton pehno, sunscreen lagao, aur paani ki badi bottle saath rakho. AC wali jagah dhundho ASAP. 😂`;
      if (isCold) return `${city} mein ${temp}°C — sweater + jacket + muffler + gloves! 🧥 Ek baar thanda laga toh kuch kaam nahi karta. Layering ka rule follow karo!`;
      if (isRain) return `Baarish hai toh waterproof jacket ya raincoat pehno, aur chhata saath lo! ☔ Gile joote bahut bura experience hai, waterproof footwear bhi try karo.`;
      if (isWarm) return `${temp}°C hai — casual comfortable kapde theek rahenge. Light t-shirt ya shirt. Sunglasses bhi rakh lo! 😎`;
      return `${temp}°C aur ${desc} — na zyada garm na zyada thanda. Light jacket ya sweater safe rahega. 👕`;
    } else {
      if (isHot) return `${city} is ${temp}°C! 🥵 Light cotton clothes, sunscreen, hat, and a big water bottle. Find AC wherever possible! 😂`;
      if (isCold) return `${city} is ${temp}°C — layer up! Sweater + jacket + scarf combo. 🧥 Cold wind with ${wind} m/s makes it worse.`;
      if (isRain) return `Rain = waterproof jacket + umbrella! ☔ Waterproof shoes if you have them — wet socks ruin everything.`;
      return `${temp}°C with ${desc} — comfortable casual clothes work fine. Maybe bring a light layer just in case. 👕`;
    }
  }

  // Wind
  if (msg.includes('wind') || msg.includes('hawa') || msg.includes('tez') || msg.includes('breeze')) {
    if (lang === 'hi') {
      return wind > 10
        ? `${city} mein hawa kaafi tez chal rahi hai — ${wind} m/s! 💨 Chhat pe kapde mat daalana, aur chhata sambhal ke rakhna!`
        : `${city} mein hawa ${wind} m/s chal rahi hai — normal speed. 🌬️ Koi tension nahi.`;
    } else {
      return wind > 10
        ? `Wind in ${city} is quite strong at ${wind} m/s! 💨 Hold onto your hat and be careful with an umbrella.`
        : `Wind is at ${wind} m/s in ${city} — pretty calm. 🌬️ No issues.`;
    }
  }

  // Humidity
  if (msg.includes('humid') || msg.includes('chipchipa') || msg.includes('namI') || msg.includes('nami')) {
    if (lang === 'hi') {
      return humidity > 80
        ? `${city} mein humidity ${humidity}% hai! 😓 Chipchipapan max level pe hai. Light breathable kapde pehno aur paani zyada piyo.`
        : humidity > 60
        ? `${city} mein humidity ${humidity}% — thoda sa chipchipahat hai. Manageable hai. 😊`
        : `${city} mein humidity sirf ${humidity}% hai — kaafi dry aur comfortable! 😄`;
    } else {
      return humidity > 80
        ? `Humidity in ${city} is ${humidity}%! 😓 Feeling very muggy. Light breathable clothes and stay hydrated.`
        : humidity > 60
        ? `Humidity is ${humidity}% in ${city} — a bit sticky but manageable.`
        : `Humidity is just ${humidity}% in ${city} — nice and comfortable! 😄`;
    }
  }

  // Summary / how is weather
  if (msg.includes('kaisa') || msg.includes('how is') || msg.includes('summary') || msg.includes('overall') || msg.includes('mausam') || msg.includes('weather')) {
    if (lang === 'hi') {
      return `${city}, ${country} ka aaj ka mausam:\n🌡️ ${temp}°C (feels ${feelsLike}°C)\n🌤️ ${desc}\n💧 Humidity: ${humidity}%\n💨 Wind: ${wind} m/s\n🌫️ AQI: ${aqiIndex}/5 (${aqiLabels[aqiIndex]})\n\n${isClear && !isBadAQI ? '✅ Aaj bahar jaane ke liye perfect din hai!' : isRain || isThunder ? '⚠️ Aaj ghar pe rehna better hai.' : '👍 Theek theek mausam hai aaj.'}`;
    } else {
      return `Weather summary for ${city}, ${country}:\n🌡️ ${temp}°C (feels like ${feelsLike}°C)\n🌤️ ${desc}\n💧 Humidity: ${humidity}%\n💨 Wind: ${wind} m/s\n🌫️ AQI: ${aqiIndex}/5 (${aqiLabels[aqiIndex]})\n\n${isClear && !isBadAQI ? '✅ Great day to go outside!' : isRain || isThunder ? '⚠️ Better to stay indoors today.' : '👍 Decent weather today.'}`;
    }
  }

  // Forecast tomorrow
  if (msg.includes('kal') || msg.includes('tomorrow') || msg.includes('next') || msg.includes('forecast') || msg.includes('agle')) {
    if (lang === 'hi') {
      return `Kal ka haal toh main nahi jaanta exactly, par upar wale 7-day forecast section mein dekho! 📅 Wahan poora hafta ka data dikh raha hai. Main sirf aaj ke bare mein bata sakta hoon. 😄`;
    } else {
      return `For tomorrow's forecast, check the 7-day forecast section above! 📅 I can only chat about today's current conditions. 😄`;
    }
  }

  // Thank you
  if (msg.includes('thanks') || msg.includes('thank') || msg.includes('shukriya') || msg.includes('dhanyawad') || msg.includes('thx') || msg.includes('ty')) {
    return lang === 'hi'
      ? `Koi baat nahi yaar! 😊 Aur kuch poocha ho toh batao — main hamesha yahan hoon! ☀️`
      : `Anytime! 😊 Feel free to ask anything else about the weather! ☀️`;
  }

  // Default
  if (lang === 'hi') {
    return `Hmm, samjha nahi poori baat! 😄 Main ${city} ke mausam ke baare mein bata sakta hoon:\n• Bahar jaana chahiye?\n• Kya pehnu?\n• Baarish aayegi?\n• AQI kaisa hai?\n• Temperature kitna hai?\n\nKuch bhi poocho! 😊`;
  } else {
    return `Hmm, not sure what you meant! 😄 I can help with ${city}'s weather:\n• Should I go outside?\n• What to wear?\n• Will it rain?\n• How's the AQI?\n• What's the temperature?\n\nAsk away! 😊`;
  }
}

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: "Namaste! 🙏 Main hoon BadalMitra Bot!\n\nKuch bhi poocho — bahar jaana chahiye? Kya pehnu? Baarish aayegi? AQI kaisa hai? 😄\n\n(Hindi ya English — dono mein baat kar sakte ho!)"
    }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const { current, aqi } = useWeather();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const lang = detectLang(text);
    const reply = getReply(current, aqi, text, lang);
    setMessages(prev => [...prev, { role: 'user', text }, { role: 'bot', text: reply }]);
    setInput('');
  };

  const quickQuestions = [
    { label: 'Bahar jaun? 🚶', q: 'bahar jaana chahiye' },
    { label: 'Kya pehnu? 👕', q: 'kya pehnu aaj' },
    { label: 'Baarish? 🌧️', q: 'baarish aayegi' },
    { label: 'AQI kaisa? 🌫️', q: 'aqi kaisa hai' },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-400 text-white shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
        aria-label="Open weather chatbot"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 md:w-96 h-[520px] flex flex-col rounded-3xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="p-4 bg-blue-600/20 border-b border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">BadalMitra Bot</p>
              <p className="text-white/50 text-xs">Weather ke baare mein poocho! 🌤️</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center flex-shrink-0 mt-1 mr-2">
                    <Bot className="w-3 h-3 text-blue-300" />
                  </div>
                )}
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white/10 text-white/90 rounded-bl-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-2">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const lang = detectLang(q.q);
                    const reply = getReply(current, aqi, q.q, lang);
                    setMessages(prev => [...prev, { role: 'user', text: q.label }, { role: 'bot', text: reply }]);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 border border-white/10 transition-colors"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          <div className="p-3 border-t border-white/10 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Kuch bhi poocho... (Hindi/English)"
              className="flex-1 bg-white/10 text-white placeholder:text-white/40 rounded-xl px-3 py-2 text-sm outline-none border border-white/10 focus:border-blue-500/50 transition-colors"
            />
            <button
              onClick={send}
              disabled={!input.trim()}
              className="w-9 h-9 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-40 flex items-center justify-center text-white transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
