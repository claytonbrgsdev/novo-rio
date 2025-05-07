import React, { useState, useEffect } from 'react';

export default function ControlPanel({ actionsLeft, cycleResetTime, onAction }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    function updateTime() {
      const diff = new Date(cycleResetTime).getTime() - Date.now();
      setTimeLeft(diff > 0 ? diff : 0);
    }
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [cycleResetTime]);

  const formatTime = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="control-panel">
      <p>Ações restantes: {actionsLeft}</p>
      <p>Próximo reset em: {formatTime(timeLeft)}</p>
      <button onClick={() => onAction('plant')} disabled={actionsLeft===0}>Plantar</button>
      <button onClick={() => onAction('water')} disabled={actionsLeft===0}>Regar</button>
      <button onClick={() => onAction('harvest')} disabled={actionsLeft===0}>Colher</button>
    </div>
  );
}
