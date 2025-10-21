import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out" style={{opacity: isOpen ? 1 : 0}}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 ease-in-out" style={{transform: isOpen ? 'scale(1)' : 'scale(0.95)'}}>
                <div className="p-6">
                    <h3 className="text-2xl font-bold text-center text-white mb-4">{title}</h3>
                    <div className="text-gray-300 space-y-3">{children}</div>
                </div>
                <div className="bg-gray-900/50 px-6 py-3 text-right rounded-b-lg">
                    <button onClick={onClose} className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-5 rounded-md">
                        Game Baru
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
