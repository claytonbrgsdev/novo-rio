import React, { FormEvent } from 'react';
import './PlayerTerrainView.css';

export interface ChatMessage { from?: 'player' | 'eko'; text: string; }
export interface GridData { cols: number; rows: number; data: string[][]; }
export interface Resources { carrot: number; water: number; coin: number; }
export interface Weather { temp: number; rainChance: number; }
export interface PlayerProps { name: string; }

export interface PlayerTerrainViewProps {
  player?: PlayerProps;
  chat?: ChatMessage[];
  onSendMessage?: (msg: string) => void;
  grid?: GridData;
  weather?: Weather;
  resources?: Resources;
  suggestion?: string;
  avatarUrl?: string | null;
}

const PlayerTerrainView: React.FC<PlayerTerrainViewProps> = ({
  player = { name: 'PLAYER 04' },
  chat = [],
  onSendMessage,
  grid = { cols: 5, rows: 3, data: [] },
  weather = { temp: 25, rainChance: 10 },
  resources = { carrot: 12, water: 8, coin: 5 },
  suggestion = '',
  avatarUrl = null,
}) => {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('msg') as HTMLInputElement;
    if (onSendMessage && input.value) {
      onSendMessage(input.value);
      input.value = '';
    }
  };

  return (
    <div className="player-terrain-root">
      <div className="eko-message">
        <span className="eko-avatar" role="img" aria-label="eko">🧑‍🚀</span>
        <span className="eko-text">{suggestion}</span>
      </div>
      <div className="top-bar">
        <div className="resource-list">
          <div className="resource"><span role="img" aria-label="carrot">🥕</span> {resources.carrot}</div>
          <div className="resource"><span role="img" aria-label="water">💧</span> {resources.water}</div>
          <div className="resource"><span role="img" aria-label="coin">🪙</span> {resources.coin}</div>
        </div>
        <div className="weather">
          <span>{weather.temp}°C</span>
          <span>Chance de chuva: {weather.rainChance}%</span>
        </div>
      </div>
      <div className="terrain-grid-section">
        <div className="terrain-grid">
          {Array.from({ length: grid.rows }).map((_, rowIdx) => (
            <div className="terrain-row" key={rowIdx}>
              {Array.from({ length: grid.cols }).map((_, colIdx) => (
                <div className="terrain-cell" key={colIdx}>
                  {grid.data[rowIdx]?.[colIdx] || ''}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="player-avatar">
          {avatarUrl ? <img src={avatarUrl} alt="avatar" /> : <span role="img" aria-label="robot">🤖</span>}
        </div>
      </div>
      <div className="player-info-bar">
        <span className="player-name">{player.name}</span>
      </div>
      <div className="chat-section">
        <div className="chat-log">
          {chat.map((msg, i) => (
            <div key={i} className={`chat-msg ${msg.from === 'player' ? 'player' : 'eko'}`}>{msg.text}</div>
          ))}
        </div>
        <form className="chat-input" onSubmit={handleSubmit}>
          <input name="msg" placeholder="Digite sua mensagem aqui..." autoComplete="off" />
          <button type="submit">ENVIAR</button>
        </form>
      </div>
    </div>
  );
};

export default PlayerTerrainView;
