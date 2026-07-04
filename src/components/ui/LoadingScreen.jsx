import React, { useEffect, useState } from 'react';
import { useLoadingManager } from '../museum/hooks/useLoadingManager.js';

export default function LoadingScreen({ forceShow = false, room = null }) {
  const { progress, isLoading, loadingText } = useLoadingManager(room);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isLoading || forceShow) {
      setIsVisible(true);
    } else {
      // Tunggu sedikit sebelum menghilangkan komponen dari DOM untuk memutar animasi fade-out
      const timer = setTimeout(() => setIsVisible(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, forceShow]);

  if (!isVisible) return null;

  const showOverlay = isLoading || forceShow;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-500 ease-in-out ${
        showOverlay ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex flex-col items-center max-w-sm w-full px-6">
        {/* Animated Icon/Logo */}
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full border-t-2 border-amber-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-r-2 border-amber-300 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-10 h-10 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 22h20L12 2zm0 3.83L19.17 20H4.83L12 5.83zM11 16h2v2h-2v-2zm0-7h2v5h-2V9z"/>
            </svg>
          </div>
        </div>
        
        {/* Progress Bar Container */}
        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-amber-500 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Text Area */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-white text-xl font-light tracking-widest mb-1">MEMUAT</h2>
          <p className="text-gray-400 text-sm tracking-wider font-light">
            {progress < 100 ? loadingText : 'Mempersiapkan ruangan...'}
          </p>
          <div className="mt-2 text-amber-500 font-mono text-xs">
            {Math.round(progress)}%
          </div>
        </div>
      </div>
    </div>
  );
}
