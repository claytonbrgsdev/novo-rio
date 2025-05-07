import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import axios from 'axios'
import Layout from './components/Layout'
import BadgeView from './components/BadgeView'
import ClimateConditionsView from './components/ClimateConditionsView'
import RootLayout from './components/RootLayout'
import PlantGrid from './components/PlantGrid'
import ControlPanel from './components/ControlPanel'
import SpeciesInfo from './components/SpeciesInfo'

const FarmIframe: React.FC = () => (
  <div style={{ width: '100vw', height: '100vh', border: 0, padding: 0, margin: 0 }}>
    <iframe
      src="http://localhost:3000"
      title="Farm Game Interface"
      style={{ width: '100%', height: '100%', border: 'none' }}
      allow="clipboard-write; clipboard-read"
    />
  </div>
)

const App: React.FC = () => {
  const [plantings, setPlantings] = useState<any[]>([])
  const [actionsLeft, setActionsLeft] = useState<number>(0)
  const [cycleResetTime, setCycleResetTime] = useState<Date>(new Date())

  async function fetchData() {
    const resP = await axios.get('/plantings?player_id=1')
    const data = resP.data
    setPlantings(data)
    setActionsLeft(data[0]?.actions_left || 0)
    setCycleResetTime(new Date(data[0]?.cycle_reset_time))
  }

  useEffect(() => { fetchData() }, [])

  async function onAction(type: string, payload?: any) {
    await axios.post(`/action/${type}`, payload)
    await fetchData()
  }

  return (
    <RootLayout>
      <SpeciesInfo />
      <ControlPanel actionsLeft={actionsLeft} cycleResetTime={cycleResetTime} onAction={onAction} />
      <PlantGrid plantings={plantings} onPlant={({ x, y }) => onAction('plant', { player_id: 1, species_key: 'Cajanus_cajan', position: { x, y } })} />
      <Routes>
        <Route path="/farm" element={<FarmIframe />} />
        <Route path="/badges" element={<BadgeView />} />
        <Route path="/climate-conditions" element={<ClimateConditionsView />} />
        <Route path="/*" element={<Layout />} />
      </Routes>
    </RootLayout>
  )
}

export default App
