import React, { FC } from 'react';

interface CharacterNavProps {
  setViewMode: (mode: 'macro' | 'medium' | 'micro') => void
}

const CharacterNav: FC<CharacterNavProps> = ({ setViewMode }) => (
  <div className="character-nav">CharacterNav Placeholder</div>
);

export default CharacterNav;
