import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayIcon, PauseIcon, NextIcon, PrevIcon, MusicIcon, CloseIcon } from './icons/PlayerIcons';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

const MusicPlayer: React.FC = () => {
  const [isApiReady, setIsApiReady] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackTitle, setCurrentTrackTitle] = useState('Tidak ada musik');
  const [playlistUrl, setPlaylistUrl] = useState('https://www.youtube.com/playlist?list=PLkRkK4q2p31-yERm_I-b_a-8Z-u2nECjU');
  const [showControls, setShowControls] = useState(false);

  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);

  const extractPlaylistId = (url: string): string | null => {
    const regex = /[?&]list=([^#&?]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };
  
  const loadYoutubeApi = useCallback(() => {
    if (window.YT) {
      setIsApiReady(true);
      return;
    }

    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      setIsApiReady(true);
    };
  }, []);

  useEffect(() => {
    loadYoutubeApi();
  }, [loadYoutubeApi]);

  const onPlayerReady = (event: any) => {
    setIsPlayerReady(true);
    const playlistId = extractPlaylistId(playlistUrl);
    if(playlistId) {
        event.target.cuePlaylist({
            list: playlistId,
            listType: 'playlist',
            index: 0,
            startSeconds: 0,
        });
    }
    event.target.setVolume(20);
  };
  
  const onPlayerStateChange = (event: any) => {
    if (!window.YT || !window.YT.PlayerState) {
        return; // Guard clause to prevent errors if API is not fully ready
    }
    
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      const trackData = event.target.getVideoData();
      setCurrentTrackTitle(trackData.title || 'Memuat...');
    } else {
      setIsPlaying(false);
    }

    if (event.data === window.YT.PlayerState.ENDED) {
        // Automatically play next song
        playerRef.current?.nextVideo();
    }
  };

  useEffect(() => {
    if (isApiReady && playerContainerRef.current) {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      
      playerRef.current = new window.YT.Player(playerContainerRef.current, {
        height: '0',
        width: '0',
        playerVars: {
          'playsinline': 1
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    }
    
    return () => {
        if(intervalRef.current) clearInterval(intervalRef.current);
        // Destroy the player instance on component unmount to prevent memory leaks
        if (playerRef.current) {
            playerRef.current.destroy();
        }
    }

  }, [isApiReady]);

  const handlePlayPause = () => {
    if (!isPlayerReady) return;
    if (isPlaying) {
      playerRef.current?.pauseVideo();
    } else {
      playerRef.current?.playVideo();
    }
  };

  const handleNext = () => {
    if (!isPlayerReady) return;
    playerRef.current?.nextVideo();
  };

  const handlePrev = () => {
    if (!isPlayerReady) return;
    playerRef.current?.previousVideo();
  };

  const handleLoadPlaylist = () => {
    const playlistId = extractPlaylistId(playlistUrl);
    if (playerRef.current && playlistId) {
      // Use loadPlaylist which cues and plays automatically.
      playerRef.current.loadPlaylist({
        list: playlistId,
        listType: 'playlist',
      });
      setShowControls(true); // Show controls when a new playlist is loaded
    }
  };

  return (
    <>
      <div ref={playerContainerRef} style={{ position: 'absolute', top: '-9999px', left: '-9999px' }} />
      <div className="fixed bottom-4 right-4 z-50">
          {showControls ? (
            <div className="bg-gray-900/80 backdrop-blur-md border border-cyan-500/30 shadow-lg rounded-lg p-4 w-64 text-white animate-fade-in">
              <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-sm text-cyan-400">Pemutar Musik</h4>
                  <button onClick={() => setShowControls(false)} className="text-gray-400 hover:text-white transition-colors">
                    <CloseIcon />
                  </button>
              </div>

              <div className="flex items-center space-x-2 mb-3">
                <input 
                  type="text"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  placeholder="URL Playlist YouTube"
                  className="bg-gray-700 text-white text-xs rounded px-2 py-1 w-full focus:ring-1 focus:ring-cyan-500 outline-none"
                />
                <button onClick={handleLoadPlaylist} className="bg-cyan-600 text-white rounded px-2 py-1 text-xs hover:bg-cyan-700">Load</button>
              </div>

              <div className="text-center mb-3">
                <p className="text-xs truncate" title={currentTrackTitle}>{currentTrackTitle}</p>
              </div>
              
              <div className="flex justify-center items-center space-x-4">
                <button onClick={handlePrev} disabled={!isPlayerReady} className="disabled:opacity-50 text-gray-300 hover:text-white transition-colors">
                    <PrevIcon />
                </button>
                <button onClick={handlePlayPause} disabled={!isPlayerReady} className="disabled:opacity-50 bg-cyan-600 hover:bg-cyan-700 w-10 h-10 flex items-center justify-center rounded-full">
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
                <button onClick={handleNext} disabled={!isPlayerReady} className="disabled:opacity-50 text-gray-300 hover:text-white transition-colors">
                    <NextIcon />
                </button>
              </div>
            </div>
          ) : (
             <button 
                onClick={() => setShowControls(true)} 
                className="bg-cyan-600 hover:bg-cyan-700 text-white w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-transform transform hover:scale-110"
                title="Buka Pemutar Musik"
              >
               <MusicIcon />
             </button>
          )}
      </div>
    </>
  );
};

export default MusicPlayer;