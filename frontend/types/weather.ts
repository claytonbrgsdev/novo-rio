// Types for weather conditions
export type WeatherCondition =
  | "sunny"
  | "partlyCloudy"
  | "cloudy"
  | "rainy"
  | "drizzle"
  | "thunderstorm"
  | "snowy"
  | "foggy"
  | "windy"

// Types for day periods
export type DayPeriod = "dawn" | "morning" | "afternoon" | "evening" | "night"

// Weather data interface
export interface Weather {
  condition: WeatherCondition
  temperature: number
  humidity: number
  rainChance: number
  description: string
  currentPeriod: DayPeriod
  forecast?: DailyForecast[]
}

// Interface for daily forecast
export interface DailyForecast {
  day: string
  condition: WeatherCondition
  maxTemp: number
  minTemp: number
  rainChance: number
  period?: DayPeriod
}
