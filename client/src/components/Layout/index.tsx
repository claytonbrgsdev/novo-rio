import React, { useState } from 'react';
import ResponseBar from './TopBar/ResponseBar';
import WeatherBar from './TopBar/WeatherBar';
import ShopButton from '../ShopButton';
import TerrainList from '../TerrainList';
import PlayerTerrainView from '../PlayerTerrainView';
import TerrainDetail from '../TerrainDetail';
import InventoryTabs from './BottomBar/InventoryTabs';
import ChatActionPanel from './BottomBar/ChatActionPanel';
import CharacterNav from './BottomBar/CharacterNav';

const Layout: React.FC = () => {
  const [viewMode, setViewMode] = useState<string>('macro');
  const [selectedTerrainId, setSelectedTerrainId] = useState<number | null>(null);
  const [chatMode, setChatMode] = useState<string>('chat');
  const [chatLog, setChatLog] = useState<{ text: string; mode: string }[]>([]);

  // Stub data
  const suggestion = 'EKO: ...';
  const weather = { icon: null, description: 'Ensolarado' };
  const resources = { carrot: 0, water: 0, coin: 0 };
  const grid = { cols: 5, rows: 3, data: Array(3).fill(null).map(() => Array(5).fill('')) };

  const handleSend = (text: string) => {
    setChatLog([...chatLog, { text, mode: chatMode }]);
    // TODO: integrate backend call
  };

  return (
    <div className="game-layout">
      <div className="top-bar">
        <ResponseBar suggestion={suggestion} />
        <WeatherBar {...weather} />
        <ShopButton onClick={() => {}} />
      </div>
      <div className="middle-view">
        {viewMode === 'macro' && (
          <TerrainList
            selectedTerrainId={selectedTerrainId}
            onSelect={(id: number) => { setSelectedTerrainId(id); setViewMode('medium'); }}
          />
        )}
        {viewMode === 'medium' && (
          <PlayerTerrainView
            player={{ name: 'PLAYER' }}
            suggestion={suggestion}
            /* omit weather prop to use default Weather */
            resources={resources}
            grid={grid}
            chat={chatLog}
            onSendMessage={(msg: string) => handleSend(msg)}
          />
        )}
        {viewMode === 'micro' && <TerrainDetail terrainId={selectedTerrainId} />}
      </div>
      <div className="bottom-bar">
        <InventoryTabs tools={[]} inputs={[]} plantables={[]} counts={{}} />
        <ChatActionPanel mode={chatMode} setMode={setChatMode} onSend={(text: string) => handleSend(text)} />
        <CharacterNav setViewMode={setViewMode} />
      </div>
    </div>
  );
};

export default Layout;
