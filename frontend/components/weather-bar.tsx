"use client"

import { useState } from "react"
import type React from "react"

import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudFog,
  CloudLightning,
  CloudDrizzle,
  Wind,
  Sunrise,
  Sunset,
  MoonStar,
} from "lucide-react"
import { useWeather } from "@/hooks/useWeather"
import { WeatherCondition, DayPeriod, DailyForecast } from "@/types/weather"

// Interface para os dados climáticos
interface WeatherData {
  condition: WeatherCondition
  temperature: number
  humidity: number
  rainChance: number
  description: string
  icon: React.ReactNode
  color: string
  tooltip: string
}

// Interface para os dados do período do dia
interface DayPeriodData {
  name: string
  icon: React.ReactNode
  color: string
  bgColor: string
  tooltip: string
  timeRange: string
}

// DailyForecast is now imported from @/types/weather

// Componente de Tooltip
function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-amber-800 text-amber-50 text-xs rounded shadow-lg whitespace-nowrap z-10 max-w-[200px]">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-amber-800"></div>
        </div>
      )}
    </div>
  )
}

// Mapeamento de condições climáticas para ícones, cores e descrições
const weatherConfig: Record<WeatherCondition, Omit<WeatherData, "temperature" | "humidity" | "rainChance">> = {
  sunny: {
    condition: "sunny",
    description: "Ensolarado",
    icon: <Sun className="h-5 w-5" />,
    color: "text-amber-500",
    tooltip: "Clima ensolarado. Ideal para a maioria das culturas, mas monitore a necessidade de água.",
  },
  partlyCloudy: {
    condition: "partlyCloudy",
    description: "Parcialmente Nublado",
    icon: <Cloud className="h-5 w-5" />,
    color: "text-amber-600",
    tooltip: "Parcialmente nublado. Bom para culturas sensíveis ao sol direto.",
  },
  cloudy: {
    condition: "cloudy",
    description: "Nublado",
    icon: <Cloud className="h-5 w-5" />,
    color: "text-gray-600",
    tooltip: "Céu nublado. Reduz a evaporação da água do solo.",
  },
  rainy: {
    condition: "rainy",
    description: "Chuvoso",
    icon: <CloudRain className="h-5 w-5" />,
    color: "text-blue-600",
    tooltip: "Chuva moderada. Evite atividades ao ar livre e verifique a drenagem do solo.",
  },
  drizzle: {
    condition: "drizzle",
    description: "Garoa",
    icon: <CloudDrizzle className="h-5 w-5" />,
    color: "text-blue-400",
    tooltip: "Garoa leve. Bom para hidratação natural das plantas.",
  },
  thunderstorm: {
    condition: "thunderstorm",
    description: "Tempestade",
    icon: <CloudLightning className="h-5 w-5" />,
    color: "text-purple-600",
    tooltip: "Tempestade com raios. Risco para culturas expostas, proteja equipamentos sensíveis.",
  },
  snowy: {
    condition: "snowy",
    description: "Nevando",
    icon: <CloudSnow className="h-5 w-5" />,
    color: "text-blue-200",
    tooltip: "Neve. Proteja culturas sensíveis ao frio e verifique o isolamento.",
  },
  foggy: {
    condition: "foggy",
    description: "Neblina",
    icon: <CloudFog className="h-5 w-5" />,
    color: "text-gray-400",
    tooltip: "Neblina. Aumenta a umidade do ar, mas reduz a visibilidade.",
  },
  windy: {
    condition: "windy",
    description: "Ventania",
    icon: <Wind className="h-5 w-5" />,
    color: "text-teal-600",
    tooltip: "Ventos fortes. Verifique suportes para plantas altas e proteja mudas jovens.",
  },
}

// Mapeamento de períodos do dia para ícones, cores e descrições
const dayPeriodConfig: Record<DayPeriod, DayPeriodData> = {
  dawn: {
    name: "Amanhecer",
    icon: <Sunrise className="h-5 w-5" />,
    color: "text-orange-400",
    bgColor: "from-indigo-900 via-purple-500 to-orange-300",
    tooltip: "Amanhecer (5h-7h). Ideal para colher vegetais frescos e observar o orvalho nas plantas.",
    timeRange: "5h-7h",
  },
  morning: {
    name: "Manhã",
    icon: <Sun className="h-5 w-5" />,
    color: "text-yellow-500",
    bgColor: "from-blue-400 via-sky-300 to-yellow-200",
    tooltip: "Manhã (7h-12h). Melhor período para plantar e realizar atividades que exigem luz solar direta.",
    timeRange: "7h-12h",
  },
  afternoon: {
    name: "Tarde",
    icon: <Sun className="h-5 w-5" />,
    color: "text-amber-600",
    bgColor: "from-blue-300 via-amber-300 to-orange-400",
    tooltip: "Tarde (12h-17h). Período mais quente do dia, evite regar plantas para prevenir queimaduras.",
    timeRange: "12h-17h",
  },
  evening: {
    name: "Entardecer",
    icon: <Sunset className="h-5 w-5" />,
    color: "text-orange-500",
    bgColor: "from-blue-700 via-purple-600 to-orange-500",
    tooltip: "Entardecer (17h-19h). Bom momento para regar plantas e preparar-se para atividades noturnas.",
    timeRange: "17h-19h",
  },
  night: {
    name: "Noite",
    icon: <MoonStar className="h-5 w-5" />,
    color: "text-indigo-300",
    bgColor: "from-indigo-950 via-indigo-900 to-indigo-800",
    tooltip: "Noite (19h-5h). Algumas plantas florescem à noite. Momento para descansar e planejar o dia seguinte.",
    timeRange: "19h-5h",
  },
}

