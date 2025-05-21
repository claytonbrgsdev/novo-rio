import type React from "react"
import type { Metadata } from "next"
import { AuthProvider } from "@/components/auth/auth-context"
import "./globals.css"
import { patrickHand, architectsDaughter, caveat } from "./fonts"
import { AudioProvider } from "@/components/audio/audio-context"
import MusicStartButton from "@/components/audio/music-start-button"
import AudioInitializer from "@/components/audio/audio-initializer"
import AudioPlayer from "@/components/audio/audio-player"

export const metadata: Metadata = {
  title: "Novo Rio - Jogo de Fazenda",
  description: "Cultive, Construa, Prospere no mundo de Novo Rio",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${patrickHand.variable} ${architectsDaughter.variable} ${caveat.variable}`}>
        <AudioProvider>
          <AuthProvider>
            <AudioInitializer />
            {children}
            <MusicStartButton />
            <AudioPlayer />
          </AuthProvider>
        </AudioProvider>
      </body>
    </html>
  )
}
