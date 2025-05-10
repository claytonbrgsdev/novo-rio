"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Volume2, Monitor, Moon, Sun, Languages, VolumeX } from "lucide-react"
import { useAudio } from "@/components/audio/audio-context"

export default function Settings() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light")
  const [language, setLanguage] = useState("pt-BR")

  const { volume, setVolume, muted, setMuted } = useAudio()
  const [sfxVolume, setSfxVolume] = useState(80)

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-800 to-amber-900 text-amber-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/" className="bg-amber-700 hover:bg-amber-600 p-2 rounded-full mr-4 transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold">Configurações</h1>
        </div>

        <div className="bg-amber-800/50 rounded-lg p-6 mb-6 shadow-lg">
          <h2 className="text-xl font-medium mb-4 flex items-center">
            <Volume2 className="mr-2 h-5 w-5" />
            Áudio
          </h2>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-medium">Volume Principal</label>
                <span>{volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number.parseInt(e.target.value))}
                className="w-full h-2 bg-amber-900 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="font-medium">Música</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMuted(!muted)}
                    className="p-1 rounded bg-amber-700 text-amber-50"
                    aria-label={muted ? "Ativar" : "Silenciar"}
                  >
                    {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <span>{muted ? "Mudo" : `${volume}%`}</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number.parseInt(e.target.value))}
                disabled={muted}
                className={`w-full h-2 bg-amber-900 rounded-lg appearance-none cursor-pointer ${muted ? "opacity-50" : ""}`}
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="font-medium">Efeitos Sonoros</label>
                <span>{sfxVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sfxVolume}
                onChange={(e) => setSfxVolume(Number.parseInt(e.target.value))}
                className="w-full h-2 bg-amber-900 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="bg-amber-800/50 rounded-lg p-6 mb-6 shadow-lg">
          <h2 className="text-xl font-medium mb-4 flex items-center">
            <Monitor className="mr-2 h-5 w-5" />
            Aparência
          </h2>

          <div className="grid grid-cols-3 gap-4">
            <button
              className={`p-4 rounded-lg flex flex-col items-center ${theme === "light" ? "bg-amber-600" : "bg-amber-900/50 hover:bg-amber-900"}`}
              onClick={() => setTheme("light")}
            >
              <Sun className="h-8 w-8 mb-2" />
              <span>Claro</span>
            </button>

            <button
              className={`p-4 rounded-lg flex flex-col items-center ${theme === "dark" ? "bg-amber-600" : "bg-amber-900/50 hover:bg-amber-900"}`}
              onClick={() => setTheme("dark")}
            >
              <Moon className="h-8 w-8 mb-2" />
              <span>Escuro</span>
            </button>

            <button
              className={`p-4 rounded-lg flex flex-col items-center ${theme === "system" ? "bg-amber-600" : "bg-amber-900/50 hover:bg-amber-900"}`}
              onClick={() => setTheme("system")}
            >
              <Monitor className="h-8 w-8 mb-2" />
              <span>Sistema</span>
            </button>
          </div>
        </div>

        <div className="bg-amber-800/50 rounded-lg p-6 mb-6 shadow-lg">
          <h2 className="text-xl font-medium mb-4 flex items-center">
            <Languages className="mr-2 h-5 w-5" />
            Idioma
          </h2>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-3 bg-amber-900/70 rounded-lg text-amber-50 border border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="pt-BR">Português (Brasil)</option>
            <option value="en-US">English (US)</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
        </div>

        <div className="flex justify-between mt-8">
          <Link href="/">
            <button className="px-6 py-3 bg-amber-700 hover:bg-amber-600 rounded-lg transition-colors">Cancelar</button>
          </Link>

          <button
            className="px-6 py-3 bg-green-700 hover:bg-green-600 rounded-lg transition-colors"
            onClick={() => {
              // Save settings logic would go here
              alert("Configurações salvas com sucesso!")
            }}
          >
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  )
}
