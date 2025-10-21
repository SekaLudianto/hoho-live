import React from 'react';

const InfoMarquee: React.FC = () => {
    return (
        <div className="bg-gray-900/50 rounded-lg p-2 overflow-hidden whitespace-nowrap">
            <style>
                {`
                .marquee-text {
                    display: inline-block;
                    padding-left: 100%;
                    animation: marquee 15s linear infinite;
                }
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-100%); }
                }
                `}
            </style>
            <div className="marquee-text text-sm text-yellow-300">
                <span className="mx-4">🎁 <b>10 Koin</b> = Buka Kata & Menang!</span>
                <span className="mx-4">|</span>
                <span className="mx-4">🎁 <b>30+ Koin</b> = Langsung Menang & Jadi Sorotan!</span>
            </div>
        </div>
    );
};

export default InfoMarquee;