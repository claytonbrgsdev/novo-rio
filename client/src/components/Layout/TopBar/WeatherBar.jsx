import React from 'react';

const WeatherBar = ({ icon, description }) => (
  <div className="weather-bar">
    {icon && <img src={icon} alt={description} />}
    <span>{description}</span>
  </div>
);

export default WeatherBar;
