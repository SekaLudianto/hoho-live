import React from 'react';
import { TileStatus } from '../types';

interface TileProps {
  letter?: string;
  status: TileStatus;
}

const Tile: React.FC<TileProps> = ({ letter = '', status }) => {
  const baseClasses = "w-full aspect-square inline-flex justify-center items-center text-2xl font-bold uppercase text-white border-2 rounded-md transition-colors duration-300";
  
  const statusClasses: Record<TileStatus, string> = {
    empty: 'border-gray-600',
    pending: 'border-gray-500 bg-gray-800',
    correct: 'bg-green-600 border-green-600',
    present: 'bg-yellow-600 border-yellow-600',
    absent: 'bg-gray-600 border-gray-600',
  };
  
  return (
    <div className={`${baseClasses} ${statusClasses[status]}`}>
        {letter}
    </div>
  );
};

export default Tile;
