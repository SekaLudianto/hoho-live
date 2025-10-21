import React from 'react';
import { User } from '../types';
import { SultanCrownIcon } from './icons/SultanCrownIcon';

interface FollowMeOverlayProps {
  winner: User | null;
}

const FollowMeOverlay: React.FC<FollowMeOverlayProps> = ({ winner }) => {
  if (!winner) {
    return null;
  }

  return (
    <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center p-4 z-40 transition-all duration-500 ease-in-out`}
    >
      <div 
        className={`bg-gray-900/60 backdrop-blur-sm border-2 border-yellow-500/50 shadow-2xl rounded-2xl w-full max-w-xs transition-all duration-500 ease-in-out p-4 flex flex-col items-center`}
        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
      >
        <div className="relative mb-2">
            <SultanCrownIcon className="w-10 h-10 text-yellow-400 absolute -top-7 left-1/2 -translate-x-1/2" />
            <img 
                className="w-16 h-16 rounded-full border-2 border-yellow-400 shadow-lg"
                src={winner.profilePictureUrl} 
                alt={winner.nickname} 
            />
        </div>
        <p className="text-lg font-bold text-white mt-1 truncate max-w-full">{winner.nickname}</p>
        <p className="text-sm text-yellow-300 font-semibold mt-1 text-center">
            Follow Gue Dulu dong
        </p>
      </div>
    </div>
  );
};

export default FollowMeOverlay;