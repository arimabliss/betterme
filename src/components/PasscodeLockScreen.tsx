/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Delete, Compass, Eye, EyeOff } from 'lucide-react';

import { generateSecureHash } from '../utils/hash';

interface PasscodeLockScreenProps {
  passcodeHash: string;
  userName: string;
  onUnlock: () => void;
}

export const PasscodeLockScreen: React.FC<PasscodeLockScreenProps> = ({
  passcodeHash,
  userName,
  onUnlock
}) => {
  const [pinEntry, setPinEntry] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showPin, setShowPin] = useState(false);

  // Quick vibration for access indicators
  const triggerVibrate = (pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const handleKeyPress = async (val: string) => {
    if (pinEntry.length >= 8) return;
    triggerVibrate(15);
    const updated = pinEntry + val;
    setPinEntry(updated);
    setErrorMessage('');
  };

  const handleDelete = () => {
    triggerVibrate(20);
    setPinEntry(prev => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handleClear = () => {
    triggerVibrate([10, 10]);
    setPinEntry('');
    setErrorMessage('');
  };

  const handleValidate = async () => {
    if (!pinEntry) return;
    setIsAuthenticating(true);
    
    try {
      const hashed = await generateSecureHash(pinEntry);
      if (hashed === passcodeHash) {
        triggerVibrate([40, 30, 40]);
        onUnlock();
      } else {
        triggerVibrate([150, 100, 150]);
        setErrorMessage('🔐 Microsecond mismatch: incorrect ledger credentials.');
        setPinEntry('');
      }
    } catch (e) {
      setErrorMessage('Critical cryptographic authorization layer error.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Listen to keyboard input for ease-of-use
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Enter') {
        handleValidate();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pinEntry]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030308]/95 backdrop-blur-3xl font-sans text-white select-none">
      
      {/* Background radial highlight */}
      <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] rounded-full bg-pink-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm px-6 flex flex-col items-center space-y-8 z-10">
        
        {/* Launcher icon and profile badge */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-purple-500 rounded-2xl shadow-xl border border-pink-400/20 flex items-center justify-center mx-auto shadow-pink-500/5">
            <Compass className="w-7 h-7 text-white animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center justify-center gap-1.5">
              BetterMe <span className="text-pink-400 font-mono text-[10px] bg-pink-500/10 border border-pink-500/20 px-1.5 py-0.5 rounded">Vault Locked</span>
            </h1>
            <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
              Locked ledger terminal for user <span className="text-zinc-300 font-bold">{userName}</span>
            </p>
          </div>
        </div>

        {/* Input indicators display */}
        <div className="w-full space-y-4">
          <div className="relative bg-zinc-950/80 border border-zinc-900 rounded-2xl px-4 py-4 text-center">
            {pinEntry ? (
              <div className="flex items-center justify-center gap-3">
                {pinEntry.split('').map((char, index) => (
                  <span 
                    key={index} 
                    className="w-3.5 h-3.5 rounded-full bg-pink-500 text-glow-pink animate-ping-once inline-block font-mono text-sm leading-none"
                  >
                    {showPin ? char : ''}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-zinc-700 text-xs font-mono select-none">Secure pin required...</span>
            )}

            {/* Eye toggle for passcode entry */}
            {pinEntry && (
              <button 
                onClick={() => setShowPin(!showPin)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                title="Toggle Visibility"
              >
                {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {errorMessage && (
            <p className="text-[10px] font-bold text-red-400 text-center uppercase tracking-wider animate-shake">
              {errorMessage}
            </p>
          )}
        </div>

        {/* Tactile digital key pad matrix */}
        <div className="grid grid-cols-3 gap-3.5 w-full max-w-[280px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(val => (
            <button
              key={val}
              onClick={() => handleKeyPress(val)}
              className="w-16 h-16 rounded-full font-mono text-lg font-bold bg-zinc-950/50 hover:bg-zinc-900 active:bg-pink-500/10 border border-zinc-900/60 hover:border-zinc-800 hover:text-pink-400 active:scale-95 transition-all flex items-center justify-center leading-none"
            >
              {val}
            </button>
          ))}
          
          <button
            onClick={handleClear}
            className="w-16 h-16 rounded-full font-mono text-xs font-bold text-zinc-500 hover:text-zinc-300 hover:bg-zinc-950/20 active:scale-95 transition-all flex items-center justify-center"
          >
            Clear
          </button>

          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 rounded-full font-mono text-lg font-bold bg-zinc-950/50 hover:bg-zinc-900 active:bg-pink-500/10 border border-zinc-900/60 hover:border-zinc-800 hover:text-pink-400 active:scale-95 transition-all flex items-center justify-center leading-none"
          >
            0
          </button>

          <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-full font-mono text-xs font-bold text-zinc-500 hover:text-zinc-300 hover:bg-zinc-950/20 active:scale-95 transition-all flex items-center justify-center"
            title="Delete last key"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>

        {/* Unlock authorization trigger */}
        <button
          onClick={handleValidate}
          disabled={!pinEntry || isAuthenticating}
          className={`w-full py-3.5 rounded-2xl text-xs uppercase tracking-widest font-bold transition-all shadow-lg flex items-center justify-center gap-2 border ${
            !pinEntry || isAuthenticating
              ? 'bg-zinc-950/40 border-zinc-900/80 text-zinc-600 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:brightness-110 active:scale-[0.98] border-pink-400/20 text-white shadow-pink-500/5'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          {isAuthenticating ? 'Decrypting...' : 'Authenticate'}
        </button>

      </div>
    </div>
  );
};
