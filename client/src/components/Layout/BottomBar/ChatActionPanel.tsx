import React, { FC } from 'react';

interface ChatActionPanelProps {
  mode: string
  setMode: (mode: string) => void
  onSend: (text: string) => void
}

const ChatActionPanel: FC<ChatActionPanelProps> = ({ mode, setMode, onSend }) => {
  const [input, setInput] = React.useState('');

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Digite sua mensagem..."
        className="flex-1 rounded px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400 text-black"
      />
      <button
        onClick={handleSend}
        className="bg-amber-400 hover:bg-amber-500 text-amber-900 font-semibold px-4 py-2 rounded shadow"
      >
        Enviar
      </button>
    </div>
  );
};

export default ChatActionPanel;
