"use client"

import { useState, useEffect } from "react"
import { Cloud, CloudRain, Sun, Moon, ThermometerSun, Droplets, Clock } from "lucide-react"

interface WeatherBarProps {
  temperature?: number
  condition?: string
  humidity?: number
  time?: string
}

export default function WeatherBar({ 
  temperature = 25, 
  condition = "sunny", 
  humidity = 65, 
  time 
}: WeatherBarProps = {}) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isDay, setIsDay] = useState(true)
  
  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])
  
  // Check if it's day or night based on time
  useEffect(() => {
    const timeString = time || formattedTime
    const hourMatch = timeString.match(/(\d+):/);
    if (hourMatch) {
      const hour = parseInt(hourMatch[1]);
      setIsDay(hour >= 6 && hour < 18);
    }
  }, [time, currentTime])

  // Format time as HH:MM
  const formattedTime = time || currentTime.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  // Get weather icon based on condition with subtle animation effects  
  const getWeatherIcon = () => {
    switch (condition) {
      case 'sunny':
        return (
          <div className="relative">
            <Sun className={`w-5 h-5 ${isDay ? 'text-amber-500' : 'text-amber-300'}`} />
          </div>
        );
      case 'cloudy':
        return (
          <div className="relative">
            <Cloud className="w-5 h-5 text-gray-500" />
          </div>
        );
      case 'rainy':
        return (
          <div className="relative">
            <CloudRain className="w-5 h-5 text-blue-500" />
          </div>
        );
      default:
        return <Sun className="w-5 h-5 text-amber-500" />;
    }
  };

  // Get weather condition label based on current condition
  const getWeatherLabel = () => {
    if (condition === 'sunny') return isDay ? 'Ensolarado' : 'Céu limpo';
    if (condition === 'cloudy') return 'Nublado';
    if (condition === 'rainy') return 'Chuvoso';
    return 'Ensolarado';
  };

  // Determine what season it is based on current month
  const determineSeason = () => {
    const month = currentTime.getMonth() + 1; // 1-12
    // Southern hemisphere seasons
    if (month >= 3 && month <= 5) return "Outono"; // Autumn: March to May
    if (month >= 6 && month <= 8) return "Inverno"; // Winter: June to August
    if (month >= 9 && month <= 11) return "Primavera"; // Spring: September to November
    return "Verão"; // Summer: December to February
  };

  const season = determineSeason();

  return (
    <div className={`px-4 py-2 border-b border-olive-300 flex justify-between items-center text-sm font-handwritten text-olive-800 shadow-sm
      ${isDay ? 'bg-gradient-to-r from-paper-200 to-paper-300' : 'bg-gradient-to-r from-olive-800/10 to-olive-700/10'}`}>
      {/* Left: Time and Season */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-olive-600" />
          <span className="text-olive-800">{formattedTime}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-olive-800">{season}</span>
        </div>
      </div>

      {/* Right: Weather information */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <ThermometerSun className="w-4 h-4 text-amber-600" />
          <span className="text-olive-800">{temperature}°C</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Droplets className="w-4 h-4 text-blue-500" />
          <span className="text-olive-800">{humidity}%</span>
        </div>

        <div className="flex items-center gap-1.5 pl-2 border-l border-olive-300">
          {getWeatherIcon()}
          <span className="text-olive-800">{getWeatherLabel()}</span>
        </div>
      </div>
    </div>
  );
}
