import React from 'react';

interface CharacterNavProps {
  setViewMode: (mode: string) => void;
}

const CharacterNav: React.FC<CharacterNavProps> = ({ setViewMode }) => (
  <div className="character-nav">CharacterNav Placeholder</div>
);

export default CharacterNav;
