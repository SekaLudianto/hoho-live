import React from 'react';
import Tile from './Tile';
import { GuessData, TileStatus } from '../types';

interface WordleGridProps {
  bestGuess: GuessData | null;
  recentGuesses: GuessData[];
  wordLength: number;
}

const WordleGrid: React.FC<WordleGridProps> = ({ bestGuess, recentGuesses, wordLength }) => {

  const renderGuessRow = (guessData: GuessData, key: string | number) => (
    <div key={key} className="guess-row">
        <div className="flex items-center gap-2 mb-1">
            <img
                className="w-6 h-6 rounded-full bg-gray-700 object-cover"
                src={guessData.user.profilePictureUrl}
                alt={guessData.user.nickname}
            />
            <span className="text-sm text-gray-300 font-medium break-words">
                {guessData.user.nickname}
            </span>
        </div>
        <div
            className="wordle-grid-row grid gap-1"
            style={{ gridTemplateColumns: `repeat(${wordLength}, 1fr)` }}
        >
            {Array.from({ length: wordLength }).map((_, j) => {
                const letter = guessData.guess[j] || '';
                const status = guessData.statuses[j] || 'empty';
                return <Tile key={j} letter={letter} status={status} />;
            })}
        </div>
    </div>
  );


  if (!bestGuess) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 max-w-sm mx-auto">
            <p className="text-center">Belum ada tebakan.</p>
            <p className="text-center text-sm mb-4">Ayo tebak di kolom komentar!</p>
            <div
                className="wordle-grid-row grid gap-1 w-full"
                style={{ gridTemplateColumns: `repeat(${wordLength}, 1fr)` }}
            >
                {Array.from({ length: wordLength * 3 }).map((_, j) => (
                    <Tile key={j} letter="" status="empty" />
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-3 max-w-sm mx-auto">
        <div>
            <h4 className="text-sm font-bold text-yellow-400 mb-1 text-center uppercase tracking-wider">Tebakan Terbaik</h4>
            {renderGuessRow(bestGuess, 'best-guess')}
        </div>

        {recentGuesses.length > 0 && (
            <>
                <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-gray-800 px-2 text-xs text-gray-400 rounded-full">Tebakan Lainnya</span>
                    </div>
                </div>

                <div className="space-y-2">
                    {recentGuesses.map((guessData, i) => 
                        renderGuessRow(guessData, `${guessData.user.uniqueId}-${guessData.guess}-${i}`)
                    )}
                </div>
            </>
        )}
    </div>
  );
};

export default WordleGrid;