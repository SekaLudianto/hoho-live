import React, { useState, useEffect, useRef } from 'react';
import { GiftMessage } from '../types';

interface GiftBoxProps {
    latestGift: GiftMessage | null;
}

const GiftBox: React.FC<GiftBoxProps> = ({ latestGift }) => {
    const [gifts, setGifts] = useState<GiftMessage[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (latestGift) {
            setGifts(prev => {
                const newGifts = [latestGift, ...prev];
                return newGifts.slice(0, 50);
            });
        }
    }, [latestGift]);

    // Auto-scrolling to bottom is removed to show new gifts at the top.
    
    const generateUsernameLink = (data: GiftMessage) => {
        return <a className="text-cyan-400 hover:underline" href={`https://www.tiktok.com/@${data.uniqueId}`} target="_blank" rel="noopener noreferrer">{data.nickname}</a>;
    };

    return (
        <div className="bg-gray-700/50 rounded-lg p-4 flex flex-col h-full">
            <h3 className="text-lg font-bold text-center text-white mb-3">Hadiah</h3>
            <div className="flex-grow overflow-y-auto pr-2 space-y-2" ref={containerRef}>
                {gifts.map((gift, index) => (
                    <div key={index} className="bg-gray-800/50 p-2 rounded-lg flex items-start text-sm">
                        <img className="w-8 h-8 rounded-full mr-3" src={gift.profilePictureUrl} alt={gift.nickname} />
                        <div className="flex-1">
                            <b>{generateUsernameLink(gift)}</b> mengirim {gift.describe}
                            <div className="flex items-center mt-1 bg-gray-700/50 p-1 rounded">
                                <img className="w-10 h-10 mr-2" src={gift.giftPictureUrl} alt={gift.giftName} />
                                <div>
                                    <div className="font-semibold">{gift.giftName}</div>
                                    <div>
                                        <span className="font-bold text-yellow-400">{(gift.diamondCount * gift.repeatCount).toLocaleString()}</span> Diamonds
                                        {gift.repeatCount > 1 && <span className="ml-2 text-gray-400">x{gift.repeatCount}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GiftBox;
