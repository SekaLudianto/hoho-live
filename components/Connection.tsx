import React, { useState } from 'react';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface ConnectionProps {
    connect: (uniqueId: string) => void;
    isConnecting: boolean;
    isConnected: boolean;
}

const Connection: React.FC<ConnectionProps> = ({ connect, isConnecting, isConnected }) => {
    const [username, setUsername] = useState('');

    const handleConnect = () => {
        if (username.trim()) {
            const sanitizedUsername = username.trim().replace(/^@/, '');
            connect(sanitizedUsername);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleConnect();
        }
    };

    return (
        <div className="bg-gray-900/50 p-6 rounded-lg">
            <label htmlFor="uniqueIdInput" className="block text-center text-lg font-medium text-white mb-3">
                Masukkan <b>@username</b> pengguna yang sedang LIVE:
            </label>
            <div className="flex flex-col items-center gap-3">
                <input
                    type="text"
                    id="uniqueIdInput"
                    placeholder="@username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isConnecting || isConnected}
                    className="flex-grow w-full bg-gray-700 text-white placeholder-gray-400 border-2 border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 outline-none disabled:opacity-50"
                />
                <button
                    id="connectButton"
                    onClick={handleConnect}
                    disabled={isConnecting || isConnected}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 disabled:bg-gray-500 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isConnecting && <SpinnerIcon />}
                    {isConnecting ? 'Menghubungkan...' : isConnected ? 'Terhubung' : 'Hubungkan'}
                </button>
            </div>
        </div>
    );
};

export default Connection;