/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ListTodo, 
  Plus, 
  Trash2, 
  Check, 
  AlertTriangle,
  Clock, 
  Sparkles, 
  Heart,
  Save
} from 'lucide-react';
import { PlannerTask, DailyReflection } from '../types';

interface PlannerSectionProps {
  plannerTasks: PlannerTask[];
  reflections: DailyReflection[];
  todayStr: string;
  onAddTask: (task: string, priority: 'High' | 'Medium' | 'Low', time: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onSaveReflection: (text: string, rating: number) => void;
}

export const PlannerSection: React.FC<PlannerSectionProps> = ({
  plannerTasks,
  reflections,
  todayStr,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onSaveReflection
}) => {
  const [taskInput, setTaskInput] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [time, setTime] = useState('09:00');

  // Reflection form states
  const todayRef = reflections.find(r => r.date === todayStr);
  const [refText, setRefText] = useState(todayRef?.text || '');
  const [refRating, setRefRating] = useState(todayRef?.rating || 3);

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    onAddTask(taskInput.trim(), priority, time);
    setTaskInput('');
  };

  const handleSaveReflectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveReflection(refText, refRating);
  };

  const textInputStyle = "bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:border-pink-500 focus:outline-none placeholder-zinc-700";

  // Filter tasks for today
  const todayTasks = plannerTasks
    .filter(t => t.date === todayStr)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h2 className="text-3xl font-black font-display tracking-tight text-white flex items-center gap-2">
          <Clock className="w-8 h-8 text-pink-500 text-glow-pink" />
          <span className="text-gradient">Daily Hour Planner</span>
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Architect your day. Plan specific hour blocks to safeguard your highest priorities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Add/Task details list */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* List display */}
          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
              <h3 className="text-sm font-bold text-zinc-200 font-display flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-pink-400" />
                Today's Schedule block
              </h3>
              <span className="text-[10px] uppercase font-mono font-bold bg-pink-500/10 px-2 py-0.5 rounded text-pink-400">
                {todayTasks.filter(t => t.done).length}/{todayTasks.length} Completed
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto no-scrollbar">
              {todayTasks.length === 0 ? (
                <div className="text-center py-16 text-zinc-600 italic">
                  No tasks scheduled. Map out your time increments to maximize concentration.
                </div>
              ) : (
                todayTasks.map((t) => (
                  <div 
                    key={t.id} 
                    className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all duration-300 ${
                      t.done 
                        ? 'bg-zinc-900/40 border-indigo-500/25 opacity-60' 
                        : 'glass-panel border-zinc-850 bg-zinc-950/20'
                    }`}
                  >
                    <button
                      onClick={() => onToggleTask(t.id)}
                      className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all ${
                        t.done 
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 border-none text-white' 
                          : 'border-zinc-700 hover:border-pink-500 bg-zinc-950/40'
                      }`}
                    >
                      {t.done && <Check className="w-3.5 h-3.5 stroke-[3.5px]" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-pink-400 shrink-0 bg-pink-500/5 border border-pink-500/10 px-1.5 py-0.5 rounded-md">
                          {t.time}
                        </span>
                        <h4 className={`text-xs font-semibold truncate ${t.done ? 'line-through text-zinc-550' : 'text-zinc-200'}`}>
                          {t.task}
                        </h4>
                      </div>
                    </div>

                    <span className={`text-[9px] font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      t.priority === 'High' 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                        : t.priority === 'Medium'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                    }`}>
                      {t.priority}
                    </span>

                    <button
                      onClick={() => onDeleteTask(t.id)}
                      className="text-zinc-600 hover:text-red-400 p-1.5 hover:bg-zinc-900/50 rounded-lg transition-colors ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Form input maker */}
          <div className="glass-panel rounded-2xl p-5">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
              <Sparkles className="w-4 h-4 text-pink-400" /> Construct Task Coordinate
            </h4>
            <form onSubmit={handleSubmitTask} className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Task description</label>
                <input
                  type="text"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  placeholder="e.g. Finish writing UI routing schemas"
                  className={`${textInputStyle} w-full py-2`}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-350 font-semibold focus:border-pink-500 focus:outline-none"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Block Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={`${textInputStyle} w-full py-2 text-center font-mono`}
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 font-bold border border-pink-500/25 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add block
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right column: Reflections logs entry */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
          <form onSubmit={handleSaveReflectionSubmit} className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-200 font-display flex items-center gap-2 border-b border-zinc-900 pb-3">
              <Heart className="w-4 h-4 text-pink-400" />
              Day Reflection Ledger
            </h3>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Consistently evaluate your performance. What variables went well today? What can be optimized tomorrow?
            </p>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Discipline Rating Grid</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRefRating(num)}
                      className={`flex-1 py-1.5 rounded-xl border text-xs font-mono font-black transition-all ${
                        refRating === num
                          ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500 text-pink-400 shadow-[0_0_8px_rgba(236,72,153,0.1)]'
                          : 'border-zinc-850 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">General Observations</label>
                <textarea
                  value={refText}
                  onChange={(e) => setRefText(e.target.value)}
                  placeholder="Record stoic review here... e.g. Studied extensively but got distracted mid-day by YouTube. Tomorrow, blocker on."
                  rows={4}
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-300 focus:border-pink-500 focus:outline-none placeholder-zinc-700 leading-relaxed resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full btn btn-primary text-xs py-3 tracking-widest uppercase font-bold"
            >
              <Save className="w-4 h-4" /> Commit Stoic Review
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-zinc-900/60 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-zinc-500 shrink-0" />
            <p className="text-[10px] text-zinc-500 leading-tight">
              Self-correction is the path to growth. An unexamined day is a wasted training block.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
