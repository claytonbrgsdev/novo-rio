"use client"

import AuthForm from "@/components/auth/auth-form"
import LeafIcon from "@/components/hand-drawn/leaf"
import SproutIcon from "@/components/hand-drawn/sprout"

export default function AuthPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-paper-200 to-paper-300 font-handwritten relative overflow-hidden">
      {/* SVG Filter for hand-drawn effect */}
      <svg width="0" height="0" className="absolute">
        <filter id="hand-drawn">
          <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
        </filter>
      </svg>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 opacity-70">
        <LeafIcon />
      </div>
      <div className="absolute bottom-10 right-10 opacity-70">
        <SproutIcon />
      </div>

      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="mb-8 text-center">
          <h1
            className="text-4xl md:text-5xl font-bold mb-2 text-olive-900"
            style={{ textShadow: "2px 2px 0 #e0e0c0" }}
          >
            NOVO RIO
          </h1>
          <p className="text-lg text-olive-800 mt-2">Refloreste uma área devastada pela plantação de soja</p>
        </div>

        <AuthForm />

        <div className="mt-8 text-olive-700 text-sm">© 2023 Novo Rio. Todos os direitos reservados.</div>
      </div>
    </div>
  )
}
