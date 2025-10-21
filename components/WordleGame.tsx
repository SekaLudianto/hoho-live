import React, { useState, useEffect, useCallback, useRef } from 'react';
import WordleGrid from './WordleGrid';
import Modal from './Modal';
import { ChatMessage, GiftMessage, GuessData, TileStatus, User } from '../types';
import wordService from '../services/wordService';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface WordleGameProps {
    latestChatMessage: ChatMessage | null;
    latestGiftMessage: GiftMessage | null;
    isConnected: boolean;
    updateLeaderboard: (winner: User) => void;
    participants: Set<string>;
    addParticipant: (user: User, reason: 'follow' | 'gift' | 'comment') => void;
    showValidationToast: (content: string, type: 'info' | 'error') => void;
    onInstantWin: (winner: User) => void;
    onNewGameStart: () => void;
}

const WORD_LENGTH = 5;
const TIMER_DURATION = 900; // 15 menit dalam detik

const calculateStatuses = (guess: string, solution: string): TileStatus[] => {
    if (guess === solution) {
        return Array(solution.length).fill('correct');
    }

    const guessChars = guess.split('');
    const solutionChars = solution.split('');
    const statuses: TileStatus[] = Array(solution.length).fill('absent');
  
    // Find 'correct' matches
    guessChars.forEach((letter, i) => {
      if (solutionChars[i] === letter) {
        statuses[i] = 'correct';
        solutionChars[i] = ''; // Mark as used
      }
    });
  
    // Find 'present' matches
    guessChars.forEach((letter, i) => {
      if (statuses[i] !== 'correct') {
        const indexInSolution = solutionChars.indexOf(letter);
        if (indexInSolution !== -1) {
          statuses[i] = 'present';
          solutionChars[indexInSolution] = ''; // Mark as used
        }
      }
    });
  
    return statuses;
};

