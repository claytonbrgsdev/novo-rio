import React, { FC, useState } from 'react';
import ResponseBar from './TopBar/ResponseBar';
import WeatherBar from './TopBar/WeatherBar';
import ShopButton from '../ShopButton';
import TerrainList from '../TerrainList';
import PlayerTerrainView from '../PlayerTerrainView';
import TerrainDetail from '../TerrainDetail';
import InventoryTabs from './BottomBar/InventoryTabs';
import ChatActionPanel from './BottomBar/ChatActionPanel';
import CharacterNav from './BottomBar/CharacterNav';
import { useClimateConditions } from '../../hooks/useClimateConditions';
import { ollamaApi } from '../../api';
import type { ChatMessage } from '../PlayerTerrainView';

// Types for Layout state
type ViewMode = 'macro' | 'medium' | 'micro';

const Layout: FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('macro');
  const [selectedTerrainId, setSelectedTerrainId] = useState<number | null>(null);
  const [chatMode, setChatMode] = useState<string>('chat');
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [suggestion, setSuggestion] = useState<string>('');

  const { data: climateConditions, isLoading: weatherLoading } = useClimateConditions();
  const weatherDescription = weatherLoading ? 'Carregando...' : climateConditions?.[0]?.description ?? '';
  const temp = 25;
  const humidity = 45;
  const rainChance = 10;
  const resources = { carrot: 0, water: 0, coin: 0 };
  const grid = { cols: 5, rows: 3, data: Array.from({ length: 3 }, () => Array(5).fill('')) };

  const handleSend = async (text: string): Promise<void> => {
    // add player message
    setChatLog((prev) => [...prev, { from: 'player', text }]);
    setSuggestion('EKO → Carregando...');
    try {
      const res = await ollamaApi.post('/v1/chat/completions', {
        model: 'llama3.1:8b',
        messages: [{ role: 'user', content: text }],
        stream: false,
      });
      const content = res.data.choices?.[0]?.message?.content || '';
      // add eko response to chat log
      setChatLog((prev) => [...prev, { from: 'eko', text: content }]);
      setSuggestion(`EKO → ${content}`);
    } catch (error) {
      console.error(error);
      const errMsg = 'Erro ao obter resposta.';
      setChatLog((prev) => [...prev, { from: 'eko', text: errMsg }]);
      setSuggestion(`EKO → ${errMsg}`);
    }
  };

  return (
    <div className="game-layout w-screen h-screen min-h-0 min-w-0 flex flex-col overflow-hidden">
      <div className="flex flex-col">
        <ResponseBar suggestion={suggestion} />
        <div className="flex w-full items-center">
          <div className="flex-1 mr-4">
            <WeatherBar description={weatherDescription} temp={temp} humidity={humidity} rainChance={rainChance} />
          </div>
          <ShopButton onClick={() => {}} />
        </div>
      </div>
      <div className="middle-view" style={{ backgroundColor: 'lightgreen' }}>
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
            weather={{ temp, rainChance }}
            resources={resources}
            grid={grid}
            chat={chatLog}
            onSendMessage={handleSend}
          />
        )}
        {viewMode === 'micro' && <TerrainDetail terrainId={selectedTerrainId} />}
      </div>
      <div className="bottom-bar flex flex-row w-full h-32 bg-red-300">
        <div className="flex-1 flex flex-col justify-between">
          <InventoryTabs tools={[]} inputs={[]} plantables={[]} counts={{}} />
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <ChatActionPanel mode={chatMode} setMode={setChatMode} onSend={(text) => handleSend(text)} />
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <CharacterNav setViewMode={setViewMode} />
        </div>
      </div>
    </div>
  );
};

export default Layout;
