import React, { FC, useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { useAgents } from './hooks/useAgents'

interface GameProps {
  terrainId?: number | null
}

class GridScene extends Phaser.Scene {
  agentCounts: any;
  constructor(agentCounts: any) {
    super('GridScene');
    this.agentCounts = agentCounts;
  }
  create() {
    const { width, height } = this.sys.game.config as any;
    const cols = 5, rows = 3;
    const cw = width / cols, ch = height / rows;
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff);
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * cw, y = j * ch;
        graphics.strokeRect(x, y, cw, ch);
        const id = j * cols + i + 1;
        this.add
          .text(x + cw / 2, y + 20, String(id), { fontSize: '18px', color: '#ffffff' })
          .setOrigin(0.5);
        // Render agents as circles
        const agentCount = this.agentCounts[(j * cols) + i];
        const agentRadius = 10;
        const margin = 8;
        for (let k = 0; k < agentCount; k++) {
          const row = Math.floor(k / 5);
          const col = k % 5;
          const ax = x + margin + agentRadius + col * (2 * agentRadius + margin);
          const ay = y + ch - 3 * (2 * agentRadius + margin) + row * (2 * agentRadius + margin) - margin;
          this.add.circle(ax, ay, agentRadius, 0x4caf50);
        }
        // numeric indicator for agent count
        this.add
          .text(x + cw - 4, y + ch - 4, String(agentCount), { fontSize: '14px', color: '#ffeb3b' })
          .setOrigin(1, 1);
      }
    }
  }
}

const Game: FC<GameProps> = ({ terrainId = null }) => {
  const ref = useRef<HTMLDivElement>(null)
  const { data: agentData } = useAgents(terrainId!)

  useEffect(() => {
    // agentCounts: array de 15 inteiros (um por quadrante)
    let agentCounts = Array(15).fill(0)
    if (agentData && Array.isArray(agentData)) {
      for (let i = 0; i < agentData.length; i++) {
        // agentData: [{quadrant: 1, agents: [...]}, ...]
        const q = agentData[i]
        if (q && typeof q.quadrant === 'number' && Array.isArray(q.agents)) {
          agentCounts[q.quadrant - 1] = q.agents.length
        }
      }
    } else {
      // fallback mock
      agentCounts = Array.from({ length: 15 }, () => Math.floor(Math.random() * 16))
    }
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: ref.current,
      backgroundColor: '#000000',
      scene: [new GridScene(agentCounts)],
      physics: { default: 'arcade' },
    }
    const game = new Phaser.Game(config)
    return () => {
      game.destroy(true)
    }
  }, [terrainId, agentData])

  return <div ref={ref} />
}

export default Game
