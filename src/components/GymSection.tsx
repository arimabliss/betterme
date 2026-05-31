/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Dumbbell, 
  Plus, 
  Trash2, 
  Check, 
  Calendar, 
  PlusCircle, 
  TrendingUp, 
  ListPlus,
  Compass
} from 'lucide-react';
import { GymWorkout, GymExercise, GymSet } from '../types';

interface GymSectionProps {
  gymPlan: { [dayOfWeek: string]: string[] };
  gymWorkouts: GymWorkout[];
  todayStr: string;
  onUpdateGymPlan: (plan: { [dayOfWeek: string]: string[] }) => void;
  onAddExercise: (name: string, muscle: string, setsCount: number, repsCount: number) => void;
  onToggleGymSet: (exerciseIdx: number, setIdx: number) => void;
  onRemoveGymExercise: (exerciseIdx: number) => void;
  onAddCustomSet: (exerciseIdx: number, reps: number, weight?: number) => void;
}

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Triceps', 'Biceps', 'Forearms', 'Core', 'Traps', 'Cardio'];
const RECENT_EXERCISES = [
  { name: 'Incline Dumbbell Press', muscle: 'Chest' },
  { name: 'Weighted Pull Ups', muscle: 'Back' },
  { name: 'Barbell Squat', muscle: 'Legs' },
  { name: 'Overhead Shoulder Press', muscle: 'Shoulders' },
  { name: 'Dumbbell Hammer Curls', muscle: 'Biceps' },
  { name: 'Weighted Dips', muscle: 'Triceps' },
  { name: 'Decline Crunch with Plates', muscle: 'Core' },
  { name: 'Barbell Deadlift', muscle: 'Back' }
];

