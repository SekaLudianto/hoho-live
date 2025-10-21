import React from 'react';
import { LeaderboardEntry } from '../types';

interface RankOverlayProps {
  isOpen: boolean;
  leaderboard: LeaderboardEntry[];
}

const titles = ['🏆 Master Kata', '🥈 Raja Tebak', '🥉 Jenius Aksara'];
const trophy_colors = ['text-yellow-400', 'text-gray-300', 'text-yellow-600'];

const RankOverlay: React.FC<RankOverlayProps> = ({ isOpen, leaderboard }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
        className={`fixed inset-0 flex items-center justify-center p-4 z-50 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div 
        className={`bg-gray-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-xl shadow-2xl w-full max-w-md transition-all duration-300 ease-in-out ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <div className="p-6">
            <h3 className="text-2xl font-bold text-center text-cyan-400 mb-4">Papan Peringkat Teratas</h3>
            <div className="space-y-3">
                {leaderboard.length > 0 ? (
                leaderboard.slice(0, 3).map((entry, index) => (
                    <div key={entry.user.uniqueId} className="bg-gray-800/60 p-3 rounded-lg flex items-center text-sm shadow-md">
                    <span className={`text-3xl font-bold w-10 text-center ${trophy_colors[index] || 'text-white'}`}>{index + 1}</span>
                    <img className="w-12 h-12 rounded-full mx-4 border-2 border-gray-600" src={entry.user.profilePictureUrl} alt={entry.user.nickname} />
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-white truncate text-base">{entry.user.nickname}</div>
                        <div className="text-xs text-cyan-400">{titles[index] || 'Penebak Hebat'}</div>
                    </div>
                    <div className="text-right pl-3">
                        <div className="font-bold text-xl text-white">{entry.wins}</div>
                        <div className="text-xs text-gray-400">Menang</div>
                    </div>
                    </div>
                ))
                ) : (
                <div className="flex items-center justify-center h-48 text-gray-400">
                    Belum ada pemenang dalam ronde ini.
                </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default RankOverlay;