import React from 'react';
import type { FC } from 'react';

interface ResponseBarProps {
  suggestion: string
}

const ResponseBar: FC<ResponseBarProps> = ({ suggestion }) => (
  <div className="bg-amber-800 text-amber-100 p-4 border-b border-amber-900">
    <div className="flex items-start gap-4">
      <h1 className="text-xl font-medium mb-2">EKO:</h1>
      <div className="bg-amber-200 text-amber-900 p-3 rounded-md flex-1">
        <p className="text-sm leading-relaxed">{suggestion}</p>
      </div>
    </div>
  </div>
);

export default ResponseBar;
