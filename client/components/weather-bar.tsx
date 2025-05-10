"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudFog,
  CloudLightning,
  CloudDrizzle,
  Wind,
  Droplets,
  Thermometer,
  ChevronDown,
  ChevronUp,
  Calendar,
  Sunrise,
  Sunset,
  MoonStar,
  Clock,
} from "lucide-react"

// Tipos para as condições climáticas
type WeatherCondition =
  | "sunny"
  | "partlyCloudy"
  | "cloudy"
  | "rainy"
  | "drizzle"
  | "thunderstorm"
  | "snowy"
  | "foggy"
  | "windy"

// Tipos para os períodos do dia
type DayPeriod = "dawn" | "morning" | "afternoon" | "evening" | "night"

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

// Interface para a previsão diária
interface DailyForecast {
  day: string
  condition: WeatherCondition
  maxTemp: number
  minTemp: number
  rainChance: number
  period?: DayPeriod // Opcional para previsões futuras
}

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
    description: "Ensolarado",
    icon: <Sun className="h-5 w-5" />,
    color: "text-amber-500",
    tooltip: "Clima ensolarado. Ideal para a maioria das culturas, mas monitore a necessidade de água.",
  },
  partlyCloudy: {
    description: "Parcialmente Nublado",
    icon: <Cloud className="h-5 w-5" />,
    color: "text-amber-600",
    tooltip: "Parcialmente nublado. Bom para culturas sensíveis ao sol direto.",
  },
  cloudy: {
    description: "Nublado",
    icon: <Cloud className="h-5 w-5" />,
    color: "text-gray-600",
    tooltip: "Céu nublado. Reduz a evaporação da água do solo.",
  },
  rainy: {
    description: "Chuvoso",
    icon: <CloudRain className="h-5 w-5" />,
    color: "text-blue-600",
    tooltip: "Chuva moderada. Evite atividades ao ar livre e verifique a drenagem do solo.",
  },
  drizzle: {
    description: "Garoa",
    icon: <CloudDrizzle className="h-5 w-5" />,
    color: "text-blue-400",
    tooltip: "Garoa leve. Bom para hidratação natural das plantas.",
  },
  thunderstorm: {
    description: "Tempestade",
    icon: <CloudLightning className="h-5 w-5" />,
    color: "text-purple-600",
    tooltip: "Tempestade com raios. Risco para culturas expostas, proteja equipamentos sensíveis.",
  },
  snowy: {
    description: "Nevando",
    icon: <CloudSnow className="h-5 w-5" />,
    color: "text-blue-200",
    tooltip: "Neve. Proteja culturas sensíveis ao frio e verifique o isolamento.",
  },
  foggy: {
    description: "Neblina",
    icon: <CloudFog className="h-5 w-5" />,
    color: "text-gray-400",
    tooltip: "Neblina. Aumenta a umidade do ar, mas reduz a visibilidade.",
  },
  windy: {
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
  // Estado para simular mudanças climáticas
  const [currentWeather, setCurrentWeather] = useState<WeatherCondition>("sunny")

  // Estado para o período do dia atual
  const [currentPeriod, setCurrentPeriod] = useState<DayPeriod>("morning")

  // Estado para controlar a exibição da previsão
  const [showForecast, setShowForecast] = useState(false)

  // Ref para o painel de previsão
  const forecastRef = useRef<HTMLDivElement>(null)

  // Fechar a previsão ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (forecastRef.current && !forecastRef.current.contains(event.target as Node)) {
        setShowForecast(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Simular a passagem do tempo (apenas para demonstração)
  useEffect(() => {
    // Obter a hora atual para definir o período inicial
    const getCurrentPeriod = (): DayPeriod => {
      const hour = new Date().getHours()
      if (hour >= 5 && hour < 7) return "dawn"
      if (hour >= 7 && hour < 12) return "morning"
      if (hour >= 12 && hour < 17) return "afternoon"
      if (hour >= 17 && hour < 19) return "evening"
      return "night"
    }

    setCurrentPeriod(getCurrentPeriod())

    // Simular a passagem do tempo a cada 10 segundos (apenas para demonstração)
    const timer = setInterval(() => {
      setCurrentPeriod((prev) => {
        const periods: DayPeriod[] = ["dawn", "morning", "afternoon", "evening", "night"]
        const currentIndex = periods.indexOf(prev)
        return periods[(currentIndex + 1) % periods.length]
      })
    }, 10000) // Mudar a cada 10 segundos para demonstração

    return () => clearInterval(timer)
  }, [])

  // Função para mudar o clima ao clicar (apenas para demonstração)
  const cycleWeather = () => {
    const conditions: WeatherCondition[] = [
      "sunny",
      "partlyCloudy",
      "cloudy",
      "rainy",
      "drizzle",
      "thunderstorm",
      "snowy",
      "foggy",
      "windy",
    ]
    const currentIndex = conditions.indexOf(currentWeather)
    const nextIndex = (currentIndex + 1) % conditions.length
    setCurrentWeather(conditions[nextIndex])
  }

  // Função para mudar o período do dia ao clicar (apenas para demonstração)
  const cyclePeriod = () => {
    const periods: DayPeriod[] = ["dawn", "morning", "afternoon", "evening", "night"]
    const currentIndex = periods.indexOf(currentPeriod)
    const nextIndex = (currentIndex + 1) % periods.length
    setCurrentPeriod(periods[nextIndex])
  }

  // Dados climáticos baseados na condição atual e período do dia
  const weather: WeatherData = {
    ...weatherConfig[currentWeather],
    // Ajustar temperatura com base no período do dia
    temperature:
      (currentWeather === "snowy"
        ? -2
        : currentWeather === "rainy" || currentWeather === "thunderstorm"
          ? 18
          : currentWeather === "cloudy" || currentWeather === "foggy"
            ? 22
            : 25) +
      (currentPeriod === "afternoon"
        ? 5
        : currentPeriod === "evening"
          ? 2
          : currentPeriod === "night"
            ? -3
            : currentPeriod === "dawn"
              ? -4
              : 0),
    // Ajustar umidade com base no período do dia
    humidity:
      (currentWeather === "rainy" || currentWeather === "drizzle" || currentWeather === "thunderstorm"
        ? 85
        : currentWeather === "foggy"
          ? 90
          : currentWeather === "snowy"
            ? 70
            : currentWeather === "cloudy" || currentWeather === "partlyCloudy"
              ? 60
              : 45) +
      (currentPeriod === "dawn" ? 15 : currentPeriod === "night" ? 10 : currentPeriod === "afternoon" ? -10 : 0),
    // Ajustar chance de chuva com base no período do dia
    rainChance:
      (currentWeather === "rainy"
        ? 90
        : currentWeather === "drizzle"
          ? 70
          : currentWeather === "thunderstorm"
            ? 95
            : currentWeather === "cloudy"
              ? 40
              : currentWeather === "partlyCloudy"
                ? 20
                : currentWeather === "foggy"
                  ? 30
                  : 10) + (currentPeriod === "afternoon" ? 10 : currentPeriod === "evening" ? 5 : 0),
    condition: currentWeather,
  }

  // Gerar previsão para os próximos dias (simulado)
  const generateForecast = (): DailyForecast[] => {
    const days = ["Hoje", "Amanhã", "Ter", "Qua", "Sex", "Sáb", "Dom"]
    const conditions: WeatherCondition[] = [
      "sunny",
      "partlyCloudy",
      "cloudy",
      "rainy",
      "drizzle",
      "thunderstorm",
      "snowy",
      "foggy",
      "windy",
    ]
    const periods: DayPeriod[] = ["morning", "afternoon", "evening"]

    // Usar a condição atual como base e variar a partir dela
    const currentIndex = conditions.indexOf(currentWeather)

    return days.map((day, index) => {
      // Gerar uma condição que tende a ser similar à atual, mas com variações
      const randomOffset = Math.floor(Math.random() * 3) - 1 // -1, 0, ou 1
      let conditionIndex = (currentIndex + randomOffset + conditions.length) % conditions.length

      // Para dias mais distantes, aumentar a aleatoriedade
      if (index > 2) {
        conditionIndex = Math.floor(Math.random() * conditions.length)
      }

      const condition = conditions[conditionIndex]

      // Gerar temperaturas baseadas na condição
      const baseTemp =
        condition === "snowy"
          ? 0
          : condition === "rainy" || condition === "thunderstorm"
            ? 18
            : condition === "cloudy" || condition === "foggy"
              ? 22
              : 25

      // Adicionar variação às temperaturas
      const variation = Math.floor(Math.random() * 6) - 2 // -2 a 3
      const maxTemp = baseTemp + variation
      const minTemp = maxTemp - (4 + Math.floor(Math.random() * 4)) // 4 a 7 graus menos

      // Chance de chuva baseada na condição
      const baseRainChance =
        condition === "rainy"
          ? 90
          : condition === "drizzle"
            ? 70
            : condition === "thunderstorm"
              ? 95
              : condition === "cloudy"
                ? 40
                : condition === "partlyCloudy"
                  ? 20
                  : condition === "foggy"
                    ? 30
                    : 10

      // Adicionar variação à chance de chuva
      const rainVariation = Math.floor(Math.random() * 20) - 10 // -10 a 9
      const rainChance = Math.max(0, Math.min(100, baseRainChance + rainVariation))

      // Adicionar período do dia para o dia atual
      const period = index === 0 ? currentPeriod : periods[Math.floor(Math.random() * periods.length)]

      return {
        day,
        condition,
        maxTemp,
        minTemp,
        rainChance,
        period: index === 0 ? period : undefined, // Apenas mostrar período para o dia atual
      }
    })
  }

  // Gerar previsão
  const forecast = generateForecast()

  // Classes de cor para o fundo com base na condição climática e período do dia
  const getBgColor = () => {
    // Base de cor do clima - usando cores sólidas em vez de gradientes
    let baseColor = ""
    switch (currentWeather) {
      case "sunny":
        baseColor = "bg-amber-300"
        break
      case "partlyCloudy":
        baseColor = "bg-amber-200"
        break
      case "cloudy":
        baseColor = "bg-gray-300"
        break
      case "rainy":
      case "drizzle":
        baseColor = "bg-blue-200"
        break
      case "thunderstorm":
        baseColor = "bg-purple-200"
        break
      case "snowy":
        baseColor = "bg-blue-100"
        break
      case "foggy":
        baseColor = "bg-gray-200"
        break
      case "windy":
        baseColor = "bg-teal-100"
        break
      default:
        baseColor = "bg-amber-300"
    }

    // Modificar com base no período do dia - usando cores sólidas ou gradientes sutis
    if (currentPeriod === "night") {
      return `bg-indigo-900 bg-opacity-90` // Cor sólida para noite
    } else if (currentPeriod === "dawn") {
      return `bg-purple-700 bg-opacity-80` // Cor sólida para amanhecer
    } else if (currentPeriod === "evening") {
      return `bg-orange-700 bg-opacity-80` // Cor sólida para entardecer
    } else if (currentPeriod === "afternoon") {
      return `${baseColor} bg-opacity-90` // Cor base com alta opacidade para tarde
    } else {
      // Manhã - gradiente muito sutil ou cor sólida
      return `${baseColor} bg-opacity-95`
    }
  }

  // Ajustar a cor do texto com base no período do dia
  const getTextColor = () => {
    return currentPeriod === "night" ? "text-gray-100" : "text-amber-900"
  }

  // Ajustar a cor da borda com base no período do dia
  const getBorderColor = () => {
    return currentPeriod === "night" ? "border-indigo-700" : "border-amber-400"
  }

  // Obter a hora atual formatada
  const getCurrentTime = () => {
    const now = new Date()
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="relative" ref={forecastRef}>
      <div
        className={`${getBgColor()} ${getTextColor()} p-1.5 flex items-center justify-between border-b ${getBorderColor()} transition-all duration-500 cursor-pointer`}
        onClick={() => setShowForecast(!showForecast)}
      >
        <div className="flex items-center gap-3">
          {/* Indicador de período do dia */}
          <div
            onClick={(e) => {
              e.stopPropagation()
              cyclePeriod()
            }}
          >
            <DayPeriodIndicator period={currentPeriod} />
          </div>

          {/* Separador */}
          <div className="h-5 w-px bg-current opacity-20"></div>

          {/* Indicador de clima */}
          <Tooltip content={weather.tooltip}>
            <div
              className="flex items-center gap-2 cursor-help"
              onClick={(e) => {
                e.stopPropagation()
                cycleWeather()
              }}
            >
              <span className={weather.color}>{weather.icon}</span>
              <span className="font-medium text-base">{weather.description}</span>
            </div>
          </Tooltip>

          <div className="flex items-center opacity-70 ml-1">
            {showForecast ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* Relógio */}
          <div className="flex items-center gap-1 mr-1">
            <Clock className="h-4 w-4 opacity-70" />
            <span className="font-medium text-base">{getCurrentTime()}</span>
          </div>

          <Tooltip
            content={`Temperatura atual: ${weather.temperature}°C. ${
              weather.temperature > 30
                ? "Muito quente, aumente a frequência de rega."
                : weather.temperature < 5
                  ? "Muito frio, proteja culturas sensíveis."
                  : weather.temperature < 15
                    ? "Temperatura amena, ideal para culturas de clima frio."
                    : "Temperatura ideal para a maioria das culturas."
            }`}
          >
            <div className="flex items-center gap-1 cursor-help">
              <Thermometer
                className={`h-4 w-4 ${
                  weather.temperature > 30
                    ? "text-red-600"
                    : weather.temperature < 5
                      ? "text-blue-600"
                      : currentPeriod === "night"
                        ? "text-gray-300"
                        : "text-gray-700"
                }`}
              />
              <span className="text-base">{weather.temperature}°C</span>
            </div>
          </Tooltip>

          <Tooltip
            content={`Umidade do ar: ${weather.humidity}%. ${
              weather.humidity > 80
                ? "Alta umidade pode favorecer fungos e doenças."
                : weather.humidity < 30
                  ? "Baixa umidade, aumente a frequência de rega."
                  : "Níveis adequados para a maioria das culturas."
            }`}
          >
            <div className="flex items-center gap-1 cursor-help">
              <Droplets
                className={`h-4 w-4 ${
                  weather.humidity > 80 ? "text-blue-600" : weather.humidity < 30 ? "text-amber-600" : "text-blue-400"
                }`}
              />
              <span className="text-base">Umidade: {weather.humidity}%</span>
            </div>
          </Tooltip>

          <Tooltip
            content={`Probabilidade de chuva: ${weather.rainChance}%. ${
              weather.rainChance > 70
                ? "Alta chance de chuva. Planeje atividades internas."
                : weather.rainChance > 30
                  ? "Possibilidade de chuva. Tenha um plano alternativo."
                  : "Baixa chance de chuva. Bom para atividades ao ar livre."
            }`}
          >
            <div
              className={`px-2 py-0.5 rounded-full text-sm font-medium cursor-help ${
                weather.rainChance > 70
                  ? currentPeriod === "night"
                    ? "bg-blue-900 text-blue-100"
                    : "bg-blue-200 text-blue-800"
                  : weather.rainChance > 30
                    ? currentPeriod === "night"
                      ? "bg-amber-900 text-amber-100"
                      : "bg-amber-200 text-amber-800"
                    : currentPeriod === "night"
                      ? "bg-amber-950 text-amber-200"
                      : "bg-amber-100 text-amber-800"
              }`}
            >
              Chance de chuva: {weather.rainChance}%
            </div>
          </Tooltip>
        </div>
      </div>

      {/* Painel de previsão do tempo */}
      {showForecast && (
        <div className="absolute left-0 right-0 z-10 bg-amber-50 bg-opacity-95 border border-amber-300 rounded-b-md shadow-lg overflow-hidden transition-all duration-300 ease-in-out animate-slideDown">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1 text-amber-800">
                <Calendar size={16} />
                <h3 className="font-medium text-sm">Previsão do Tempo</h3>
              </div>
              <div className="text-xs text-amber-700">Planeje suas atividades com antecedência</div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {forecast.map((day, index) => (
                <DayForecast key={index} forecast={day} />
              ))}
            </div>

            <div className="mt-2 text-xs text-amber-700 italic text-center">
              Dica: Diferentes períodos do dia afetam o crescimento e a saúde das plantas.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
