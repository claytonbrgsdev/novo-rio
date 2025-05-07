import { Sun, Droplets, Thermometer } from "lucide-react"

export default function WeatherBar() {
  return (
    <div className="bg-amber-300 text-amber-900 p-3 flex items-center justify-between border-b border-amber-400">
      <div className="flex items-center gap-3">
        <Sun className="h-6 w-6" />
        <span className="font-medium">Ensolarado</span>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <Thermometer className="h-4 w-4" />
          <span>25°C</span>
        </div>
        <div className="flex items-center gap-1">
          <Droplets className="h-4 w-4" />
          <span>Umidade: 45%</span>
        </div>
        <div className="px-2 py-0.5 bg-amber-100 rounded-full text-xs">Chance de chuva: 10%</div>
      </div>
    </div>
  )
}
