import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, ConnectionState, GiftMessage, LikeMessage, RoomUserMessage, SocialMessage } from '../types';

const BACKEND_URL = "https://glorious-adventure-production.up.railway.app";

export const useTikTok = () => {
  const socket = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const [latestChatMessage, setLatestChatMessage] = useState<ChatMessage | null>(null);
  const [latestGiftMessage, setLatestGiftMessage] = useState<GiftMessage | null>(null);
  const [latestLikeMessage, setLatestLikeMessage] = useState<LikeMessage | null>(null);
  const [latestSocialMessage, setLatestSocialMessage] = useState<SocialMessage | null>(null);
  const [roomUsers, setRoomUsers] = useState<RoomUserMessage | null>(null);
  const [followers, setFollowers] = useState<Set<string>>(new Set());
  const [totalDiamonds, setTotalDiamonds] = useState<number>(0);
  
  const lastUniqueIdRef = useRef<string>('');
  const reconnectIntervalRef = useRef<number | null>(null);

  const clearReconnectInterval = useCallback(() => {
    if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current);
        reconnectIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    socket.current = io(BACKEND_URL, {
      transports: ['websocket'] // Prioritaskan koneksi WebSocket
    });

    socket.current.on('connect', () => {
      console.log('Socket connected!');
    });
    
    socket.current.on('disconnect', () => {
        console.warn('Socket disconnected!');
        setIsConnected(false);
        setConnectionState(null);
        setIsConnecting(false);
        clearReconnectInterval();
    });
    
    socket.current.on('streamEnd', () => {
        setIsConnected(false);
        setConnectionState(null);
        setErrorMessage('Stream ended.');
        setIsConnecting(false);
        clearReconnectInterval();
    });

    socket.current.on('tiktokConnected', (state: ConnectionState) => {
      console.log('TikTok Connected:', state);
      clearReconnectInterval();
      setConnectionState(state);
      setIsConnected(true);
      setErrorMessage(null);
      setIsConnecting(false);
      setTotalDiamonds(0);
      setFollowers(new Set());
    });

    socket.current.on('tiktokDisconnected', (reason: string) => {
      console.warn('TikTok Disconnected:', reason);
      setIsConnected(false);
      setConnectionState(null);
      
      clearReconnectInterval();

      // Do not try to reconnect if the stream has permanently ended.
      if (reason?.toLowerCase().includes('stream ended')) {
          setErrorMessage(reason);
          setIsConnecting(false);
          lastUniqueIdRef.current = ''; // Prevent retries
          return;
      }

      if (lastUniqueIdRef.current) {
          const retryMessage = `${reason}. Mencoba lagi...`;
          setErrorMessage(retryMessage);
          setIsConnecting(true); // Keep UI in connecting state

          reconnectIntervalRef.current = window.setInterval(() => {
              if (socket.current) {
                  console.log(`Retrying connection to ${lastUniqueIdRef.current}...`);
                  socket.current.emit('setUniqueId', lastUniqueIdRef.current, { enableExtendedGiftInfo: true });
              }
          }, 5000); // Retry every 5 seconds
      } else {
          setErrorMessage(reason);
          setIsConnecting(false);
      }
    });

    socket.current.on('chat', (msg: ChatMessage) => setLatestChatMessage(msg));
    socket.current.on('gift', (msg: GiftMessage) => {
        if (msg.giftType === 1 && !msg.repeatEnd) {
            // Streak gift, wait for it to end
        } else {
            setTotalDiamonds(prev => prev + msg.diamondCount * msg.repeatCount);
        }
        setLatestGiftMessage(msg);
    });
    socket.current.on('like', (msg: LikeMessage) => setLatestLikeMessage(msg));
    socket.current.on('social', (msg: SocialMessage) => {
      setLatestSocialMessage(msg);
      if (msg.displayType.includes('follow')) {
        setFollowers(prev => new Set(prev).add(msg.uniqueId));
      }
    });
    socket.current.on('roomUser', (msg: RoomUserMessage) => setRoomUsers(msg));

    return () => {
      clearReconnectInterval();
      socket.current?.disconnect();
    };
  }, [clearReconnectInterval]);
  
  const connect = useCallback((uniqueId: string) => {
    if (socket.current && uniqueId) {
      clearReconnectInterval();
      lastUniqueIdRef.current = uniqueId;
      setIsConnecting(true);
      setErrorMessage(null);
      socket.current.emit('setUniqueId', uniqueId, { enableExtendedGiftInfo: true });
    }
  }, [clearReconnectInterval]);

  return {
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
    followers,
    totalDiamonds,
  };
};