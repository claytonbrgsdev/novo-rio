import React from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../api'

export default function TerrainDetail({ terrainId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['terrain', terrainId],
    queryFn: async () => {
      const res = await api.get(`/async/terrains/${terrainId}`)
      return res.data
    },
    enabled: !!terrainId,
  })

  if (!terrainId) return <p>Selecione um terreno</p>
  if (isLoading) return <p>Carregando terreno...</p>
  if (error) return <p>Erro ao carregar terreno</p>

  return (
    <div className="terrain-detail">
      <h2>Detalhes do Terreno #{data.id}</h2>
      <p><strong>Nome:</strong> {data.name || 'Sem nome'}</p>
      <p><strong>Jogador:</strong> {data.player_id}</p>
      <p><strong>Coord.:</strong> {data.x_coordinate}, {data.y_coordinate}</p>
      <p><strong>Acesso:</strong> {data.access_type}</p>
      <p><strong>Atualizado em:</strong> {new Date(data.updated_at).toLocaleString()}</p>
    </div>
  )
}
