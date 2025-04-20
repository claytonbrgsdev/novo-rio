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

const Layout = () => {
  const [viewMode, setViewMode] = useState('macro');
  const [selectedTerrainId, setSelectedTerrainId] = useState(null);
  const [chatMode, setChatMode] = useState('chat');
  const [chatLog, setChatLog] = useState([]);

  // Stub data
  const suggestion = 'EKO: ...';
  const weather = { icon: null, description: 'Ensolarado' };
  const resources = { carrot: 0, water: 0, coin: 0 };
  const grid = { cols: 5, rows: 3, data: Array(3).fill().map(() => Array(5).fill('')) };

  const handleSend = (text) => {
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
            onSelect={(id) => { setSelectedTerrainId(id); setViewMode('medium'); }}
          />
        )}
        {viewMode === 'medium' && (
          <PlayerTerrainView
            player={{ name: 'PLAYER' }}
            suggestion={suggestion}
            weather={weather}
            resources={resources}
            grid={grid}
            chat={chatLog}
            onSendMessage={(msg) => handleSend(msg)}
          />
        )}
        {viewMode === 'micro' && <TerrainDetail terrainId={selectedTerrainId} />}
      </div>
      <div className="bottom-bar">
        <InventoryTabs tools={[]} inputs={[]} plantables={[]} counts={{}} />
        <ChatActionPanel mode={chatMode} setMode={setChatMode} onSend={(text) => handleSend(text)} />
        <CharacterNav setViewMode={setViewMode} />
      </div>
    </div>
  );
};

export default Layout;
