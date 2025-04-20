import React from 'react';
import { Badge, useBadges } from '../hooks/useBadges';

export interface BadgeListProps {
  playerId?: number | null;
  onSelect?: (badge: Badge) => void;
}

const BadgeList: React.FC<BadgeListProps> = ({ playerId = null, onSelect = () => {} }) => {
  const { data: badges, isLoading, error } = useBadges(playerId);
  if (playerId == null) return <p>Selecione um jogador</p>;
  if (isLoading) return <p>Loading badges...</p>;
  if (error) return <p>Error loading badges</p>;
  if (!badges || badges.length === 0) return <p>No badges</p>;
  return (
    <ul className="badge-list">
      {badges.map((b: Badge) => (
        <li key={b.id} onClick={() => onSelect(b)} style={{ cursor: 'pointer' }}>
          <strong>{b.name}</strong>{b.description ? `: ${b.description}` : ''}
        </li>
      ))}
    </ul>
  );
};

export default BadgeList;
