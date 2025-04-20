import React from 'react';

interface ResponseBarProps {
  suggestion: string;
}

const ResponseBar: React.FC<ResponseBarProps> = ({ suggestion }) => (
  <div className="response-bar">{suggestion}</div>
);

export default ResponseBar;