const WordleGame: React.FC<WordleGameProps> = ({ 
    latestChatMessage, 
    latestGiftMessage,
    isConnected, 
    updateLeaderboard, 
    participants, 
    addParticipant, 
    showValidationToast,
    onInstantWin,
    onNewGameStart
}) => {
    const [targetWord, setTargetWord] = useState<string>('');
    
    const [guessHistory, setGuessHistory] = useState<GuessData[]>([]);
    const [bestGuess, setBestGuess] = useState<GuessData | null>(null);
    const [recentGuesses, setRecentGuesses] = useState<GuessData[]>([]);

    const [isGameOver, setIsGameOver] = useState(false);
    const [gameMessage, setGameMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isPreparing, setIsPreparing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<{ title: string; word: string; definitions: string[]; examples: string[], winner?: User }>({ title: '', word: '', definitions: [], examples: [], winner: undefined });
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    const messageQueueRef = useRef<ChatMessage[]>([]);
    const isProcessingQueueRef = useRef(false);
    const processedGuesses = useRef(new Set<string>());
    const timerIntervalRef = useRef<number | null>(null);
    const gridContainerRef = useRef<HTMLDivElement>(null);
    const lastProcessedMessageRef = useRef<ChatMessage | null>(null);
    const lastProcessedGiftRef = useRef<GiftMessage | null>(null);
    const isEndingGame = useRef(false);
    const modalTimeoutRef = useRef<number | null>(null);
    const restartTimeoutRef = useRef<number | null>(null);
    const prepareGameTimeoutRef = useRef<number | null>(null);

    const clearTimer = useCallback(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
    }, []);

    const autoRestartGame = useCallback(() => {
        if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
            restartTimeoutRef.current = null;
        }
        setIsModalOpen(false);
        setTimeout(() => {
            startNewGame();
        }, 500);
    }, []);
    
    const endGame = useCallback((winner: User, title: string) => {
        if (isEndingGame.current) return;
        isEndingGame.current = true;
        
        clearTimer();
        setTimeLeft(null);
        setGameMessage(`BERHASIL! ${winner.nickname} menebak kata yang benar!`);
        setIsGameOver(true);
        updateLeaderboard(winner);
        
        modalTimeoutRef.current = window.setTimeout(() => {
            const def = wordService.getWordDefinition(targetWord);
            setModalContent({
                title,
                word: targetWord,
                definitions: def?.submakna || ['Definisi tidak ditemukan.'],
                examples: def?.contoh || [],
                winner: winner,
            });
            setIsModalOpen(true);
            restartTimeoutRef.current = window.setTimeout(autoRestartGame, 5000);
        }, 1500);

    }, [targetWord, clearTimer, updateLeaderboard, autoRestartGame]);

    const handleForceReveal = useCallback(() => {
        if (isGameOver || isEndingGame.current || !targetWord) return;
        isEndingGame.current = true;

        clearTimer();
        setGameMessage(`Kata dibuka! Jawaban: ${targetWord}`);
        setIsGameOver(true);
        
        modalTimeoutRef.current = window.setTimeout(() => {
            const def = wordService.getWordDefinition(targetWord);
            setModalContent({
                title: 'Kata Telah Dibuka',
                word: targetWord,
                definitions: def?.submakna || ['Definisi tidak ditemukan.'],
                examples: def?.contoh || [],
                winner: undefined,
            });
            setIsModalOpen(true);
            restartTimeoutRef.current = window.setTimeout(autoRestartGame, 5000);
        }, 1500);
    }, [isGameOver, targetWord, clearTimer, autoRestartGame]);

    const startNewGame = useCallback(async () => {
        // Phase 1: Cleanup and set "preparing" state
        setIsLoading(true);
        
        // Cleanup all possible timers
        clearTimer();
        if (modalTimeoutRef.current) clearTimeout(modalTimeoutRef.current);
        if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
        if (prepareGameTimeoutRef.current) clearTimeout(prepareGameTimeoutRef.current);

        isEndingGame.current = false;
        
        setGuessHistory([]);
        setIsGameOver(false);
        setGameMessage('');
        processedGuesses.current.clear();
        messageQueueRef.current = [];
        setTimeLeft(null);
        setTargetWord(''); // Clear word during preparation

        setIsPreparing(true);
        setIsLoading(false);

        // Phase 2: After a delay, set the word and start the timer
        prepareGameTimeoutRef.current = window.setTimeout(async () => {
            await wordService.initialize();
            onNewGameStart();
            const newWord = wordService.getRandomWord(WORD_LENGTH);
            setTargetWord(newWord);
            
            setIsPreparing(false); // End "preparing" state
            setTimeLeft(TIMER_DURATION); // Start the timer now
        }, 3000); // 3-second "get ready" period

    }, [clearTimer, onNewGameStart]);

    useEffect(() => {
        startNewGame();
    }, []);

    useEffect(() => {
        if (guessHistory.length === 0) {
            setBestGuess(null);
            setRecentGuesses([]);
            return;
        }

        const getScore = (statuses: TileStatus[]) => 
            statuses.reduce((sum, status) => {
                if (status === 'correct') return sum + 2;
                if (status === 'present') return sum + 1;
                return sum;
            }, 0);

        let topGuess: GuessData = guessHistory[0];
        let topScore = getScore(guessHistory[0].statuses);

        for (let i = 1; i < guessHistory.length; i++) {
            const guessData = guessHistory[i];
            const score = getScore(guessData.statuses);
            if (score >= topScore) { // >= favors newer guesses if scores are equal
                topScore = score;
                topGuess = guessData;
            }
        }
        
        setBestGuess(topGuess);
        
        const otherGuesses = [...guessHistory]
            .reverse()
            .filter(g => g !== topGuess);

        setRecentGuesses(otherGuesses);

    }, [guessHistory]);
    
    useEffect(() => {
        if (timeLeft !== null && timeLeft > 0 && !isGameOver) {
            timerIntervalRef.current = window.setInterval(() => {
                setTimeLeft(prevTime => (prevTime !== null ? prevTime - 1 : null));
            }, 1000);
        } else if (timeLeft === 0 && !isGameOver) {
            if (isEndingGame.current) return;
            isEndingGame.current = true;

            clearTimer();
            setGameMessage(`WAKTU HABIS! Kata yang benar adalah ${targetWord}`);
            setIsGameOver(true);
            modalTimeoutRef.current = window.setTimeout(() => {
                const def = wordService.getWordDefinition(targetWord);
                setModalContent({
                    title: 'WAKTU HABIS!',
                    word: targetWord,
                    definitions: def?.submakna || ['Definisi tidak ditemukan.'],
                    examples: def?.contoh || [],
                    winner: undefined,
                });
                setIsModalOpen(true);
                restartTimeoutRef.current = window.setTimeout(autoRestartGame, 5000);
            }, 1500);
        }

        return () => clearTimer();
    }, [timeLeft, isGameOver, targetWord, clearTimer, autoRestartGame]);

    const handleGuess = useCallback((message: ChatMessage) => {
        if (!participants.has(message.uniqueId)) {
            const toastContent = `<b>${message.nickname}</b>, kirim gift, follow, atau komen 'GGMU' dulu untuk ikut menebak!`;
            showValidationToast(toastContent, 'info');
            return;
        }
        
        const guess = message.comment.trim();
        const user = message;

        if (!isConnected || isGameOver || isPreparing || guess.length !== WORD_LENGTH || !targetWord) {
            return;
        }
    
        const upperGuess = guess.toUpperCase();
    
        if (processedGuesses.current.has(upperGuess)) {
            return;
        }
        
        const isValid = wordService.isValidWord(guess);
    
        if (!isValid) {
            const toastContent = `Kata <b>${upperGuess}</b> tidak valid! <br/><span class="text-xs opacity-75">Dari: ${user.nickname}</span>`;
            showValidationToast(toastContent, 'error');
            return;
        }
        
        processedGuesses.current.add(upperGuess);
        const statuses = calculateStatuses(upperGuess, targetWord);
        const newGuessData: GuessData = { guess: upperGuess, user, statuses };
        setGuessHistory(prev => [...prev, newGuessData]);

        if (upperGuess === targetWord) {
            endGame(user, '🎉 PEMENANG! 🎉');
        }
    }, [isGameOver, isConnected, targetWord, endGame, isPreparing, participants, showValidationToast]);

    useEffect(() => {
        if (latestChatMessage && latestChatMessage !== lastProcessedMessageRef.current) {
            lastProcessedMessageRef.current = latestChatMessage;
            messageQueueRef.current.push(latestChatMessage);
        }
    }, [latestChatMessage]);
    
    useEffect(() => {
        if (latestGiftMessage && latestGiftMessage !== lastProcessedGiftRef.current) {
             if (isGameOver || isEndingGame.current || isPreparing) return;

            lastProcessedGiftRef.current = latestGiftMessage;
            const gift = latestGiftMessage;
            const diamondValue = gift.diamondCount * gift.repeatCount;

            if (diamondValue === 10) {
                 const statuses = Array(WORD_LENGTH).fill('correct');
                 const newGuessData: GuessData = { guess: targetWord, user: gift, statuses };
                 setGuessHistory(prev => [...prev, newGuessData]);
                 endGame(gift, 'MEMBUKA KATA!');
            } else if (diamondValue >= 30) {
                onInstantWin(gift);
                const statuses = Array(WORD_LENGTH).fill('correct');
                 const newGuessData: GuessData = { guess: targetWord, user: gift, statuses };
                 setGuessHistory(prev => [...prev, newGuessData]);
                endGame(gift, '🏆 SULTAN MENANG! 🏆');
            }
        }
    }, [latestGiftMessage, isGameOver, isPreparing, endGame, onInstantWin, targetWord]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (isProcessingQueueRef.current || messageQueueRef.current.length === 0) {
                return;
            }

            isProcessingQueueRef.current = true;
            const messageToProcess = messageQueueRef.current.shift();
            
            if (messageToProcess) {
                const comment = messageToProcess.comment.trim().toUpperCase();
                const user = messageToProcess;

                // Check for participation phrase
                if (comment === 'GGMU') {
                    addParticipant(user, 'comment');
                } 
                // Check for a valid guess
                else if (comment.length === WORD_LENGTH && /^[A-Z]+$/.test(comment)) {
                    handleGuess(messageToProcess);
                }
            }

            isProcessingQueueRef.current = false;

        }, 100); // Process up to 10 messages per second

        return () => clearInterval(interval);
    }, [handleGuess, addParticipant]);
    
    const formatTime = (seconds: number | null) => {
        if (seconds === null) return null;
        return seconds.toString();
    };

    return (
        <>
            <div className="bg-gray-900/50 p-2 md:p-6 rounded-lg flex flex-col h-full">
                {isPreparing ? (
                     <div className="text-center text-base md:text-lg font-bold mb-1 text-yellow-400 animate-pulse h-[28px] flex items-center justify-center">
                        Bersiap...
                    </div>
                ) : timeLeft !== null ? (
                    <div className={`text-center text-base md:text-lg font-bold mb-1 h-[28px] flex items-center justify-center ${timeLeft <= 30 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                        {formatTime(timeLeft)}
                    </div>
                ) : (
                    <div className="h-[28px] mb-1"></div> 
                )}
                
                <p className="text-center text-gray-400 text-xs md:text-sm mb-1 flex items-center justify-center">
                    {isConnected ? (isPreparing ? 'Game baru akan segera dimulai!' : `Kirim gift, follow, atau komen 'GGMU' untuk ikut menebak!`) : 'Hubungkan ke TikTok LIVE untuk memulai!'}
                </p>
                <div className="w-full mx-auto flex-grow overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <SpinnerIcon className="w-10 h-10" />
                        </div>
                    ) : (
                        <div className="h-full overflow-y-auto pr-2" ref={gridContainerRef}>
                            <WordleGrid 
                                bestGuess={bestGuess}
                                recentGuesses={recentGuesses}
                                wordLength={WORD_LENGTH} 
                            />
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-center justify-center mt-1">
                    <div className="text-center text-sm md:text-base font-medium text-cyan-400 h-6">
                        {isPreparing ? 'Kata baru sedang disiapkan...' : gameMessage}
                    </div>
                    {!isGameOver && !isPreparing && isConnected && (
                        <button 
                            onClick={handleForceReveal}
                            className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500"
                            aria-label="Paksa buka kata dan mulai game baru"
                        >
                            Buka Kata
                        </button>
                    )}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={autoRestartGame} title={modalContent.title}>
                 {modalContent.winner ? (
                    <div className="text-center">
                        <img src={modalContent.winner.profilePictureUrl} alt={modalContent.winner.nickname} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-cyan-400"/>
                        <p className="text-xl font-bold text-white">{modalContent.winner.nickname}</p>
                        <p>Berhasil menebak kata:</p>
                        <p className="text-cyan-400 text-2xl font-bold my-2">{modalContent.word}</p>
                         {modalContent.definitions.length > 0 && modalContent.definitions[0] !== 'Definisi tidak ditemukan.' && (
                             <div className="mt-2 pt-2 border-t border-gray-700 text-left">
                                 <p className="font-semibold">Definisi:</p>
                                 <ul className="text-sm list-disc list-inside space-y-1">
                                    {modalContent.definitions.map((def, i) => <li key={i}>{def}</li>)}
                                 </ul>
                                  {modalContent.examples.length > 0 && (
                                    <>
                                     <p className="font-semibold mt-2">Contoh:</p>
                                     <ul className="text-sm list-disc list-inside space-y-1">
                                        {modalContent.examples.map((ex, i) => <li key={i} className="italic">"{ex}"</li>)}
                                     </ul>
                                    </>
                                  )}
                             </div>
                         )}
                    </div>
                 ) : (
                    <>
                         <p>Kata rahasianya adalah: <b className="text-cyan-400 text-xl">{modalContent.word}</b></p>
                         {modalContent.definitions.length > 0 && modalContent.definitions[0] !== 'Definisi tidak ditemukan.' && (
                             <div className="mt-2 pt-2 border-t border-gray-700 text-left">
                                 <p className="font-semibold">Definisi:</p>
                                 <ul className="text-sm list-disc list-inside space-y-1">
                                    {modalContent.definitions.map((def, i) => <li key={i}>{def}</li>)}
                                 </ul>
                                  {modalContent.examples.length > 0 && (
                                    <>
                                     <p className="font-semibold mt-2">Contoh:</p>
                                     <ul className="text-sm list-disc list-inside space-y-1">
                                        {modalContent.examples.map((ex, i) => <li key={i} className="italic">"{ex}"</li>)}
                                     </ul>
                                    </>
                                  )}
                             </div>
                         )}
                    </>
                 )}
                 <p className="text-xs text-gray-400 mt-4">Game baru akan dimulai secara otomatis...</p>
            </Modal>
        </>
    );
};

export default WordleGame;