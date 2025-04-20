import React, { useState } from 'react';
import RankingBoard from './RankingBoard';
import BadgeList from './BadgeList';

const BadgeView: React.FC = () => {
  const [playerId, setPlayerId] = useState<number | null>(null);
  return (
    <div className="badge-view">
      <h2>Badge Viewer</h2>
      <RankingBoard selectedPlayerId={playerId} onSelect={setPlayerId} />
      {playerId != null && <BadgeList playerId={playerId} />}
    </div>
  );
};

export default BadgeView;
