import React from 'react';
import { usePlayers, Player } from '../hooks/usePlayers';

export interface RankingBoardProps {
  selectedPlayerId?: number | null;
  onSelect?: (id: number | null) => void;
}

const RankingBoard: React.FC<RankingBoardProps> = ({
  selectedPlayerId = null,
  onSelect = () => {},
}) => {
  const { data: players, isLoading, error } = usePlayers();
  if (isLoading) return <div className="ranking-board">Carregando ranking...</div>;
  if (error) return <div className="ranking-board">Erro ao carregar ranking</div>;
  if (!players || players.length === 0) return <div className="ranking-board">Nenhum jogador encontrado</div>;

  const sorted = [...players].sort((a: Player, b: Player) => (b.points ?? 0) - (a.points ?? 0));

  return (
    <div className="ranking-board">
      <h2>Ranking de Jogadores</h2>
      <ol>
        {sorted.map((p: Player, i: number) => (
          <li
            key={p.id}
            style={{
              cursor: 'pointer',
              background: selectedPlayerId === p.id ? '#e3f2fd' : undefined,
              borderRadius: 4,
              padding: '2px 4px',
            }}
            onClick={() => onSelect(selectedPlayerId === p.id ? null : p.id)}
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
  );
};

export default RankingBoard;
