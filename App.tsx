import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTikTok } from './hooks/useTikTok';
import Header from './components/Header';
import Stats from './components/Stats';
import WordleGame from './components/WordleGame';
import ChatBox from './components/ChatBox';
import GiftBox from './components/GiftBox';
import Leaderboard from './components/Leaderboard';
import RankOverlay from './components/RankOverlay';
import SultanOverlay from './components/SultanOverlay';
import { User, LeaderboardEntry, ChatMessage, GiftMessage } from './types';
import { GameIcon, LeaderboardIcon, ChatIcon, GiftIcon, StatsIcon } from './components/icons/TabIcons';
import { SpinnerIcon } from './components/icons/SpinnerIcon';
import MusicPlayer from './components/MusicPlayer';
import ViewModeSwitcher from './components/ViewModeSwitcher';

const TARGET_USERNAME = 'achmadsyams';

type ViewMode = 'mobile' | 'tablet' | 'desktop';

const App: React.FC = () => {
    const { 
        isConnected, 
        isConnecting,
        connectionState, 
        errorMessage, 
        connect, 
        latestChatMessage,
        latestGiftMessage,
        latestLikeMessage,
        latestSocialMessage,
        roomUsers,
        totalDiamonds,
    } = useTikTok();
    
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [activeTab, setActiveTab] = useState('game');
    const [isRankOverlayVisible, setIsRankOverlayVisible] = useState(false);
    const [sultanInfo, setSultanInfo] = useState<{ user: User; gift: GiftMessage } | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('desktop');
    
    const rankOverlayTimeoutRef = useRef<number | null>(null);
    const sultanTimeoutRef = useRef<number | null>(null);
    const lastProcessedRankCommandRef = useRef<ChatMessage | null>(null);

    useEffect(() => {
        if (!isConnected && !isConnecting) {
            connect(TARGET_USERNAME);
        }
    }, [isConnected, isConnecting, connect]);

    useEffect(() => {
        if (latestChatMessage && latestChatMessage !== lastProcessedRankCommandRef.current) {
            if (latestChatMessage.comment.trim().toLowerCase() === '!rank') {
                lastProcessedRankCommandRef.current = latestChatMessage;
                
                if (rankOverlayTimeoutRef.current) {
                    clearTimeout(rankOverlayTimeoutRef.current);
                }

                setIsRankOverlayVisible(true);
                
                rankOverlayTimeoutRef.current = window.setTimeout(() => {
                    setIsRankOverlayVisible(false);
                }, 5000); // Tampilkan selama 5 detik
            }
        }
    }, [latestChatMessage]);
    
     useEffect(() => {
        if (latestGiftMessage) {
            // Hapus timeout sebelumnya jika ada gift baru masuk dengan cepat
            if (sultanTimeoutRef.current) {
                clearTimeout(sultanTimeoutRef.current);
            }

            // Tampilkan sultan baru
            setSultanInfo({ user: latestGiftMessage, gift: latestGiftMessage });

            // Atur timeout untuk menyembunyikan overlay setelah 7 detik
            sultanTimeoutRef.current = window.setTimeout(() => {
                setSultanInfo(null);
            }, 7000);
        }
    }, [latestGiftMessage]);

    useEffect(() => {
        // Cleanup timeout on component unmount
        return () => {
            if (rankOverlayTimeoutRef.current) {
                clearTimeout(rankOverlayTimeoutRef.current);
            }
            if (sultanTimeoutRef.current) {
                clearTimeout(sultanTimeoutRef.current);
            }
        };
    }, []);

    const updateLeaderboard = useCallback((winner: User) => {
        setLeaderboard(prev => {
            const userIndex = prev.findIndex(entry => entry.user.uniqueId === winner.uniqueId);
            let newLeaderboard;

            if (userIndex > -1) {
                // Update skor & info pengguna yang ada
                newLeaderboard = [...prev];
                const updatedUser = { 
                    user: winner, // Perbarui info pengguna dengan yang terbaru
                    wins: newLeaderboard[userIndex].wins + 1 
                };
                newLeaderboard[userIndex] = updatedUser;
            } else {
                // Tambahkan pemenang baru
                const newWinner = { user: { ...winner }, wins: 1 };
                newLeaderboard = [...prev, newWinner];
            }

            // Urutkan berdasarkan kemenangan menurun, simpan semua pemain
            return newLeaderboard.sort((a, b) => b.wins - a.wins);
        });
    }, []);
    
    const tabs = [
        { name: 'game', label: 'Game', icon: <GameIcon /> },
        { name: 'stats', label: 'Statistik', icon: <StatsIcon /> },
        { name: 'leaderboard', label: 'Peringkat', icon: <LeaderboardIcon /> },
        { name: 'chat', label: 'Obrolan', icon: <ChatIcon /> },
        { name: 'gift', label: 'Hadiah', icon: <GiftIcon /> },
    ];

    const viewModeClasses: Record<ViewMode, string> = {
        mobile: 'w-full max-w-sm h-[844px] max-h-[90vh] md:aspect-auto',
        tablet: 'w-full max-w-2xl h-[1024px] max-h-[90vh] md:aspect-auto',
        desktop: 'w-full h-full md:max-w-6xl md:h-auto md:max-h-[95vh] md:aspect-[18/16]'
    };
    
    if (!isConnected) {
        return (
            <div className="w-full h-screen flex items-center justify-center p-4 bg-gray-900 text-gray-200">
                <div className="w-full max-w-md mx-auto bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6 text-center">
                    <Header />
                    <div className="flex flex-col items-center justify-center gap-4 py-8">
                        <SpinnerIcon className="w-12 h-12 text-cyan-400" />
                        <p className={`text-lg font-medium ${errorMessage ? 'text-red-400' : 'text-white'}`}>
                            {errorMessage ? errorMessage : `Menyambungkan ke LIVE @${TARGET_USERNAME}...`}
                        </p>
                        <p className="text-sm text-gray-400">
                            Harap tunggu sebentar, aplikasi akan mencoba menyambung kembali secara otomatis jika terputus.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen md:min-h-screen flex items-center justify-center p-2 md:p-4">
            <ViewModeSwitcher currentMode={viewMode} setMode={setViewMode} />
            <div className={`mx-auto bg-gray-800 md:rounded-2xl shadow-lg p-2 md:p-6 flex flex-col transition-all duration-300 ease-in-out ${viewModeClasses[viewMode]}`}>
                
                <RankOverlay isOpen={isRankOverlayVisible} leaderboard={leaderboard} />
                <SultanOverlay 
                    isOpen={!!sultanInfo} 
                    user={sultanInfo?.user || null} 
                    gift={sultanInfo?.gift || null} 
                />
                
                {/* Common Header Section */}
                <div className="flex-shrink-0 space-y-4">
                    <Header />
                    <div className="hidden md:block">
                        <Stats 
                          isConnected={isConnected} 
                          connectionState={connectionState} 
                          errorMessage={errorMessage}
                          roomUsers={roomUsers}
                          latestLike={latestLikeMessage}
                          totalDiamonds={totalDiamonds}
                        />
                    </div>
                </div>
                
                {/* Desktop Layout */}
                <div className="hidden md:grid grid-cols-[2fr_3fr] gap-6 mt-6 flex-grow min-h-0">
                    <WordleGame 
                        latestChatMessage={latestChatMessage}
                        latestGiftMessage={latestGiftMessage}
                        latestSocialMessage={latestSocialMessage}
                        isConnected={isConnected} 
                        updateLeaderboard={updateLeaderboard}
                    />
                    <div className="space-y-4 flex flex-col overflow-y-auto">
                       <Leaderboard leaderboard={leaderboard} />
                       <ChatBox latestMessage={latestChatMessage} />
                       <GiftBox latestGift={latestGiftMessage} />
                    </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden flex flex-col flex-grow min-h-0">
                    {/* Tab Content */}
                    <main className="flex-grow min-h-0 overflow-y-auto">
                        <div className={activeTab === 'game' ? 'h-full' : 'hidden'}>
                            <WordleGame 
                                latestChatMessage={latestChatMessage} 
                                latestGiftMessage={latestGiftMessage}
                                latestSocialMessage={latestSocialMessage}
                                isConnected={isConnected} 
                                updateLeaderboard={updateLeaderboard}
                            />
                        </div>
                         <div className={activeTab === 'stats' ? '' : 'hidden'}>
                            <div className="p-4">
                                <Stats 
                                    isConnected={isConnected} 
                                    connectionState={connectionState} 
                                    errorMessage={errorMessage}
                                    roomUsers={roomUsers}
                                    latestLike={latestLikeMessage}
                                    totalDiamonds={totalDiamonds}
                                />
                            </div>
                        </div>
                        <div className={activeTab === 'leaderboard' ? 'h-full' : 'hidden'}>
                            <Leaderboard leaderboard={leaderboard} />
                        </div>
                        <div className={activeTab === 'chat' ? 'h-full' : 'hidden'}>
                            <ChatBox latestMessage={latestChatMessage} />
                        </div>
                        <div className={activeTab === 'gift' ? 'h-full' : 'hidden'}>
                            <GiftBox latestGift={latestGiftMessage} />
                        </div>
                    </main>
                    
                    {/* Tab Navigation */}
                    <nav className="flex-shrink-0 border-t border-gray-700 bg-gray-800 -mx-2 -mb-2 px-2 pt-2 pb-1">
                        <div className="flex justify-around" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveTab(tab.name)}
                                    className={`flex flex-1 flex-col items-center justify-center p-2 text-xs rounded-md transition-colors ${
                                        activeTab === tab.name 
                                            ? 'text-cyan-400 bg-cyan-900/50' 
                                            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                    }`}
                                >
                                    <div className="w-6 h-6 mb-0.5">
                                        {tab.icon}
                                    </div>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </nav>
                </div>
                
                <MusicPlayer />

            </div>
        </div>
    );
};

export default App;