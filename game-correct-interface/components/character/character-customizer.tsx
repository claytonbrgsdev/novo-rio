"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Shuffle, RotateCcw, Save } from "lucide-react"
import { useAuth } from "@/components/auth/auth-context"
import { saveCharacterCustomization } from "@/lib/supabase"

// Define types for our character parts
type BodyType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type HeadType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20

// Tab options
type TabType = "corpo" | "cabeca"

export default function CharacterCustomizer() {
  const { user } = useAuth()

  // State for character parts
  const [selectedBody, setSelectedBody] = useState<BodyType>(1)
  const [selectedHead, setSelectedHead] = useState<HeadType>(1)
  const [activeTab, setActiveTab] = useState<TabType>("corpo")
  const [isLoading, setIsLoading] = useState(true)
  const [characterName, setCharacterName] = useState("")
  const [debugMessage, setDebugMessage] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // URLs for character parts
  const baseBodyUrl =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CAMADA%20BAIXO%20corpo%20base-djnTGaOg1R7MUtsu3b0YeIk5OQdps6.png" // Base body outline

  // Update the bodyUrls object to include all body images
  const bodyUrls: Record<BodyType, string> = {
    1: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1-zWUmCD5Yt6e8N77vKhjnFR13ZlNERI.png", // Tank top and pants
    2: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-cwiFZA9GFkH8KoE9UxDTJ3ysXszYdt.png", // Long dress with gear patterns
    3: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3-zWfPsqRoRFwWgS78uJ4JR8FZMhXFqp.png", // Jacket/cape with layered skirt
    4: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4-yT9EHyHMvjbZoxdZQ4gUJeVQCa77Cu.png", // T-shirt with character design
    5: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5-oBull4xPiKuHyWNwSswLIdYQxCnRp7.png", // T-shirt with belt and pants
    6: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6-NOhX9HzuY2vFykdenGFDf7jkaUusiz.png", // Dress/apron with pockets and boots
    7: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/7-LyZIFUvo3cbobMgp0tUrwkNhWTwdTV.png", // Overalls with t-shirt
    8: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8-LNYIhw8aryKSHAXyO92mI7LcjXczcN.png", // Kimono/robe with sandals
    9: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9-RAruqY3kisDbMq2JqbIXvSEWIk41KI.png", // Polka-dotted dress/apron with hooks
    10: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/10-9Ike6BksKIEd6RbIfEl0W9Y8B0swYd.png", // Simple tank top and pants
    11: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/11-FuIatJdLHJxtwqedwCjt7QnRV0Nct9.png", // V-neck top and baggy pants
    12: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/12-2oskR3LSGgZyOMQJgKSDrZPdceym1a.png", // Dress/outfit with wavy edges and sneakers
  } as Record<BodyType, string>

  // Update the headUrls object to include all head images
  const headUrls: Record<HeadType, string> = {
    1: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1-Nst4Chh0bm24lm8q3BHi14zq341nq8.png", // Duck/bird head with tuft of hair
    2: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-SdqMViHD8gcbb8SaUOUlK5qp9aj9rH.png", // Frog-like face with big eyes and mustache
    3: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3-KcGfYwuQETZAPuPZ84tfiU0wpWomUs.png", // Character with hat and flower petals
    4: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4-L9yDNjAhG2htnxpBHrR6u3rIQmJWcU.png", // Heart-shaped head with antennae
    5: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5-FDKqfW5LB8WudW1l7pnENE86v2HoOO.png", // Watermelon slice with seeds
    6: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6-fS8AfLs0HgiBSLV404k2qvElLZ1iSh.png", // Cup/mug head with straw and sad face
    7: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/7-Yx9Yd9Yd9Yd9Yd9Yd9Yd9Yd9Yd9Yd.png", // Face with straight hair covering the sides
    8: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8-aNji6uaFNLU867bheh8VWafvUiwDaf.png", // Face with curly/puffy hair
    9: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9-Yx9Yd9Yd9Yd9Yd9Yd9Yd9Yd9Yd9Yd.png", // Face with long black hair and minimal features
    10: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/10-ZGRzSSMENBKctifwi9hF744nL6p0B4.png", // Face with hair covering one eye
    11: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/11-gzYVO0DwhDfp4Jg3DbY0cCsk5It57b.png", // Simple face with hair
    12: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/12-PIa32CrJzNe3eCtXfko5465Yl5M8BC.png", // Cloud-like head with X marks on cheeks
    13: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/13-Yx9Yd9Yd9Yd9Yd9Yd9Yd9Yd9Yd9Yd.png", // Bat-like face with big eyes and ears/wings
    14: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/14-XjjIJnqkpv2Zz29Z5eY35t39q9w976.png", // UFO/alien ship-like head with eyes
    15: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/15-XFufjFLgi1yW3y3FYI8NbtN3qfY6Pw.png", // Wide/flat head with small structure on top
    16: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/16-eGg5pmkusBz4AU3gIQFikkSSZdhY5u.png", // Sunflower head with petals
    17: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/17-Yx9Yd9Yd9Yd9Yd9Yd9Yd9Yd9Yd9Yd.png", // Face with big round glasses and curly/fluffy hair on top
    18: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/18-BdHZJ1vl63PKQAKpUfj2ZfsdYlNRaz.png", // Round head with big ears and single eye
    19: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/19-EqdnsI76usDNCrQZS0qtvqWiyanDoF.png", // Character with spiky hair and sunglasses
    20: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/20-ZllP9flowjqt76iQnRH5v2JUaj9z4b.png", // Monster-like head with big teeth and ears/horns
  } as Record<HeadType, string>

  // Update URLs for the final head images
  headUrls[7] = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/7-su69fdTtLTOWBPeWWv3tBtpt6Fdeym.png" // Face with straight hair covering the sides
  headUrls[9] = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9-74ihsbz6gLVfra0qsZhJRwJmAc8esO.png" // Face with long black hair and minimal features
  headUrls[13] = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/13-xaVflV8ZUZ4NDJGzku0we13srBot9r.png" // Bat-like face with big eyes and ears/wings
  headUrls[17] = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/17-3CfYM9njuBzecd9kUh8MEvCLm1eCwU.png" // Face with big round glasses and curly/fluffy hair on top

  // Function to get the appropriate size for each head
  const getHeadSize = (headType: HeadType): string => {
    // Heads that need to be decreased in size: 6, 9, 10, 11, 19
    if ([6, 9, 10, 11, 19].includes(headType)) {
      return "22%" // Smaller size
    }
    // Heads that need to be increased in size: 3, 13, 14, 15, 16, 18
    else if ([3, 13, 14, 15, 16, 18].includes(headType)) {
      return "32%" // Larger size
    }
    // Default size for other heads
    return "27%"
  }

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Navigation handlers
  const handlePrevBody = () => {
    setSelectedBody((prev) => (prev === 1 ? 12 : ((prev - 1) as BodyType)))
  }

  const handleNextBody = () => {
    setSelectedBody((prev) => (prev === 12 ? 1 : ((prev + 1) as BodyType)))
  }

  const handlePrevHead = () => {
    setSelectedHead((prev) => (prev === 1 ? 20 : ((prev - 1) as HeadType)))
  }

  const handleNextHead = () => {
    setSelectedHead((prev) => (prev === 20 ? 1 : ((prev + 1) as HeadType)))
  }

  // Randomize character
  const handleRandomize = () => {
    const randomBody = (Math.floor(Math.random() * 12) + 1) as BodyType
    const randomHead = (Math.floor(Math.random() * 20) + 1) as HeadType

    setSelectedBody(randomBody)
    setSelectedHead(randomHead)
  }

  // Reset to defaults
  const handleReset = () => {
    setSelectedBody(1)
    setSelectedHead(1)
    setCharacterName("")
  }

  // Salvar personagem no localStorage e Supabase, e redirecionar para o jogo
  const handleSaveCharacter = async () => {
    if (!characterName.trim()) {
      setDebugMessage("Por favor, digite um nome para o personagem.")
      return
    }

    setIsSaving(true)
    setDebugMessage("Salvando personagem...")

    try {
      // Criar objeto com os dados do personagem para localStorage
      const character = {
        name: characterName,
        body: selectedBody,
        head: selectedHead,
        createdAt: new Date().toISOString(),
      }

      // Salvar no localStorage
      localStorage.setItem("character", JSON.stringify(character))

      // Se o usuário estiver autenticado, salvar também no Supabase
      if (user) {
        const characterData = {
          user_id: user.id,
          name: characterName,
          head_id: selectedHead,
          body_id: selectedBody,
          tool_id: "shovel", // Default tool
        }

        const { error } = await saveCharacterCustomization(characterData)

        if (error) {
          throw new Error(`Erro ao salvar no Supabase: ${error.message}`)
        }
      }

      console.log("Personagem salvo com sucesso!")
      setDebugMessage("Personagem salvo com sucesso! Redirecionando...")

      // Redirecionar para o jogo após salvar
      setTimeout(() => {
        window.location.href = "/transition"
      }, 1000)
    } catch (error) {
      console.error("Erro ao salvar personagem:", error)
      setDebugMessage("Erro ao salvar personagem: " + String(error))
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 border-t-4 border-olive-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="bg-paper-100 rounded-lg shadow-lg p-6 border-2 border-olive-700">
      <h2 className="text-2xl font-bold text-olive-900 text-center mb-6">Personagem Customizador</h2>
      <p className="text-center text-olive-800 mb-8">Crie seu personagem personalizado</p>

      {/* Área de depuração */}
      {debugMessage && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-2 mb-4 rounded">{debugMessage}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Character Preview Panel */}
        <div className="bg-paper-200 rounded-lg p-6 shadow-md border-2 border-olive-300">
          <h3 className="text-xl font-semibold text-olive-900 mb-6 text-center">Seu Personagem</h3>

          <div className="flex justify-center mb-8">
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              {/* Base body layer (bottom) */}
              <img
                src={baseBodyUrl || "/placeholder.svg"}
                alt="Base do corpo"
                className="absolute inset-0 w-full h-full transform scale-150 object-contain"
              />

              {/* Body variation layer */}
              <img
                src={bodyUrls[selectedBody] || "/placeholder.svg"}
                alt={`Corpo ${selectedBody}`}
                className="absolute inset-0 w-full h-full transform scale-150 object-contain"
              />

              {/* Head layer */}
              <img
                src={headUrls[selectedHead] || "/placeholder.svg"}
                alt={`Cabeça ${selectedHead}`}
                className="absolute left-0 right-0 w-full object-contain z-10"
                style={{
                  width: getHeadSize(selectedHead),
                  margin: "auto",
                  top: "-5%",
                  transform: "translateY(-5%)",
                }}
              />
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={handleRandomize}
              className="flex items-center justify-center gap-2 bg-olive-200 hover:bg-olive-300 text-olive-800 py-2 px-4 rounded-md border border-olive-400 transition-colors cursor-pointer hand-drawn-button"
              disabled={isSaving}
              type="button"
            >
              <Shuffle className="w-4 h-4" />
              Aleatório
            </button>

            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 bg-olive-200 hover:bg-olive-300 text-olive-800 py-2 px-4 rounded-md border border-olive-400 transition-colors cursor-pointer hand-drawn-button"
              disabled={isSaving}
              type="button"
            >
              <RotateCcw className="w-4 h-4" />
              Reiniciar
            </button>

            {/* Botão de salvar com onClick */}
            <button
              onClick={handleSaveCharacter}
              className="flex items-center justify-center gap-2 bg-olive-600 hover:bg-olive-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50 cursor-pointer hand-drawn-button"
              disabled={isSaving}
              type="button"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin mr-1"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Customization Controls Panel */}
        <div className="bg-paper-200 rounded-lg p-6 shadow-md border-2 border-olive-300">
          <h3 className="text-xl font-semibold text-olive-900 mb-6 text-center">Personalização</h3>

          {/* Tab Navigation */}
          <div className="flex rounded-md overflow-hidden mb-6">
            <button
              onClick={() => setActiveTab("corpo")}
              className={`flex-1 py-2 px-4 text-center cursor-pointer ${
                activeTab === "corpo" ? "bg-olive-600 text-white" : "bg-olive-200 text-olive-800 hover:bg-olive-300"
              }`}
              disabled={isSaving}
              type="button"
            >
              Corpo
            </button>
            <button
              onClick={() => setActiveTab("cabeca")}
              className={`flex-1 py-2 px-4 text-center cursor-pointer ${
                activeTab === "cabeca" ? "bg-olive-600 text-white" : "bg-olive-200 text-olive-800 hover:bg-olive-300"
              }`}
              disabled={isSaving}
              type="button"
            >
              Cabeça
            </button>
          </div>

          {/* Body Selection Controls */}
          {activeTab === "corpo" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handlePrevBody}
                  className="bg-olive-200 hover:bg-olive-300 text-olive-800 p-2 rounded-full border border-olive-400 cursor-pointer hand-drawn-button"
                  disabled={isSaving}
                  type="button"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="text-center">
                  <div className="w-32 h-32 mx-auto relative">
                    <img
                      src={bodyUrls[selectedBody] || "/placeholder.svg"}
                      alt={`Corpo ${selectedBody}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-olive-800 font-medium mt-2">Corpo {selectedBody}</p>
                </div>

                <button
                  onClick={handleNextBody}
                  className="bg-olive-200 hover:bg-olive-300 text-olive-800 p-2 rounded-full border border-olive-400 cursor-pointer hand-drawn-button"
                  disabled={isSaving}
                  type="button"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Head Selection Controls */}
          {activeTab === "cabeca" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handlePrevHead}
                  className="bg-olive-200 hover:bg-olive-300 text-olive-800 p-2 rounded-full border border-olive-400 cursor-pointer hand-drawn-button"
                  disabled={isSaving}
                  type="button"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="text-center">
                  <div className="w-32 h-32 mx-auto relative">
                    <img
                      src={headUrls[selectedHead] || "/placeholder.svg"}
                      alt={`Cabeça ${selectedHead}`}
                      className="w-full h-full object-contain"
                      style={{
                        width: getHeadSize(selectedHead),
                        margin: "auto",
                      }}
                    />
                  </div>
                  <p className="text-olive-800 font-medium mt-2">Cabeça {selectedHead}</p>
                </div>

                <button
                  onClick={handleNextHead}
                  className="bg-olive-200 hover:bg-olive-300 text-olive-800 p-2 rounded-full border border-olive-400 cursor-pointer hand-drawn-button"
                  disabled={isSaving}
                  type="button"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Character Name Input */}
          <div className="mt-6">
            <label htmlFor="characterName" className="block text-olive-800 font-medium mb-2">
              Nome do Personagem
            </label>
            <input
              type="text"
              id="characterName"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              className="w-full p-2 border-2 border-olive-400 rounded-md bg-paper-100 focus:outline-none focus:ring-2 focus:ring-olive-600"
              placeholder="Digite o nome do seu personagem"
              disabled={isSaving}
              required
            />
            {!characterName.trim() && <p className="text-red-500 text-sm mt-1">O nome do personagem é obrigatório</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
