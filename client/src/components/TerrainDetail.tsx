import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { useTerrainActions } from '../hooks/useTerrainActions';
import { useAgents } from '../hooks/useAgents';

export interface TerrainDetailProps { terrainId?: number | null; }

interface TerrainData {
  id: number;
  name?: string;
  player_id: number;
  x_coordinate: number;
  y_coordinate: number;
  access_type: string;
  updated_at: string;
}

const TerrainDetail: React.FC<TerrainDetailProps> = ({ terrainId }) => {
  if (!terrainId) return <p>Selecione um terreno</p>;

  const { data, isLoading, error } = useQuery<TerrainData>({
    queryKey: ['terrain', terrainId],
    queryFn: async () => {
      const res = await api.get<TerrainData>(`/async/terrains/${terrainId}`);
      return res.data;
    },
    enabled: !!terrainId,
  });

  const { plantar, regar, colher } = useTerrainActions();
  const agentsQuery = useAgents(terrainId);

  if (isLoading) return <p>Carregando terreno...</p>;
  if (error) return <p>Erro ao carregar terreno</p>;
  if (!data) return <p>Dados do terreno indisponíveis</p>;

  return (
    <div className="terrain-detail">
      <h2>Detalhes do Terreno #{data.id}</h2>
      <p><strong>Nome:</strong> {data.name || 'Sem nome'}</p>
      <p><strong>Jogador:</strong> {data.player_id}</p>
      <p><strong>Coord.:</strong> {data.x_coordinate}, {data.y_coordinate}</p>
      <p><strong>Acesso:</strong> {data.access_type}</p>
      <p><strong>Atualizado em:</strong> {new Date(data.updated_at).toLocaleString()}</p>
      <div className="terrain-actions">
        <button onClick={() => plantar.mutate(data.id)} disabled={plantar.isLoading}>
          {plantar.isLoading ? 'Plantando...' : 'Plantar'}
        </button>
        <button onClick={() => regar.mutate(data.id)} disabled={regar.isLoading}>
          {regar.isLoading ? 'Regando...' : 'Regar'}
        </button>
        <button onClick={() => colher.mutate(data.id)} disabled={colher.isLoading}>
          {colher.isLoading ? 'Colhendo...' : 'Colher'}
        </button>
      </div>
      {agentsQuery.isLoading ? (
        <p>Carregando agentes...</p>
      ) : agentsQuery.error ? (
        <p>Erro ao carregar agentes</p>
      ) : (
        <div className="agents-list">
          <h3>Agentes</h3>
          <ul>
            {agentsQuery.data?.map(({ quadrant, agents }) => (
              <li key={quadrant}>
                Quadrante {quadrant}: {agents.length} agentes
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TerrainDetail;
