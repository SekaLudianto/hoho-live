import React from 'react';

export const PlayIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zM6.39 8.182a.75.75 0 011.11-.634l4.25 2.5a.75.75 0 010 1.268l-4.25 2.5a.75.75 0 01-1.11-.634V8.182z" clipRule="evenodd" />
  </svg>
);

export const PauseIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zM8.25 6.25a.75.75 0 00-1.5 0v7.5a.75.75 0 001.5 0v-7.5zm5.25.75a.75.75 0 01-1.5 0v6a.75.75 0 011.5 0v-6z" clipRule="evenodd" />
  </svg>
);

export const NextIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

export const PrevIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 19.5L.75 12l7.5-7.5" />
  </svg>
);

export const MusicIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V7.5A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.75m0 0l3 3m0 0l3-3m-3 3v6.75m1.5-6.75h-3" />
  </svg>
);

export const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
