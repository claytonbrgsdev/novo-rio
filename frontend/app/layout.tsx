import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { patrickHand, architectsDaughter, caveat } from "./fonts"
import Providers from "./providers"

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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
