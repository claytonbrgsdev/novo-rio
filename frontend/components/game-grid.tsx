"use client"

import type { ViewType } from "@/lib/types"
import GameGridWithApi from "./game-grid-with-api"

interface GameGridProps {
  viewType: ViewType
  activeQuadrant: string
  onQuadrantClick: (quadrant: string) => void
}

export default function GameGrid({ viewType, activeQuadrant, onQuadrantClick }: GameGridProps) {
  return <GameGridWithApi viewType={viewType} activeQuadrant={activeQuadrant} onQuadrantClick={onQuadrantClick} />
}
