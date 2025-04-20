import React from 'react'
import { usePlayers } from '../hooks/usePlayers'

export default function RankingBoard({ selectedPlayerId, onSelect }) {
  const { data: players, isLoading, error } = usePlayers()
  if (isLoading) return <div className="ranking-board">Carregando ranking...</div>
  if (error) return <div className="ranking-board">Erro ao carregar ranking</div>
  if (!players?.length) return <div className="ranking-board">Nenhum jogador encontrado</div>
  // Ordena por pontos (ou badge_count se disponível)
  const sorted = [...players].sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
  return (
    <div className="ranking-board">
      <h2>Ranking de Jogadores</h2>
      <ol>
        {sorted.map((p, i) => (
          <li
            key={p.id}
            style={{
              cursor: 'pointer',
              background: selectedPlayerId === p.id ? '#e3f2fd' : undefined,
              borderRadius: 4,
              padding: '2px 4px'
            }}
            onClick={() => onSelect && onSelect(selectedPlayerId === p.id ? null : p.id)}
          >
            <b>{i + 1}º</b> {p.name || `Jogador ${p.id}`} — <b>{p.points ?? 0}</b> pontos
            {p.badges && Array.isArray(p.badges) && p.badges.length > 0 && (
              <span style={{ marginLeft: 8 }}>
                {Array.from({ length: p.badges.length }).map((_, idx) => (
                  <span key={idx} role="img" aria-label="badge">🏅</span>
                ))}
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
