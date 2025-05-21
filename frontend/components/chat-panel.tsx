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
    <form onSubmit={handleSubmit} className="h-full flex flex-col font-handwritten">
      <div className="flex-grow p-3 flex flex-col" style={{ minHeight: 0 }}>
        <div className="flex-1 min-h-0">
          <textarea
            className="w-full h-full p-3 border-2 border-olive-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-olive-500 shadow-inner bg-paper-100"
            placeholder="DIGITE SUA MENSAGEM AQUI..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ minHeight: '80px' }}
          />
        </div>
      </div>

      {/* New control bar */}
      <div className="border-t border-olive-300 bg-paper-200 p-2">
        <div className="flex justify-between items-center">
          {/* Toggle buttons */}
          <div className="flex bg-paper-100 rounded-full p-0.5 border border-olive-200">
            <button
              type="button"
              className={`px-4 py-1.5 text-sm rounded-full transition-all ${mode === "chat" ? "bg-olive-600 text-white shadow-md" : "text-olive-700 hover:bg-paper-200"}`}
              onClick={() => onModeChange("chat")}
            >
              Chat
            </button>
            <button
              type="button"
              className={`px-4 py-1.5 text-sm rounded-full transition-all ${mode === "action" ? "bg-olive-600 text-white shadow-md" : "text-olive-700 hover:bg-paper-200"}`}
              onClick={() => onModeChange("action")}
            >
              Ação
            </button>
          </div>

          {/* Send button */}
          <button
            type="submit"
            className="px-5 py-1.5 bg-olive-600 text-white rounded-md hover:bg-olive-700 transition-colors text-sm font-medium shadow-sm flex items-center gap-1"
          >
            <span>Enviar</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </form>
  )
}
