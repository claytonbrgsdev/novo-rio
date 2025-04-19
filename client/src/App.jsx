import { useState } from 'react'
import Game from './Game'
import TerrainList from './components/TerrainList'
import RankingBoard from './components/RankingBoard'
import TerrainDetail from './components/TerrainDetail'
import './App.css'

function App() {
  const [selectedTerrainId, setSelectedTerrainId] = useState(null)
  const [selectedPlayerId, setSelectedPlayerId] = useState(null)

  return (
    <>

      <RankingBoard selectedPlayerId={selectedPlayerId} onSelect={setSelectedPlayerId} />
      <div className="game-container">
        <Game terrainId={selectedTerrainId} />
      </div>
      <div className="terrain-detail-container">
        <TerrainDetail terrainId={selectedTerrainId} />
      </div>
      <div className="terrain-list-container">
        <TerrainList
          selectedTerrainId={selectedTerrainId}
          onSelect={setSelectedTerrainId}
          filterPlayerId={selectedPlayerId}
        />
      </div>
    </>
  )
}

export default App
