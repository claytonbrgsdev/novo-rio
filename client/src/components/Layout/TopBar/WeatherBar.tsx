import React from 'react';

interface WeatherBarProps {
  icon?: string | null;
  description: string;
}

const WeatherBar: React.FC<WeatherBarProps> = ({ icon, description }) => (
  <div className="weather-bar">
    {icon && <img src={icon} alt={description} />}
    <span>{description}</span>
  </div>
);

export default WeatherBar;
