import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function SpeciesInfo() {
  const [species, setSpecies] = useState({});

  useEffect(() => {
    axios.get('/species')
         .then(res => setSpecies(res.data))
         .catch(err => console.error(err));
  }, []);

  return (
    <div className="species-grid">
      {Object.entries(species).map(([key, p]) => (
        <div key={key} className="species-card">
          <h4>{p.common_name}</h4>
          <p>Germinação: {p.germinacao_dias} dias</p>
          <p>Maturidade (scaled): {p.maturidade_dias_scaled || p.maturidade_dias} dias</p>
          <p>Água mínima: {p.agua_diaria_min} L/dia</p>
          <p>Espaço: {p.espaco_m2} m²</p>
          <p>Rendimento: {p.rendimento_unid}</p>
          <p>Tolerância à seca: {p.tolerancia_seca}</p>
        </div>
      ))}
    </div>
  );
}