export const GymSection: React.FC<GymSectionProps> = ({
  gymPlan,
  gymWorkouts,
  todayStr,
  onUpdateGymPlan,
  onAddExercise,
  onToggleGymSet,
  onRemoveGymExercise,
  onAddCustomSet
}) => {
  const [showPlanEditor, setShowPlanEditor] = useState(false);
  const [editedPlan, setEditedPlan] = useState<{ [dayOfWeek: string]: string[] }>(() => ({ ...gymPlan }));
  
  // New exercise state
  const [exName, setExName] = useState('');
  const [exMuscle, setExMuscle] = useState('Chest');
  const [exSets, setExSets] = useState(3);
  const [exReps, setExReps] = useState(10);

  // Custom set addition state
  const [customRepInputs, setCustomRepInputs] = useState<{ [exIdx: number]: number }>({});
  const [customWeightInputs, setCustomWeightInputs] = useState<{ [exIdx: number]: number }>({});

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const getTodayDayName = () => {
    const dayIndex = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const map = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return map[dayIndex];
  };

  const handlePlanSave = () => {
    onUpdateGymPlan(editedPlan);
    setShowPlanEditor(false);
  };

  const toggleMuscleInPlan = (day: string, muscle: string) => {
    const current = editedPlan[day] || [];
    const updated = current.includes(muscle)
      ? current.filter(m => m !== muscle)
      : [...current, muscle];
    setEditedPlan({ ...editedPlan, [day]: updated });
  };

  const handleAddExerciseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exName.trim()) return;
    onAddExercise(exName.trim(), exMuscle, exSets, exReps);
    setExName('');
  };

  const handleAddCustomSetForm = (exIdx: number) => {
    const reps = customRepInputs[exIdx] || 10;
    const weight = customWeightInputs[exIdx] || undefined;
    onAddCustomSet(exIdx, reps, weight);
    // Reset inputs
    setCustomRepInputs({ ...customRepInputs, [exIdx]: 10 });
    setCustomWeightInputs({ ...customWeightInputs, [exIdx]: 0 });
  };

  const textInputStyle = "bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:border-pink-500 focus:outline-none placeholder-zinc-700";

  // Compute daily volume & completions
  const todayWorkout = gymWorkouts.find(w => w.date === todayStr);
  const todayVolAndSets = (() => {
    if (!todayWorkout) return { sets: 0, completed: 0, volume: 0 };
    let sets = 0;
    let completed = 0;
    let volume = 0;
    todayWorkout.exercises.forEach(e => {
      e.sets.forEach(s => {
        sets++;
        if (s.done) {
          completed++;
          volume += s.reps * (s.weight || 0);
        }
      });
    });
    return { sets, completed, volume };
  })();

  const weekdayLabel = (day: string) => {
    return day.substring(0, 3).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black font-display tracking-tight text-white flex items-center gap-2">
            <Dumbbell className="w-8 h-8 text-pink-500 text-glow-pink" />
            <span className="text-gradient">Power Gym Ledger</span>
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Build raw physical endurance. Record every single working set with exact loads.
          </p>
        </div>
        <button
          onClick={() => {
            setEditedPlan({ ...gymPlan });
            setShowPlanEditor(!showPlanEditor);
          }}
          className="btn btn-outline text-xs uppercase tracking-wider font-bold py-2.5 px-4"
        >
          <Compass className="w-4 h-4 text-pink-400" />
          {showPlanEditor ? 'Hide Plan Editor' : 'Configure Weekly Muscle Split'}
        </button>
      </div>

      {/* Plan Editor Panel */}
      {showPlanEditor && (
        <div className="glass-panel rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <h3 className="text-sm font-bold text-zinc-100 font-display">Weekly Split Architecture</h3>
            <span className="text-[10px] text-zinc-500 font-mono">Select target zones for each calendar day</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {daysOfWeek.map(day => (
              <div key={day} className="bg-zinc-950/30 border border-zinc-900 rounded-xl p-3 space-y-2">
                <span className="text-xs font-black uppercase text-zinc-400 block tracking-wider text-center">{day.substring(0,3)}</span>
                <div className="space-y-1 max-h-40 overflow-y-auto no-scrollbar">
                  {MUSCLE_GROUPS.map(muscle => {
                    const isSelected = (editedPlan[day] || []).includes(muscle);
                    return (
                      <button
                        key={muscle}
                        onClick={() => toggleMuscleInPlan(day, muscle)}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all truncate border ${
                          isSelected
                            ? 'bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-pink-400 border-pink-500/40 shadow-[0_0_8px_rgba(236,72,153,0.1)]'
                            : 'border-transparent text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {muscle}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-end pt-2 border-t border-zinc-900">
            <button
              onClick={() => setShowPlanEditor(false)}
              className="px-4 py-2 text-xs font-bold text-zinc-500 uppercase tracking-wider hover:text-zinc-300"
            >
              Cancel
            </button>
            <button
              onClick={handlePlanSave}
              className="px-4 py-2 text-xs font-bold bg-white text-zinc-950 rounded-xl hover:bg-zinc-200 uppercase tracking-wider"
            >
              Store Structure
            </button>
          </div>
        </div>
      )}

      {/* Gym overall target metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Today target muscle layout */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest block font-display">Target Zones Today</h3>
            <div className="text-lg font-bold text-zinc-200 mt-2 capitalize flex items-center gap-2">
              <Calendar className="w-4 h-4 text-pink-400" />
              {getTodayDayName()}'s split:
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(gymPlan[getTodayDayName()] || []).length === 0 ? (
                <span className="text-zinc-600 font-mono text-xs italic">Rest Day. Sleep, recovery, stretching.</span>
              ) : (
                (gymPlan[getTodayDayName()] || []).map((m) => (
                  <span 
                    key={m} 
                    className="px-2.5 py-1 rounded-lg bg-pink-500/15 border border-pink-500/20 text-pink-400 text-[10px] font-bold uppercase tracking-wider shadow-[0_0_8px_rgba(236,72,153,0.05)]"
                  >
                    {m}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-900/60 leading-tight">
            <span className="text-[10px] text-zinc-500 uppercase font-black font-display tracking-widest block mb-2">Weekly Split Schedule</span>
            <div className="flex justify-between gap-1">
              {daysOfWeek.map((day) => {
                const targetCount = (gymPlan[day] || []).length;
                const isToday = day === getTodayDayName();
                return (
                  <div key={day} className={`flex flex-col items-center flex-1 p-1 rounded-lg border ${isToday ? 'border-pink-500/30 bg-pink-500/5' : 'border-transparent'}`}>
                    <span className={`text-[9px] font-bold ${isToday ? 'text-pink-400' : 'text-zinc-500'}`}>{weekdayLabel(day)}</span>
                    <span className={`text-xs font-black mt-1 ${targetCount > 0 ? (isToday ? 'text-pink-400' : 'text-zinc-300') : 'text-zinc-700'}`}>
                      {targetCount > 0 ? targetCount : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Working sets completion */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block font-display">Session Effort</span>
            <div className="text-3xl font-black font-mono mt-1 text-zinc-100">
              {todayVolAndSets.completed} <span className="text-zinc-500 text-xs font-semibold">/ {todayVolAndSets.sets} Sets</span>
            </div>
          </div>
          <div className="w-full bg-zinc-900 h-2 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full transition-all duration-1000"
              style={{ width: `${todayVolAndSets.sets > 0 ? (todayVolAndSets.completed / todayVolAndSets.sets) * 100 : 0}%` }}
            />
          </div>
          <div className="text-[10px] text-zinc-400 mt-2 flex justify-between">
            <span>Repetition metrics logged</span>
            <span className="font-mono font-bold text-pink-400">
              {todayVolAndSets.sets > 0 ? Math.round((todayVolAndSets.completed / todayVolAndSets.sets) * 100) : 0}% done
            </span>
          </div>
        </div>

        {/* Est Volume score */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block font-display">Computed Work Volume</span>
            <div className="text-3xl font-black font-mono mt-1 text-zinc-100">
              {todayVolAndSets.volume} <span className="text-zinc-400 text-xs font-semibold">kg</span>
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 mt-2">
            Estimated load multiplication index: <strong className="text-indigo-400">reps × working load</strong>.
          </p>
        </div>

      </div>

      {/* Today's exercise matrix sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Add Exercise & list logged */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel rounded-2xl p-5">
            <h3 className="text-sm font-bold text-zinc-200 font-display flex items-center gap-2 border-b border-zinc-900 pb-3">
              <Dumbbell className="w-4 h-4 text-pink-400" />
              Active Exercises Logger
            </h3>

            <div className="space-y-4 mt-4">
              {!todayWorkout || todayWorkout.exercises.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-zinc-500 text-xs italic">No exercises added for today's log. Build your training blueprint now.</p>
                </div>
              ) : (
                todayWorkout.exercises.map((ex, exIdx) => (
                  <div key={exIdx} className="border border-zinc-900/80 bg-zinc-950/20 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-black text-white">{ex.name}</h4>
                        <span className="text-[9px] font-bold text-pink-400 uppercase tracking-widest bg-pink-500/10 px-2 py-0.5 rounded-md mt-1 inline-block">
                          {ex.muscle}
                        </span>
                      </div>
                      <button
                        onClick={() => onRemoveGymExercise(exIdx)}
                        className="text-zinc-600 hover:text-red-400 p-1.5 hover:bg-zinc-900 rounded-lg transition-colors"
                        title="Delete exercise"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Working Sets layout */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {ex.sets.map((set, setIdx) => (
                        <div 
                          key={setIdx}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs ${
                            set.done 
                              ? 'bg-zinc-900/60 border-emerald-500/30' 
                              : 'bg-zinc-950/60 border-zinc-900'
                          }`}
                        >
                          <div className="leading-tight">
                            <span className="text-[10px] text-zinc-500 block font-bold">SET {setIdx + 1}</span>
                            <span className="font-mono text-zinc-300 font-semibold">
                              {set.reps} reps {set.weight ? `@ ${set.weight}kg` : ''}
                            </span>
                          </div>
                          <button
                            onClick={() => onToggleGymSet(exIdx, setIdx)}
                            className={`w-5 h-5 rounded-full flex items-center justify-center transition-all border ${
                              set.done 
                                ? 'bg-emerald-500 border-none text-white shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                                : 'border-zinc-700 hover:border-emerald-500 hover:bg-emerald-500/10 text-transparent'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3px]" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Quick custom set adding inline row to improve flexibility */}
                    <div className="pt-2 border-t border-zinc-900/50 flex flex-wrap items-center gap-1">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mr-1">Prepend Working Set</span>
                      <input
                        type="number"
                        value={customRepInputs[exIdx] || 10}
                        onChange={(e) => setCustomRepInputs({ ...customRepInputs, [exIdx]: parseInt(e.target.value) || 0 })}
                        placeholder="reps"
                        className={`${textInputStyle} w-14 py-1 flex-shrink-0 text-center font-mono`}
                        min="1"
                        max="100"
                        title="Reps count"
                      />
                      <span className="text-[9px] text-zinc-600">reps at</span>
                      <input
                        type="number"
                        value={customWeightInputs[exIdx] || 0}
                        onChange={(e) => setCustomWeightInputs({ ...customWeightInputs, [exIdx]: parseFloat(e.target.value) || 0 })}
                        placeholder="kg"
                        className={`${textInputStyle} w-16 py-1 flex-shrink-0 text-center font-mono`}
                        min="0"
                        max="500"
                        title="Weight in kilograms"
                      />
                      <span className="text-[9px] text-zinc-600">kg</span>
                      <button
                        type="button"
                        onClick={() => handleAddCustomSetForm(exIdx)}
                        className="p-1 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 rounded-lg text-[9px] font-bold text-zinc-400 hover:text-white uppercase transition-all flex items-center gap-0.5"
                      >
                        <PlusCircle className="w-3 h-3 text-pink-400" /> Insert Set
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Constructor card */}
          <div className="glass-panel rounded-2xl p-5">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1 mb-3">
              <ListPlus className="w-4 h-4 text-pink-400" /> Assemble Work Log Coordinates
            </h4>
            <form onSubmit={handleAddExerciseSubmit} className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Exercise Title</label>
                <input
                  type="text"
                  value={exName}
                  onChange={(e) => setExName(e.target.value)}
                  placeholder="e.g. Incline Bench Press"
                  className={`${textInputStyle} w-full py-2`}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Muscle Category</label>
                <select
                  value={exMuscle}
                  onChange={(e) => setExMuscle(e.target.value)}
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 font-semibold focus:border-pink-500 focus:outline-none"
                >
                  {MUSCLE_GROUPS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Pre-Sets</label>
                <input
                  type="number"
                  value={exSets}
                  onChange={(e) => setExSets(parseInt(e.target.value) || 3)}
                  className={`${textInputStyle} w-full py-2 text-center font-mono`}
                  min="1"
                  max="12"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 font-bold border border-pink-500/25 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right column: Recent catalog of exercises for quick addition */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-200 font-display flex items-center gap-2 border-b border-zinc-900 pb-3">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              Standard Exercise Catalog
            </h3>
            <p className="text-zinc-500 text-xs mt-1">Tap any item below to copy and configure rapidly in today's log entry sheets.</p>
            
            <div className="space-y-1.5 mt-4">
              {RECENT_EXERCISES.map((ex, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setExName(ex.name);
                    setExMuscle(ex.muscle);
                  }}
                  className="w-full flex items-center justify-between text-left p-2.5 rounded-xl bg-zinc-950/40 border border-zinc-900 hover:border-pink-500/30 transition-all group"
                >
                  <div>
                    <span className="text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors">{ex.name}</span>
                    <span className="text-[9px] font-mono font-bold text-zinc-500 block">{ex.muscle}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-pink-400 transition-colors uppercase tracking-widest font-black">
                    Copy
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-900/60 flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Dumbbell className="w-4 h-4" />
            </div>
            <p className="text-[10px] text-zinc-500 leading-tight">
              Progressive overload compounds: attempt to increase weight or repetitions by <strong className="text-zinc-400">2-5% weekly</strong>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
