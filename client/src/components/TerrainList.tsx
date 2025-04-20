import React from 'react';
import { useInfiniteTerrains, Terrain } from '../hooks/useInfiniteTerrains';
import { useTerrainActions } from '../hooks/useTerrainActions';

export interface TerrainListProps {
  selectedTerrainId?: number | null;
  onSelect?: (id: number) => void;
  filterPlayerId?: number | null;
}

const TerrainList: React.FC<TerrainListProps> = ({
  selectedTerrainId = null,
  onSelect = () => {},
  filterPlayerId = null,
}) => {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTerrains();

  const terrains: Terrain[] = data?.pages.flat() || [];
  const { regar, colher } = useTerrainActions();

  if (isLoading) return <p>Loading terrains...</p>;
  if (error) return <p>Error loading terrains</p>;

  const filtered = filterPlayerId != null
    ? terrains.filter(t => t.player_id === filterPlayerId)
    : terrains;

  return (
    <div className="terrain-list">
      {filtered.map(t => (
        <div
          key={t.id}
          className={`terrain-card${selectedTerrainId === t.id ? ' selected' : ''}`}
          onClick={() => onSelect(t.id)}
          style={{ cursor: 'pointer', border: selectedTerrainId === t.id ? '2px solid #1976d2' : undefined }}
        >
          <h3>Terreno #{t.id}</h3>
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
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
};

export default TerrainList;
