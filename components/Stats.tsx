import React, { useState, useEffect } from 'react';
import { ConnectionState, LikeMessage, RoomUserMessage } from '../types';

interface StatsProps {
    isConnected: boolean;
    connectionState: ConnectionState | null;
    errorMessage: string | null;
    roomUsers: RoomUserMessage | null;
    latestLike: LikeMessage | null;
    totalDiamonds: number;
}

const Stats: React.FC<StatsProps> = ({ isConnected, connectionState, errorMessage, roomUsers, latestLike, totalDiamonds }) => {
    
    const [viewerCount, setViewerCount] = useState(0);
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {
        if(roomUsers?.viewerCount){
            setViewerCount(roomUsers.viewerCount);
        }
    }, [roomUsers]);

    useEffect(() => {
        if(latestLike?.totalLikeCount) {
            setLikeCount(latestLike.totalLikeCount);
        }
    }, [latestLike]);

    useEffect(() => {
        if (!isConnected) {
            setViewerCount(0);
            setLikeCount(0);
        }
    }, [isConnected]);

    const formatNumber = (num: number) => new Intl.NumberFormat('id-ID').format(num);

    return (
        <div className="grid grid-cols-1 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4 min-h-[100px] flex flex-col justify-center items-center">
                <h3 className="font-semibold text-white mb-2 text-center">Status Koneksi</h3>
                <pre className="text-xs text-center whitespace-pre-wrap">
                    {isConnected && connectionState
                        ? <span className="text-green-400">Terhubung ke Room ID {connectionState.roomId}</span>
                        : errorMessage
                        ? <span className="text-red-400">{errorMessage}</span>
                        : <span className="text-gray-400">Belum terhubung.</span>}
                </pre>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4 min-h-[100px] flex flex-col justify-center items-center">
                <h3 className="font-semibold text-white mb-2 text-center">Statistik Room</h3>
                <div className="text-sm text-gray-300 text-center space-x-4">
                    <span>Penonton: <b className="text-white">{formatNumber(viewerCount)}</b></span>
                    <span>Suka: <b className="text-white">{formatNumber(likeCount)}</b></span>
                    <span>Diamond: <b className="text-white">{formatNumber(totalDiamonds)}</b></span>
                </div>
            </div>
        </div>
    );
};

export default Stats;