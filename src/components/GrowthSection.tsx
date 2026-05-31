/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  RotateCcw, 
  Sparkles, 
  TrendingUp, 
  Smile, 
  Frown, 
  Zap, 
  Activity, 
  Info,
  Dice5,
  Dumbbell,
  Sprout
} from 'lucide-react';
import { AppState } from '../types';

interface GrowthSectionProps {
  state: AppState;
  todayStr: string;
  onCheckDetoxDay: (checked: boolean) => void;
  onResetDetox: () => void;
  onLogMood: (mood: string) => void;
}

const GROWTH_DECLARATIONS = [
  "I am fully disciplined, focused on my coordinates, and completely unstoppable.",
  "Every delay is an opportunity to practice stoic patience and intense self-conquest.",
  "I control my lower-level impulses. I am the absolute master of my dopamine systems.",
  "My consistency will compound into extraordinary results over the horizon.",
  "I embrace the silent daily grind because I deeply love the self-mastery it yields.",
  "My future self is looking back, deeply proud of the hard choices I am making today.",
  "I seek to conquer myself first, before attempting to conquer any external obstacles.",
  "Discipline is my ultimate defensive shield against mediocrity and lazy decay."
];

const MOODS = [
  { label: 'Excel', value: 'Excel', color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
  { label: 'Stoic Calm', value: 'Calm', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  { label: 'Fatigued', value: 'Fatigued', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { label: 'Low Impulse', value: 'Low Impulse', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  { label: 'Unfazed', value: 'Unfazed', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' }
];

export const GrowthSection: React.FC<GrowthSectionProps> = ({
  state,
  todayStr,
  onCheckDetoxDay,
  onResetDetox,
  onLogMood
}) => {
  const [affirmationIdx, setAffirmationIdx] = useState(0);

  const cycleAffirmation = () => {
    setAffirmationIdx((prev) => (prev + 1) % GROWTH_DECLARATIONS.length);
  };

  const isDetoxCheckedToday = useMemo(() => {
    return state.detoxHistory.includes(todayStr);
  }, [state.detoxHistory, todayStr]);

  const handleDetoxCheckboxToggle = () => {
    onCheckDetoxDay(!isDetoxCheckedToday);
  };

  const todayMood = state.moodLog[todayStr] || '—';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black font-display tracking-tight text-white flex items-center gap-2">
          <Sprout className="w-8 h-8 text-pink-500 text-glow-pink" />
          <span className="text-gradient">Stoic Self-Conquest</span>
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Tame secondary triggers. Cultivate positive declarations and log focus indicators.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dopamine Detox Module */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-200 font-display flex items-center gap-2 border-b border-zinc-900 pb-3">
              <ShieldAlert className="w-4 h-4 text-pink-400" />
              Dopamine Blocker Tracker
            </h3>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Block instant gratification triggers: no short scrolls, no junk food, no adult triggers, no gaming marathons.
            </p>

            <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl flex items-center justify-between mt-4">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Continuous Streak</span>
                <div className="text-3xl font-black font-mono text-pink-400">{state.detoxDays || 0} Days</div>
              </div>
              
              <button
                onClick={handleDetoxCheckboxToggle}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all ${
                  isDetoxCheckedToday
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/25 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)] font-extrabold'
                    : 'bg-zinc-950/20 border-zinc-800 text-zinc-400 hover:border-pink-500/40 hover:text-pink-400'
                }`}
              >
                {isDetoxCheckedToday ? 'Checked' : 'Commit Today'}
              </button>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-zinc-900 mt-4">
            <button
              onClick={onResetDetox}
              className="px-3 py-1.5 text-[10px] font-bold text-red-400/80 hover:text-red-400 border border-red-500/10 hover:border-red-500/30 bg-red-500/5 hover:bg-red-500/10 rounded-lg uppercase tracking-wide transition-all flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Streak
            </button>
          </div>
        </div>

        {/* Affirmations module */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-200 font-display flex items-center gap-2 border-b border-zinc-900 pb-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Daily Focus Declarations
            </h3>
            
            <div className="py-6 min-h-32 flex flex-col justify-center text-center">
              <p className="text-white text-base font-display italic leading-relaxed text-shadow-pink font-semibold">
                "{GROWTH_DECLARATIONS[affirmationIdx]}"
              </p>
            </div>
          </div>

          <button
            onClick={cycleAffirmation}
            className="w-full py-2 bg-zinc-900 hover:bg-zinc-855 border border-zinc-800 rounded-xl text-[11px] font-bold text-zinc-400 hover:text-white uppercase transition-all flex items-center justify-center gap-1.5 mt-4"
          >
            <Dice5 className="w-4 h-4" /> Cycle Declaration
          </button>
        </div>

        {/* Mood Tracker block */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-200 font-display flex items-center gap-2 border-b border-zinc-900 pb-3">
              <Smile className="w-4 h-4 text-indigo-400" />
              Stoic Internal Temperament
            </h3>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Observe your internal states. Assess emotional noise to prevent impulsive relapse.
            </p>

            <div className="grid grid-cols-2 gap-2 mt-4">
              {MOODS.map((mood) => {
                const isSelected = todayMood === mood.value;
                return (
                  <button
                    key={mood.value}
                    onClick={() => onLogMood(mood.value)}
                    className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all text-center tracking-wide ${
                      isSelected
                        ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/25 border-pink-500 text-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.12)]'
                        : `${mood.color} hover:contrast-125`
                    }`}
                  >
                    {mood.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-900/60 flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider">Today's State:</span>
            <span className="font-mono font-black text-indigo-400 uppercase tracking-widest">{todayMood}</span>
          </div>
        </div>

      </div>

      {/* Philosophy of discipline helper banner */}
      <div className="glass-panel rounded-2xl p-5">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
          <Info className="w-4 h-4 text-pink-400" />
          The Science of Overcoming Instant Gratification
        </h4>
        <p className="text-zinc-400 text-xs leading-relaxed">
          The human brain is optimized for comfort and instant sugar/social notification loops. 
          By participating in a daily <strong className="text-zinc-200">Dopamine Detox</strong> and tracking atomic metrics with absolute honesty, you re-sensitize your receptors to slow-release accomplishments: solving high-priority problems, technical training, and intense physical conditioning. Commit to consistency above all.
        </p>
      </div>
    </div>
  );
};
