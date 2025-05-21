"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-context"
import { loadCharacterCustomizations } from "@/lib/supabase"

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
  const [characterData, setCharacterData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  // Tamanhos baseados na prop size - aumentados significativamente
  const dimensions = {
    small: { width: 120, height: 120 },
    medium: { width: 180, height: 180 },
    large: { width: 300, height: 300 },
  }

  // URLs para as imagens do personagem - exatamente as mesmas da configuração
  const baseBodyUrl =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CAMADA%20BAIXO%20corpo%20base-djnTGaOg1R7MUtsu3b0YeIk5OQdps6.png"

  // Mapeamento de IDs para URLs de corpos
  const bodyUrls: Record<number, string> = {
    1: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1-zWUmCD5Yt6e8N77vKhjnFR13ZlNERI.png",
    2: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-cwiFZA9GFkH8KoE9UxDTJ3ysXszYdt.png",
    3: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3-zWfPsqRoRFwWgS78uJ4JR8FZMhXFqp.png",
    4: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4-yT9EHyHMvjbZoxdZQ4gUJeVQCa77Cu.png",
    5: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5-oBull4xPiKuHyWNwSswLIdYQxCnRp7.png",
    6: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6-NOhX9HzuY2vFykdenGFDf7jkaUusiz.png",
    7: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/7-LyZIFUvo3cbobMgp0tUrwkNhWTwdTV.png",
    8: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8-LNYIhw8aryKSHAXyO92mI7LcjXczcN.png",
    9: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9-RAruqY3kisDbMq2JqbIXvSEWIk41KI.png",
    10: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/10-9Ike6BksKIEd6RbIfEl0W9Y8B0swYd.png",
    11: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/11-FuIatJdLHJxtwqedwCjt7QnRV0Nct9.png",
    12: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/12-2oskR3LSGgZyOMQJgKSDrZPdceym1a.png",
  }

  // Mapeamento de IDs para URLs de cabeças
  const headUrls: Record<number, string> = {
    1: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1-Nst4Chh0bm24lm8q3BHi14zq341nq8.png",
    2: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-SdqMViHD8gcbb8SaUOUlK5qp9aj9rH.png",
    3: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3-KcGfYwuQETZAPuPZ84tfiU0wpWomUs.png",
    4: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4-L9yDNjAhG2htnxpBHrR6u3rIQmJWcU.png",
    5: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5-FDKqfW5LB8WudW1l7pnENE86v2HoOO.png",
    6: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6-fS8AfLs0HgiBSLV404k2qvElLZ1iSh.png",
    7: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/7-su69fdTtLTOWBPeWWv3tBtpt6Fdeym.png",
    8: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8-aNji6uaFNLU867bheh8VWafvUiwDaf.png",
    9: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9-74ihsbz6gLVfra0qsZhJRwJmAc8esO.png",
    10: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/10-ZGRzSSMENBKctifwi9hF744nL6p0B4.png",
    11: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/11-gzYVO0DwhDfp4Jg3DbY0cCsk5It57b.png",
    12: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/12-PIa32CrJzNe3eCtXfko5465Yl5M8BC.png",
    13: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/13-xaVflV8ZUZ4NDJGzku0we13srBot9r.png",
    14: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/14-XjjIJnqkpv2Zz29Z5eY35t39q9w976.png",
    15: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/15-XFufjFLgi1yW3y3FYI8NbtN3qfY6Pw.png",
    16: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/16-eGg5pmkusBz4AU3gIQFikkSSZdhY5u.png",
    17: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/17-3CfYM9njuBzecd9kUh8MEvCLm1eCwU.png",
    18: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/18-BdHZJ1vl63PKQAKpUfj2ZfsdYlNRaz.png",
    19: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/19-EqdnsI76usDNCrQZS0qtvqWiyanDoF.png",
    20: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/20-ZllP9flowjqt76iQnRH5v2JUaj9z4b.png",
  }

  // Mapeamento de IDs para URLs de ferramentas
  const toolUrls: Record<string, string> = {
    shovel: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PA-Yx9Yd9Yd9Yd9Yd9Yd9Yd9Yd9Yd9Yd.png",
    sickle: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FOICE-Yx9Yd9Yd9Yd9Yd9Yd9Yd9Yd9Yd9Yd.png",
    machete: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FACAO-Yx9Yd9Yd9Yd9Yd9Yd9Yd9Yd9Yd9Yd.png",
    watering: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/REGADOR-Yx9Yd9Yd9Yd9Yd9Yd9Yd9Yd9Yd9Yd.png",
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

  useEffect(() => {
    async function loadCharacter() {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        // Carregar do Supabase
        const { data, error } = await loadCharacterCustomizations(user.id)

        if (error) throw error

        if (data && data.length > 0) {
          setCharacterData({
            name: data[0].name,
            bodyId: data[0].body_id,
            headId: data[0].head_id,
            toolId: data[0].tool_id,
          })
        } else {
          // Fallback para localStorage
          const savedChar = localStorage.getItem("character")
          if (savedChar) {
            const parsed = JSON.parse(savedChar)
            setCharacterData({
              name: parsed.name,
              bodyId: parsed.body || 1,
              headId: parsed.head || 1,
              toolId: parsed.tool || "shovel",
            })
          }
        }
      } catch (err) {
        console.error("Erro ao carregar personagem:", err)
        // Tentar fallback
        const savedChar = localStorage.getItem("character")
        if (savedChar) {
          try {
            const parsed = JSON.parse(savedChar)
            setCharacterData({
              name: parsed.name,
              bodyId: parsed.body || 1,
              headId: parsed.head || 1,
              toolId: parsed.tool || "shovel",
            })
          } catch (e) {
            console.error("Erro ao parsear personagem do localStorage:", e)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadCharacter()
  }, [user])

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

  if (!characterData) {
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

  const bodyId = characterData.bodyId || 1
  const headId = characterData.headId || 1
  const toolId = characterData.toolId || "shovel"

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
      {showName && characterData.name && (
        <div className="mt-2 text-center font-handwritten text-olive-800">{characterData.name}</div>
      )}
    </div>
  )
}
