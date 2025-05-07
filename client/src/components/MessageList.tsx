import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from './PlayerTerrainView';

interface MessageListProps {
  messages: ChatMessage[];
}

export default function MessageList({ messages }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto max-h-40 space-y-2 p-2 bg-white rounded-md shadow-inner"
    >
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={
            `px-3 py-1 rounded-md break-words ${
              msg.from === 'player' ? 'bg-blue-100 text-right' : 'bg-gray-100 text-left'
            }`
          }
        >
          {msg.text}
        </div>
      ))}
    </div>
  );
}
