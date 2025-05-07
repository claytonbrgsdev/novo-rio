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
    <div className="bg-amber-50 p-3 flex flex-col">
      <div className="text-center font-medium mb-2 text-amber-800">PLAYER 04</div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
        <div className="flex-grow">
          <textarea
            className="w-full h-full min-h-[80px] p-3 border border-amber-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="DIGITE SUA MENSAGEM AQUI..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div className="flex justify-between mt-2">
          <div className="flex gap-2">
            <button
              type="button"
              className={`px-3 py-1 rounded-md text-sm ${mode === "chat" ? "bg-amber-500 text-white" : "bg-amber-200 text-amber-800"}`}
              onClick={() => onModeChange("chat")}
            >
              CHAT
            </button>
            <button
              type="button"
              className={`px-3 py-1 rounded-md text-sm ${mode === "action" ? "bg-amber-500 text-white" : "bg-amber-200 text-amber-800"}`}
              onClick={() => onModeChange("action")}
            >
              AÇÃO
            </button>
          </div>

          <button
            type="submit"
            className="px-4 py-1 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors text-sm"
          >
            ENVIAR
          </button>
        </div>
      </form>
    </div>
  )
}
