import React from 'react';

export default function PlantGrid({ plantings = [], onPlant }) {
  // Normalize plantings prop
  const list = Array.isArray(plantings) ? plantings : [];

  // Agrupa plantings por quadrante
  const slotsByCell = list.reduce((acc, p) => {
    const key = `${p.position.y}-${p.position.x}`;
    acc[key] = acc[key] || [];
    acc[key].push(p);
    return acc;
  }, {});

  return (
    <div className="plant-grid">
      {[...Array(15)].map((_, idx) => {
        const y = Math.floor(idx / 5);
        const x = idx % 5;
        const key = `${y}-${x}`;
        const occupied = slotsByCell[key]?.length || 0;
        return (
          <div key={key}
               className={`cell ${occupied > 0 ? `state-${slotsByCell[key][0].current_state}` : 'empty'}`}>
            {occupied > 0
              ? <span>{occupied}/15</span>
              : <button onClick={() => onPlant({ x, y })}>+</button>
            }
            {occupied >= 15 && <span className="full">Lotado</span>}
          </div>
        );
      })}
    </div>
  );
}
