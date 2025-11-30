import React from 'react';

const RiskChip: React.FC<{ level: 'low' | 'medium' | 'high' }> = ({ level }) => {
  const levelStyles = {
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${levelStyles[level]}`}>
      {level.toUpperCase()}
    </span>
  );
};

export default RiskChip;
