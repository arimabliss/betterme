/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Calendar, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  Lightbulb,
  CheckSquare
} from 'lucide-react';
import { Habit, HabitCompletion, HabitStreak } from '../types';

interface HabitsSectionProps {
  habitDefs: Habit[];
  habits: HabitCompletion;
  habitStreaks: HabitStreak;
  todayStr: string;
  onAddHabit: (name: string, category: 'morning' | 'night' | 'daily') => void;
  onToggleHabit: (id: string) => void;
  onDeleteHabit: (id: string) => void;
}

const HABIT_SUGGESTIONS = [
  { name: 'Cold Shower', category: 'morning' as const },
  { name: '10 mins Mindfulness Deep Breath', category: 'morning' as const },
  { name: 'Read 10 Pages of Philosophy', category: 'daily' as const },
  { name: 'No Social Media / News Detox', category: 'daily' as const },
  { name: 'Sufficient Water Intake (3L)', category: 'daily' as const },
  { name: 'Stretch & Workout Mobility', category: 'daily' as const },
  { name: 'Reflection Journal entry', category: 'night' as const },
  { name: '8 Hours Sleep Target', category: 'night' as const }
];

export const HabitsSection: React.FC<HabitsSectionProps> = ({
  habitDefs,
  habits,
  habitStreaks,
  todayStr,
  onAddHabit,
  onToggleHabit,
  onDeleteHabit
}) => {
  const [habitName, setHabitName] = useState('');
  const [category, setCategory] = useState<'morning' | 'night' | 'daily'>('daily');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return;
    onAddHabit(habitName.trim(), category);
    setHabitName('');
    setShowForm(false);
  };

  const getCompletedCount = (cat: 'morning' | 'night' | 'daily') => {
    const list = habitDefs.filter(h => h.category === cat);
    if (list.length === 0) return 0;
    return list.filter(h => habits[`${todayStr}_${h.id}`]).length;
  };

  const renderHabitCard = (h: Habit) => {
    const isCompleted = !!habits[`${todayStr}_${h.id}`];
    const streak = habitStreaks[h.id] || 0;

    return (
      <div 
        key={h.id} 
        className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 border ${
          isCompleted 
            ? 'background bg-zinc-900/60 border-indigo-500/30' 
            : 'glass-panel border-zinc-800/40 hover:border-zinc-700/50'
        }`}
      >
        <button
          onClick={() => onToggleHabit(h.id)}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border-2 ${
            isCompleted 
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 border-none text-white shadow-[0_0_10px_rgba(236,72,153,0.4)]' 
              : 'border-zinc-700 hover:border-pink-500/80 bg-zinc-950/40'
          }`}
        >
          {isCompleted && <Check className="w-4 h-4 stroke-[3px]" />}
        </button>

        <div className="flex-1">
          <span className={`text-sm font-semibold tracking-tight transition-all block ${isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
            {h.name}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-mono font-bold text-pink-400 flex items-center gap-0.5">
              <Sparkles className="w-3 h-3" />
              Streak: {streak} days
            </span>
          </div>
        </div>

        <button
          onClick={() => onDeleteHabit(h.id)}
          className="text-zinc-500 hover:text-red-400 p-1.5 hover:bg-zinc-800/40 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Head section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black font-display tracking-tight text-white flex items-center gap-2">
            <CheckSquare className="w-8 h-8 text-pink-500 text-glow-pink" />
            <span className="text-gradient">Habit Systems</span>
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Establish atomic systems. Control your impulses and build momentum.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary text-xs tracking-wider uppercase font-bold py-2.5 px-4"
        >
          <Plus className="w-4 h-4" />
          Create Habit
        </button>
      </div>

      {/* Creation form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-5 space-y-4 max-w-xl">
          <h3 className="text-sm font-bold text-zinc-300 font-display">Define Habit Coordinates</h3>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Habit Name</label>
              <input
                type="text"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                placeholder="e.g., Read 15 Mins Stoic Quotes"
                className="w-full bg-zinc-950/80 border border-zinc-800/80 rounded-xl px-4 py-2.5 text-zinc-200 text-sm focus:border-pink-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Schedule Alignment</label>
              <div className="grid grid-cols-3 gap-2">
                {(['morning', 'daily', 'night'] as const).map((catOption) => (
                  <button
                    key={catOption}
                    type="button"
                    onClick={() => setCategory(catOption)}
                    className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all text-center uppercase tracking-wide ${
                      category === catOption
                        ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500 text-pink-400'
                        : 'border-zinc-800/80 text-zinc-500 bg-zinc-950/20 hover:border-zinc-700'
                    }`}
                  >
                    {catOption}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs font-bold text-zinc-500 uppercase tracking-wider hover:text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-white text-zinc-950 rounded-xl hover:bg-zinc-200 uppercase tracking-wider"
            >
              Construct
            </button>
          </div>
        </form>
      )}

      {/* Routine boards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Morning routine */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <h3 className="text-sm font-bold text-zinc-200 font-display flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              Morning Routine
            </h3>
            <span className="text-[10px] uppercase font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded text-amber-400">
              {getCompletedCount('morning')}/{habitDefs.filter(h => h.category === 'morning').length} Done
            </span>
          </div>
          <div className="space-y-2 flex-1">
            {habitDefs.filter(h => h.category === 'morning').length === 0 ? (
              <p className="text-zinc-500 text-xs text-center py-8 italic">No morning rituals configured.</p>
            ) : (
              habitDefs.filter(h => h.category === 'morning').map(renderHabitCard)
            )}
          </div>
        </div>

        {/* Night routine */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <h3 className="text-sm font-bold text-zinc-200 font-display flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              Night Companion
            </h3>
            <span className="text-[10px] uppercase font-mono font-bold bg-indigo-500/10 px-2 py-0.5 rounded text-indigo-400">
              {getCompletedCount('night')}/{habitDefs.filter(h => h.category === 'night').length} Done
            </span>
          </div>
          <div className="space-y-2 flex-1">
            {habitDefs.filter(h => h.category === 'night').length === 0 ? (
              <p className="text-zinc-500 text-xs text-center py-8 italic">No night shutdown routines exists.</p>
            ) : (
              habitDefs.filter(h => h.category === 'night').map(renderHabitCard)
            )}
          </div>
        </div>

        {/* Daily Routine */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <h3 className="text-sm font-bold text-zinc-200 font-display flex items-center gap-2">
              <Calendar className="w-4 h-4 text-pink-400" />
              Continuous Habits
            </h3>
            <span className="text-[10px] uppercase font-mono font-bold bg-pink-500/10 px-2 py-0.5 rounded text-pink-400">
              {getCompletedCount('daily')}/{habitDefs.filter(h => h.category === 'daily').length} Done
            </span>
          </div>
          <div className="space-y-2 flex-1">
            {habitDefs.filter(h => h.category === 'daily').length === 0 ? (
              <p className="text-zinc-500 text-xs text-center py-8 italic">No standard daily habits registered.</p>
            ) : (
              habitDefs.filter(h => h.category === 'daily').map(renderHabitCard)
            )}
          </div>
        </div>

      </div>

      {/* Suggested atomic habits panel to improve UX */}
      <div className="glass-panel rounded-2xl p-5">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          Scientifically Recommended Atomic Systems
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {HABIT_SUGGESTIONS.map((suggestion, index) => {
            const alreadyExists = habitDefs.some(h => h.name.toLowerCase() === suggestion.name.toLowerCase());
            return (
              <div 
                key={index} 
                className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-3 flex flex-col justify-between hover:border-pink-500/25 transition-all"
              >
                <div>
                  <span className="text-xs font-bold text-zinc-300 block leading-tight">{suggestion.name}</span>
                  <span className="text-[9px] text-zinc-500 font-mono block mt-1 uppercase tracking-wider">{suggestion.category}</span>
                </div>
                {!alreadyExists ? (
                  <button
                    onClick={() => onAddHabit(suggestion.name, suggestion.category)}
                    className="mt-3 w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-[10px] font-bold py-1.5 rounded-lg border border-zinc-800/50 transition-all flex items-center justify-center gap-1 uppercase tracking-wider"
                  >
                    <Plus className="w-3 h-3" /> Insert System
                  </button>
                ) : (
                  <p className="text-[10px] text-zinc-600 font-semibold mt-3 text-center uppercase tracking-wider flex items-center justify-center gap-0.5">
                    <CheckSquare className="w-3 h-3 text-pink-400" /> Added
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
