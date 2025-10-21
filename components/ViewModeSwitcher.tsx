import React from 'react';
import { MobileIcon, TabletIcon, DesktopIcon } from './icons/DeviceIcons';

type ViewMode = 'mobile' | 'tablet' | 'desktop';

interface ViewModeSwitcherProps {
  currentMode: ViewMode;
  setMode: (mode: ViewMode) => void;
}

const modes: { name: ViewMode; icon: React.ReactNode }[] = [
  { name: 'mobile', icon: <MobileIcon /> },
  { name: 'tablet', icon: <TabletIcon /> },
  { name: 'desktop', icon: <DesktopIcon /> },
];

const ViewModeSwitcher: React.FC<ViewModeSwitcherProps> = ({ currentMode, setMode }) => {
  return (
    <div className="fixed top-4 right-4 z-50 bg-gray-700/50 backdrop-blur-sm p-1 rounded-lg shadow-lg flex items-center space-x-1">
      {modes.map((mode) => (
        <button
          key={mode.name}
          onClick={() => setMode(mode.name)}
          title={`Tampilan ${mode.name.charAt(0).toUpperCase() + mode.name.slice(1)}`}
          className={`p-2 rounded-md transition-colors duration-200 ${
            currentMode === mode.name
              ? 'bg-cyan-600 text-white shadow'
              : 'text-gray-300 hover:bg-gray-600/70 hover:text-white'
          }`}
        >
          {mode.icon}
        </button>
      ))}
    </div>
  );
};

export default ViewModeSwitcher;
