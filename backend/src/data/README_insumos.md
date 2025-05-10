# Documentação: Sistema de Insumos Agrícolas

## Visão Geral

O sistema de insumos permite o registro e rastreamento de recursos agrícolas aplicados aos plantios, como água, fertilizantes e compostos orgânicos. Cada insumo aplicado afeta diferentes parâmetros do solo e da planta, permitindo uma gestão agrícola mais precisa e realista.

## Tipos de Insumos e Seus Efeitos

### Água
- **Efeito Primário**: Aumenta a umidade do solo (`soil_moisture`)
- **Efeito Secundário**: Reseta o contador `days_sem_rega` para 0
- **Cálculo do Efeito**: Cada unidade de água aumenta a umidade do solo em 0.8 unidades

### Fertilizante
- **Efeito Primário**: Aumenta a fertilidade do solo (`fertility`)
- **Cálculo do Efeito**: Base de 1 unidade + 0.5 por unidade de fertilizante

### Composto Orgânico
- **Efeito Primário**: Aumenta a matéria orgânica do solo (`organic_matter`)
- **Efeito Secundário**: Aumento leve na fertilidade (`fertility`)
- **Cálculo do Efeito Primário**: Base de 1 unidade + 0.7 por unidade de composto
- **Cálculo do Efeito Secundário**: 0.2 por unidade de composto na fertilidade

### Calcário
- **Efeito Primário**: Aumenta o pH do solo (`soil_ph`)
- **Cálculo do Efeito**: Base de 0.1 unidade + 0.05 por unidade de calcário

### Cobertura Vegetal
- **Efeito Primário**: Ajuda a reter umidade (`soil_moisture`)
- **Efeito Secundário**: Aumento leve na matéria orgânica (`organic_matter`)
- **Cálculo do Efeito Primário**: 0.3 por unidade de cobertura na umidade
- **Cálculo do Efeito Secundário**: 0.2 por unidade de cobertura na matéria orgânica

## Uso da API

### Criar um Novo Insumo

**Endpoint**: `POST /inputs/` (síncrono) ou `POST /async/inputs/` (assíncrono)

**Corpo da Requisição**:
```json
{
  "planting_id": 123,
  "type": "água",
  "quantity": 10.0
}
```

**Tipos válidos de insumos**:
- `água` - Água para irrigação
- `fertilizante` - Fertilizantes químicos/minerais
- `composto` - Composto orgânico ou adubo
- `calcário` - Corretivo de pH
- `cobertura vegetal` - Material para cobertura do solo

**Resposta**:
```json
{
  "id": 1,
  "planting_id": 123,
  "type": "água",
  "quantity": 10.0,
  "applied_at": "2025-05-10T16:30:22.123Z",
  "effects": [
    {
      "parameter": "soil_moisture",
      "before": 20.0,
      "after": 28.0,
      "change": 8.0
    }
  ],
  "terrain_id": 45,
  "quadrant_id": 12,
  "plant_effects": {
    "days_sem_rega": {
      "before": 5,
      "after": 0,
      "change": -5
    }
  }
}
```

### Listar Insumos de um Plantio

**Endpoint**: `GET /inputs/?planting_id=123`

### Obter Detalhes de um Insumo Específico

**Endpoint**: `GET /inputs/{input_id}`

## Integração com Outros Sistemas

O sistema de insumos está integrado com:

1. **Sistema de Parâmetros do Solo**: Os efeitos são aplicados diretamente nos parâmetros do solo do terreno e quadrante
2. **Sistema de Plantio**: A aplicação de água reseta o contador de dias sem rega
3. **Registro de Ações**: Todas as aplicações de insumos são registradas no sistema de ações do jogador

## Exemplos de Uso

### Exemplo 1: Irrigação Regular
Aplicar 10 unidades de água a cada ciclo para manter a umidade do solo em níveis adequados.

### Exemplo 2: Fertilização Estratégica
Aplicar fertilizante quando a fertilidade do solo cair abaixo de um determinado limiar.

### Exemplo 3: Melhoria do Solo
Combinar composto orgânico e cobertura vegetal para melhorar a estrutura, matéria orgânica e capacidade de retenção de umidade do solo.

## Limitações e Considerações Futuras

- Os efeitos dos insumos são imediatos; um sistema de efeitos graduais pode ser implementado no futuro
- Interações mais complexas entre diferentes insumos podem ser desenvolvidas
- Efeitos específicos para cada espécie de planta podem ser implementados
- Limites diários ou mensais de aplicação podem ser adicionados para maior realismo
