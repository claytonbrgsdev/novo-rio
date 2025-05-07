import React, { FC } from 'react';
import { Sun, Thermometer, Droplets } from 'lucide-react';

interface WeatherBarProps {
  description: string
  temp?: number
  humidity?: number
  rainChance?: number
}

const WeatherBar: FC<WeatherBarProps> = ({ description, temp, humidity, rainChance }) => (
  <div className="bg-amber-300 text-amber-900 p-3 flex flex-row flex-nowrap items-center justify-between border-b border-amber-400 text-sm w-full gap-8 overflow-x-auto">
    <div className="flex-shrink-0 flex items-center gap-2">
      <Sun className="h-6 w-6 flex-shrink-0" />
      <span className="font-medium truncate">{description}</span>
    </div>
    <div className="flex-shrink-0 flex items-center gap-2">
      <Thermometer className="h-4 w-4 flex-shrink-0" />
      <span>{temp != null ? `${temp}°C` : '--'}</span>
    </div>
    <div className="flex-shrink-0 flex items-center gap-2">
      <Droplets className="h-4 w-4 flex-shrink-0" />
      <span>{humidity != null ? `Umidade: ${humidity}%` : '--'}</span>
    </div>
    <div className="flex-shrink-0 flex items-center">
      <span className="px-2 py-0.5 bg-amber-100 rounded-full text-xs">
        Chance de chuva: {rainChance != null ? `${rainChance}%` : '--'}
      </span>
    </div>
  </div>
);

export default WeatherBar;
