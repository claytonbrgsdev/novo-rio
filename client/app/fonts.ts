import { Patrick_Hand, Architects_Daughter, Caveat } from "next/font/google"

export const patrickHand = Patrick_Hand({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-patrick-hand",
})

export const architectsDaughter = Architects_Daughter({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-architects-daughter",
})

export const caveat = Caveat({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-caveat",
})