// Componente para exibir a previsão de um dia
function DayForecast({ forecast }: { forecast: DailyForecast }) {
  const weather = weatherConfig[forecast.condition]
  const period = forecast.period ? dayPeriodConfig[forecast.period] : null

  return (
    <div className="flex flex-col items-center p-2 bg-white bg-opacity-60 rounded-md shadow-sm">
      <div className="font-medium text-xs mb-1">{forecast.day}</div>
      <div className={`${weather.color} mb-1`}>{weather.icon}</div>
      <div className="text-xs">{weather.description}</div>
      <div className="flex items-center justify-between w-full mt-1">
        <span className="text-xs font-medium">{forecast.minTemp}°</span>
        <div className="h-1 flex-grow mx-1 bg-gray-200 rounded-full">
          <div
            className="h-1 bg-amber-500 rounded-full"
            style={{
              width: `${Math.min(100, Math.max(0, ((forecast.maxTemp - 10) / 30) * 100))}%`,
            }}
          ></div>
        </div>
        <span className="text-xs font-medium">{forecast.maxTemp}°</span>
      </div>
      <div className="text-xs mt-1 text-blue-600">
        {forecast.rainChance > 0 ? `${forecast.rainChance}% chuva` : "Sem chuva"}
      </div>
    </div>
  )
}

// Componente para o indicador de período do dia
function DayPeriodIndicator({ period }: { period: DayPeriod }) {
  const periodData = dayPeriodConfig[period]

  return (
    <Tooltip content={periodData.tooltip}>
      <div className="flex items-center gap-1 cursor-help">
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center ${periodData.color} bg-gradient-to-r ${periodData.bgColor}`}
        >
          {periodData.icon}
        </div>
        <span className="text-sm font-medium">{periodData.name}</span>
        <span className="text-sm opacity-70">({periodData.timeRange})</span>
      </div>
    </Tooltip>
  )
}

export default function WeatherBar() {
  const { weather, isLoading, isError } = useWeather()

  if (isLoading) {
    return (
      <div className="bg-olive-200 p-2 flex justify-between items-center border-b-2 border-olive-300 animate-pulse">
        <div className="h-6 w-32 bg-olive-300 rounded"></div>
        <div className="h-6 w-24 bg-olive-300 rounded"></div>
      </div>
    )
  }

  if (isError || !weather) {
    return (
      <div className="bg-olive-200 p-2 flex justify-between items-center border-b-2 border-olive-300">
        <div className="text-olive-800 font-medium">Clima indisponível</div>
        <div className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-olive-700" />
          <span className="text-olive-800">--°C</span>
        </div>
      </div>
    )
  }

  // Função para obter o ícone com base na condição climática
  const getWeatherIcon = () => {
    switch (weather.condition) {
      case "sunny":
        return <Sun className="h-5 w-5 text-amber-500" />
      case "partlyCloudy":
        return <Cloud className="h-5 w-5 text-gray-400" />
      case "cloudy":
        return <Cloud className="h-5 w-5 text-gray-500" />
      case "rainy":
        return <CloudRain className="h-5 w-5 text-blue-500" />
      case "drizzle":
        return <CloudRain className="h-5 w-5 text-blue-400" />
      case "thunderstorm":
        return <CloudLightning className="h-5 w-5 text-purple-500" />
      case "snowy":
        return <CloudSnow className="h-5 w-5 text-blue-200" />
      case "foggy":
        return <CloudFog className="h-5 w-5 text-gray-300" />
      case "windy":
        return <Wind className="h-5 w-5 text-teal-500" />
      default:
        return <Cloud className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <div className="bg-olive-200 p-2 flex justify-between items-center border-b-2 border-olive-300">
      <div className="text-olive-800 font-medium">
        {weather.description} - {weather.currentPeriod}
      </div>
      <div className="flex items-center gap-2">
        {getWeatherIcon()}
        <span className="text-olive-800">{weather.temperature}°C</span>
      </div>
    </div>
  )
}
