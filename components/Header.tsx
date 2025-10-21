import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="text-center border-b border-gray-700 pb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white">KATLA LIVE 🇮🇩</h1>
            <p className="text-sm text-gray-400 mt-2">
                Game Tebak Kata dari TikTok LIVE!
            </p>
        </header>
    );
};

export default Header;