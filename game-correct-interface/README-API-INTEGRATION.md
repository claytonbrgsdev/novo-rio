# Integração com a API FastAPI

Este documento descreve como a estrutura do frontend foi preparada para integração com o backend FastAPI.

## Estrutura de Pastas

\`\`\`
/src
  /services
    api.ts                 # Serviço genérico para chamadas à API
  /hooks
    usePlayer.ts           # Hook para gerenciar dados do jogador
    useTerrains.ts         # Hook para gerenciar terrenos
    useQuadrants.ts        # Hook para gerenciar quadrantes
    usePlantings.ts        # Hook para gerenciar plantações
    useTools.ts            # Hook para gerenciar ferramentas
    useInputs.ts           # Hook para gerenciar insumos
    useInventory.ts        # Hook para gerenciar inventário
    useWeather.ts          # Hook para gerenciar clima
  /types
    api.d.ts               # Definições de tipos para a API
  /context
    PlayerContext.tsx      # Contexto para gerenciar o jogador atual
  /lib
    react-query-client.ts  # Configuração do React Query
\`\`\`

## Configuração

1. Configure o arquivo `.env.local` com a URL da API:

\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:8000
\`\`\`

2. Certifique-se de que o React Query está configurado no `_app.tsx`:

\`\`\`tsx
import { QueryClientProvider } from 'react-query';
import { queryClient } from '@/lib/react-query-client';

function MyApp({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <PlayerProvider>
        <Component {...pageProps} />
      </PlayerProvider>
    </QueryClientProvider>
  );
}
\`\`\`

## Uso dos Hooks

### Exemplo: Carregando dados do jogador

\`\`\`tsx
import { usePlayer } from '@/hooks/usePlayer';

function PlayerProfile() {
  const { player, isLoading, error } = usePlayer();

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;

  return (
    <div>
      <h1>{player.name}</h1>
      <p>Nível: {player.level}</p>
      <p>Moedas: {player.coins}</p>
    </div>
  );
}
\`\`\`

### Exemplo: Gerenciando terrenos

\`\`\`tsx
import { useTerrains } from '@/hooks/useTerrains';

function TerrainsList() {
  const { terrains, isLoading, createTerrain } = useTerrains();

  const handleCreateTerrain = () => {
    createTerrain({
      name: "Novo Terreno",
      position: "A1"
    });
  };

  return (
    <div>
      <button onClick={handleCreateTerrain}>Criar Terreno</button>
      
      {isLoading ? (
        <div>Carregando...</div>
      ) : (
        <ul>
          {terrains.map(terrain => (
            <li key={terrain.id}>{terrain.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
\`\`\`

### Exemplo: Realizando ações em plantações

\`\`\`tsx
import { usePlantings } from '@/hooks/usePlantings';

function PlantingActions({ slotId }) {
  const { planting, performAction, isPerformingAction } = usePlantings(slotId);

  const handleWaterPlant = () => {
    performAction({
      action: 'water',
      planting_id: planting.id
    });
  };

  if (!planting) return <div>Nenhuma planta neste slot</div>;

  return (
    <div>
      <h3>{planting.plant?.name}</h3>
      <p>Estágio: {planting.growth_stage}</p>
      
      <button 
        onClick={handleWaterPlant}
        disabled={isPerformingAction || !planting.needs_water}
      >
        Regar Planta
      </button>
    </div>
  );
}
\`\`\`

## Contexto do Jogador

O `PlayerContext` fornece acesso ao jogador atual em toda a aplicação:

\`\`\`tsx
import { usePlayerContext } from '@/context/PlayerContext';

function PlayerInfo() {
  const { currentPlayer, setCurrentPlayerId } = usePlayerContext();

  const handleSwitchPlayer = (playerId) => {
    setCurrentPlayerId(playerId);
  };

  return (
    <div>
      {currentPlayer ? (
        <div>
          <h2>{currentPlayer.name}</h2>
          <p>Nível: {currentPlayer.level}</p>
        </div>
      ) : (
        <p>Nenhum jogador selecionado</p>
      )}
    </div>
  );
}
\`\`\`

## Serviço de API

O serviço de API fornece métodos para interagir com o backend:

\`\`\`tsx
import { apiService } from '@/services/api';

// Exemplo de uso direto (sem hooks)
async function fetchData() {
  try {
    const data = await apiService.get('/some-endpoint');
    console.log(data);
  } catch (error) {
    console.error('Erro:', error);
  }
}
\`\`\`

## Próximos Passos

1. Implemente os endpoints no backend FastAPI seguindo as definições de tipos em `api.d.ts`
2. Teste cada endpoint com os hooks correspondentes
3. Substitua os dados mockados nos componentes pelos dados reais da API
4. Implemente autenticação e autorização no frontend e backend

## Dicas para Integração

- Use o React Query DevTools para depurar as chamadas à API
- Mantenha os tipos sincronizados entre o frontend e o backend
- Implemente tratamento de erros consistente em toda a aplicação
- Use o contexto do jogador para gerenciar o estado global do jogador atual
