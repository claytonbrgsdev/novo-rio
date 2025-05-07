# novo_rio

Projeto para estruturação inicial da base de dados e backend FastAPI para o jogo/projeto Novo Rio.

## Estrutura Inicial
- Backend em FastAPI
- ORM com SQLAlchemy
- Schemas com Pydantic
- Testes automatizados com pytest
- Estrutura pronta para futuras migrations e documentação

## Configuração

 Adicione no arquivo `.env` as variáveis:
 ```env
 PLAYER_ACTION_LIMIT=10
 TIME_SCALE_FACTOR=1
 ```

 - **PLAYER_ACTION_LIMIT**: número máximo de ações por ciclo de 6h antes de bloquear (HTTP 429). Default: 10.
 - **TIME_SCALE_FACTOR**: fator de aceleração do tempo. As durações de `germinacao_dias` e `maturidade_dias` são divididas por esse fator (quanto maior, mais rápido o crescimento). Ex: `TIME_SCALE_FACTOR=24` faz cada hora real equivaler a 1 dia de crescimento.
