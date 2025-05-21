"use client"

interface WeatherBarProps {
  temperature?: number
  condition?: string
  humidity?: number
  time?: string
}

export default function SimplifiedWeatherBar({ 
  temperature = 25, 
  condition = "sunny", 
  humidity = 65, 
  time 
}: WeatherBarProps) {
  // Current time
  const date = new Date()
  const hours = time ? time.split(':')[0] : date.getHours().toString().padStart(2, '0')
  const minutes = time ? time.split(':')[1] : date.getMinutes().toString().padStart(2, '0')
  
  // Get weather icon
  const getWeatherIcon = (condition: string) => {
    switch(condition) {
      case "sunny": return "☀️";
      case "cloudy": return "☁️";
      case "rainy": return "🌧️";
      case "stormy": return "⛈️";
      default: return "☀️";
    }
  }
  
  // Get weather description
  const getWeatherDescription = (condition: string) => {
    switch(condition) {
      case "sunny": return "Ensolarado";
      case "cloudy": return "Nublado";
      case "rainy": return "Chuvoso";
      case "stormy": return "Tempestade";
      default: return "Ensolarado";
    }
  }
  
  // Get day period based on hour
  const getPeriod = () => {
    const hour = parseInt(hours)
    if (hour >= 5 && hour < 12) return "Manhã"
    if (hour >= 12 && hour < 18) return "Tarde"
    return "Noite"
  }
  
  return (
    <div className="bg-amber-100 py-1 px-2 flex justify-between items-center border-y border-amber-300 text-xs font-pixel">
      <div className="flex items-center space-x-6">
        <span className="text-amber-900">{getPeriod()} ({hours}:{minutes})</span>
        <div className="flex items-center space-x-2">
          <span className="text-xl">{getWeatherIcon(condition)}</span>
          <span className="uppercase text-amber-900">{getWeatherDescription(condition)}</span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <span className="text-amber-900">{temperature}°C</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-amber-900">Umidade: {humidity}%</span>
        </div>
      </div>
    </div>
  )
}
