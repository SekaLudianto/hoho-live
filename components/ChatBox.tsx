import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';

interface ChatBoxProps {
    latestMessage: ChatMessage | null;
}

const ChatBox: React.FC<ChatBoxProps> = ({ latestMessage }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (latestMessage) {
            setMessages(prev => {
                const newMessages = [latestMessage, ...prev];
                // Keep only the first 100 messages (the newest ones)
                return newMessages.slice(0, 100);
            });
        }
    }, [latestMessage]);

    // Auto-scrolling to the bottom is removed to show new messages at the top.
    
    const generateUsernameLink = (data: ChatMessage) => {
        return <a className="text-cyan-400 hover:underline" href={`https://www.tiktok.com/@${data.uniqueId}`} target="_blank" rel="noopener noreferrer">{data.nickname}</a>;
    };

    return (
        <div className="bg-gray-700/50 rounded-lg p-4 flex flex-col h-full">
            <h3 className="text-lg font-bold text-center text-white mb-3">Obrolan Langsung</h3>
            <div className="flex-grow overflow-y-auto pr-2 space-y-3" ref={containerRef}>
                {messages.map((msg, index) => (
                    <div key={index} className="bg-gray-800/50 p-2 rounded-lg flex items-start text-sm">
                        <img className="w-8 h-8 rounded-full mr-3 flex-shrink-0" src={msg.profilePictureUrl} alt={msg.nickname} />
                        <div className="flex-1">
                            <b>{generateUsernameLink(msg)}:</b>
                            <div className="break-all text-white">{msg.comment}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatBox;
