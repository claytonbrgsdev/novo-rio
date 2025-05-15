"use client"
import { useCharacter } from "@/hooks/useCharacter"

interface CharacterDisplayProps {
  size?: "small" | "medium" | "large"
  showName?: boolean
  showTool?: boolean
}

export default function CharacterDisplay({
  size = "medium",
  showName = false,
  showTool = true,
}: CharacterDisplayProps) {
  const { character, isLoading } = useCharacter()

  // Tamanhos baseados na prop size
  const dimensions = {
    small: { width: 120, height: 120 },
    medium: { width: 180, height: 180 },
    large: { width: 300, height: 300 },
  }

  // URLs para as imagens do personagem
  const baseBodyUrl = "/personagens/CAMADA BAIXO corpo base.png"

  // Mapeamento de IDs para URLs de corpos
  const bodyUrls: Record<number, string> = {
    1: "/personagens/CAMADA MEIO corpos/1.png",
    2: "/personagens/CAMADA MEIO corpos/2.png",
    3: "/personagens/CAMADA MEIO corpos/3.png",
    4: "/personagens/CAMADA MEIO corpos/4.png",
    5: "/personagens/CAMADA MEIO corpos/5.png",
    6: "/personagens/CAMADA MEIO corpos/6.png",
    7: "/personagens/CAMADA MEIO corpos/7.png",
    8: "/personagens/CAMADA MEIO corpos/8.png",
    9: "/personagens/CAMADA MEIO corpos/9.png",
    10: "/personagens/CAMADA MEIO corpos/10.png",
    11: "/personagens/CAMADA MEIO corpos/11.png",
    12: "/personagens/CAMADA MEIO corpos/12.png",
  }

  // Mapeamento de IDs para URLs de cabeças
  const headUrls: Record<number, string> = {
    1: "/personagens/CAMADA CIMA cabeças/1.png",
    2: "/personagens/CAMADA CIMA cabeças/2.png",
    3: "/personagens/CAMADA CIMA cabeças/3.png",
    4: "/personagens/CAMADA CIMA cabeças/4.png",
    5: "/personagens/CAMADA CIMA cabeças/5.png",
    6: "/personagens/CAMADA CIMA cabeças/6.png",
    7: "/personagens/CAMADA CIMA cabeças/7.png",
    8: "/personagens/CAMADA CIMA cabeças/8.png",
    9: "/personagens/CAMADA CIMA cabeças/9.png",
    10: "/personagens/CAMADA CIMA cabeças/10.png",
    11: "/personagens/CAMADA CIMA cabeças/11.png",
    12: "/personagens/CAMADA CIMA cabeças/12.png",
    13: "/personagens/CAMADA CIMA cabeças/13.png",
    14: "/personagens/CAMADA CIMA cabeças/14.png",
    15: "/personagens/CAMADA CIMA cabeças/15.png",
    16: "/personagens/CAMADA CIMA cabeças/16.png",
    17: "/personagens/CAMADA CIMA cabeças/17.png",
    18: "/personagens/CAMADA CIMA cabeças/18.png",
    19: "/personagens/CAMADA CIMA cabeças/19.png",
    20: "/personagens/CAMADA CIMA cabeças/20.png",
  }

  // Mapeamento de IDs para URLs de ferramentas
  const toolUrls: Record<string, string> = {
    shovel: "/personagens/CAMADA CIMA ferramentas/PA.png",
    sickle: "/personagens/CAMADA CIMA ferramentas/FOICE.png",
    machete: "/personagens/CAMADA CIMA ferramentas/FACAO.png",
    watering_can: "/personagens/CAMADA CIMA ferramentas/REGADOR.png",
  }

  // Função para obter o tamanho apropriado para cada cabeça
  const getHeadSize = (headId: number): string => {
    // Cabeças que precisam ser diminuídas: 6, 9, 10, 11, 19
    if ([6, 9, 10, 11, 19].includes(headId)) {
      return "22%" // Tamanho menor
    }
    // Cabeças que precisam ser aumentadas: 3, 13, 14, 15, 16, 18
    else if ([3, 13, 14, 15, 16, 18].includes(headId)) {
      return "32%" // Tamanho maior
    }
    // Tamanho padrão para outras cabeças
    return "27%"
  }

  if (isLoading) {
    return (
      <div
        className="bg-amber-50 rounded-full flex items-center justify-center"
        style={{
          width: dimensions[size].width,
          height: dimensions[size].height,
        }}
      >
        <div className="animate-pulse bg-amber-200 rounded-full w-3/4 h-3/4"></div>
      </div>
    )
  }

  if (!character) {
    return (
      <div
        className="bg-amber-50 rounded-full flex items-center justify-center"
        style={{
          width: dimensions[size].width,
          height: dimensions[size].height,
        }}
      >
        <span className="text-amber-800 text-xs">Sem personagem</span>
      </div>
    )
  }

  const bodyId = character.body_id || 1
  const headId = character.head_id || 1
  const toolId = character.tool_id || "shovel"

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative"
        style={{
          width: dimensions[size].width,
          height: dimensions[size].height,
        }}
      >
        {/* Base do personagem */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={baseBodyUrl || "/placeholder.svg"}
            alt="Base do personagem"
            className="w-full h-full object-contain transform scale-150"
          />
        </div>

        {/* Corpo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={bodyUrls[bodyId] || "/placeholder.svg"}
            alt={`Corpo ${bodyId}`}
            className="w-full h-full object-contain transform scale-150"
          />
        </div>

        {/* Cabeça */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={headUrls[headId] || "/placeholder.svg"}
            alt={`Cabeça ${headId}`}
            className="absolute object-contain z-10"
            style={{
              width: getHeadSize(headId),
              margin: "auto",
              top: "-5%",
              left: 0,
              right: 0,
              transform: "translateY(-5%)",
            }}
          />
        </div>

        {/* Ferramenta (se houver e se showTool for true) */}
        {showTool && toolUrls[toolId] && (
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={toolUrls[toolId] || "/placeholder.svg"}
              alt={`Ferramenta ${toolId}`}
              className="w-1/2 h-1/2 object-contain absolute"
              style={{
                bottom: "10%",
                right: "10%",
              }}
            />
          </div>
        )}
      </div>

      {/* Nome do personagem (se showName for true) */}
      {showName && character.name && (
        <div className="mt-2 text-center font-handwritten text-olive-800">{character.name}</div>
      )}
    </div>
  )
}
