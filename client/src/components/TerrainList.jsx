import React from 'react'
import { useTerrains } from '../hooks/useTerrains'
import { useRegarColher } from '../hooks/useRegarColher'

export default function TerrainList({ selectedTerrainId, onSelect, filterPlayerId }) {
  const { data: terrains, isLoading, error } = useTerrains()
  const { regar, colher } = useRegarColher()
  if (isLoading) return <p>Loading terrains...</p>
  if (error) return <p>Error loading terrains</p>
  const filtered = filterPlayerId ? terrains.filter(t => t.player_id === filterPlayerId) : terrains
  return (
    <div className="terrain-list">
      {filtered.map(t => (
        <div
          key={t.id}
          className={`terrain-card${selectedTerrainId === t.id ? ' selected' : ''}`}
          onClick={() => onSelect && onSelect(t.id)}
          style={{ cursor: 'pointer', border: selectedTerrainId === t.id ? '2px solid #1976d2' : undefined }}
        >
          <h3>Terreno #{t.id}: {t.name || 'Sem nome'}</h3>
          <p><b>Jogador:</b> {t.player_id}</p>
          <p><b>Coordenadas:</b> {t.x_coordinate}, {t.y_coordinate}</p>
          <p><b>Acesso:</b> {t.access_type}</p>
          <p><b>Criado em:</b> {new Date(t.created_at).toLocaleString()}</p>
          <div className="terrain-actions">
            <button onClick={() => regar.mutate(t.id)} disabled={regar.isLoading}>
              {regar.isLoading ? 'Regando...' : 'Regar'}
            </button>
            <button onClick={() => colher.mutate(t.id)} disabled={colher.isLoading}>
              {colher.isLoading ? 'Colhendo...' : 'Colher'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
