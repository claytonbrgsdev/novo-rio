"use client"

import type React from "react"
import { useState } from "react"

interface ChatPanelProps {
  mode: "chat" | "action"
  onModeChange: (mode: "chat" | "action") => void
}

export default function ChatPanel({ mode, onModeChange }: ChatPanelProps) {
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aqui você processaria a mensagem
    console.log(`Enviando ${mode}: ${message}`)
    setMessage("")
  }

  return (
    <div className="h-full p-3 flex flex-col font-handwritten">
      <div className="text-center font-bold mb-2 text-olive-800">CHAT / AÇÃO</div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
        <div className="flex-grow min-h-0">
          <textarea
            className="w-full h-full p-2 border-2 border-olive-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-olive-500 shadow-inner bg-paper-100"
            placeholder="DIGITE SUA MENSAGEM AQUI..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div className="flex justify-between mt-2">
          <div className="flex gap-2">
            <button
              type="button"
              className={`px-3 py-1 rounded-md text-sm hand-drawn-button ${mode === "chat" ? "bg-olive-600 text-white" : "bg-olive-200 text-olive-800"}`}
              onClick={() => onModeChange("chat")}
            >
              CHAT
            </button>
            <button
              type="button"
              className={`px-3 py-1 rounded-md text-sm hand-drawn-button ${mode === "action" ? "bg-olive-600 text-white" : "bg-olive-200 text-olive-800"}`}
              onClick={() => onModeChange("action")}
            >
              AÇÃO
            </button>
          </div>

          <button
            type="submit"
            className="px-4 py-1 bg-olive-600 text-white rounded-md hover:bg-olive-700 transition-colors text-sm font-medium hand-drawn-button"
          >
            ENVIAR
          </button>
        </div>
      </form>
    </div>
  )
}
