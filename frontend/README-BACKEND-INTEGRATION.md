# Integração com Backend FastAPI

Este documento descreve como integrar o frontend Next.js com o backend FastAPI.

## Configuração

1. Certifique-se de que o backend FastAPI está rodando na porta 8000 (ou ajuste a URL no arquivo `.env.local`).
2. Configure as variáveis de ambiente no arquivo `.env.local`:
   \`\`\`
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   \`\`\`

## Estrutura da API

O frontend está configurado para se comunicar com o backend através dos seguintes endpoints:

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/refresh` - Renovar token de acesso

### Jogadores
- `GET /api/players` - Listar todos os jogadores
- `GET /api/players/{id}` - Obter jogador por ID
- `GET /api/players/user/{user_id}` - Obter jogadores de um usuário
- `POST /api/players` - Criar novo jogador
- `PATCH /api/players/{id}` - Atualizar jogador

### Personagens
- `GET /api/characters/user/{user_id}` - Obter personagens de um usuário
- `POST /api/characters` - Criar novo personagem
- `PATCH /api/characters/{id}` - Atualizar personagem

### Terrenos
- `GET /api/terrains` - Listar terrenos (filtrar por player_id)
- `GET /api/terrains/{id}` - Obter terreno por ID
- `POST /api/terrains` - Criar novo terreno
- `PATCH /api/terrains/{id}` - Atualizar terreno

### Quadrantes
- `GET /api/quadrants` - Listar quadrantes (filtrar por terrain_id)
- `GET /api/quadrants/{id}` - Obter quadrante por ID
- `POST /api/quadrants` - Criar novo quadrante
- `PATCH /api/quadrants/{id}` - Atualizar quadrante

### Slots
- `GET /api/slots` - Listar slots (filtrar por quadrant_id)
- `GET /api/slots/{id}` - Obter slot por ID
- `POST /api/slots` - Criar novo slot
- `PATCH /api/slots/{id}` - Atualizar slot

### Plantações
- `GET /api/plantings/slot/{slot_id}` - Obter plantação de um slot
- `POST /api/plantings` - Criar nova plantação
- `POST /api/plantings/action` - Realizar ação em uma plantação
- `GET /api/plantings/{id}` - Obter plantação por ID

### Inventário
- `GET /api/inventory` - Listar itens do inventário (filtrar por player_id e item_type)
- `POST /api/inventory/{id}/use` - Usar item do inventário
- `POST /api/inventory/{id}/sell` - Vender item do inventário

### Ferramentas
- `GET /api/tools` - Listar ferramentas (filtrar por player_id)
- `POST /api/tools/buy` - Comprar ferramenta
- `POST /api/tools/{id}/repair` - Reparar ferramenta

### Insumos
- `GET /api/inputs` - Listar insumos (filtrar por player_id)
- `POST /api/inputs/buy` - Comprar insumo
- `POST /api/inputs/{id}/use` - Usar insumo

### Clima
- `GET /api/weather` - Obter informações do clima atual

## Integração com o Backend

O frontend está preparado para se comunicar com o backend através do serviço `apiService` definido em `services/api.ts`. Este serviço fornece métodos para realizar requisições HTTP para o backend:

\`\`\`typescript
// Exemplo de uso do apiService
import { apiService } from '@/services/api';

// GET request
const data = await apiService.get('/players');

// POST request
const newPlayer = await apiService.post('/players', { name: 'Novo Jogador' });

// PATCH request
const updatedPlayer = await apiService.patch(`/players/${id}`, { name: 'Nome Atualizado' });

// DELETE request
await apiService.delete(`/players/${id}`);
\`\`\`

## Hooks React Query

O frontend utiliza React Query para gerenciar o estado e o cache das requisições à API. Os hooks estão definidos na pasta `hooks/` e fornecem uma interface para interagir com a API:

\`\`\`typescript
// Exemplo de uso dos hooks
import { usePlayer } from '@/hooks/usePlayer';
import { useTerrains } from '@/hooks/useTerrains';

function MyComponent() {
  const { player, isLoading } = usePlayer();
  const { terrains } = useTerrains();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h1>{player.name}</h1>
      <ul>
        {terrains.map(terrain => (
          <li key={terrain.id}>{terrain.name}</li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`

## Tipos

Os tipos utilizados no frontend estão definidos em `types/api.d.ts` e devem corresponder aos tipos retornados pela API.

## Autenticação

O frontend utiliza o Supabase para autenticação, mas também está preparado para utilizar tokens JWT para autenticar requisições à API. O token é armazenado no localStorage e é enviado no header `Authorization` de todas as requisições.

## Considerações Finais

Este frontend foi projetado para ser integrado com um backend FastAPI, mas pode ser adaptado para outros backends com pequenas modificações. Certifique-se de que os endpoints da API correspondem aos esperados pelo frontend, ou adapte o código conforme necessário.
\`\`\`

Agora o projeto está limpo e pronto para integração com o backend FastAPI. Todos os placeholders foram removidos e os componentes estão preparados para consumir dados reais da API.
