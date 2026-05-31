/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Play, 
  Square, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Check, 
  Calendar, 
  Clock, 
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { StudySession, StudyGoal } from '../types';

interface StudySectionProps {
  studySessions: StudySession[];
  studySubjects: string[];
  studyGoals: StudyGoal[];
  todayStr: string;
  onAddStudySubject: (name: string) => void;
  onAddStudyGoal: (name: string) => void;
  onToggleStudyGoal: (id: string) => void;
  onDeleteStudyGoal: (id: string) => void;
  onLogStudySession: (subject: string, durationMinutes: number) => void;
  dailyGoalMinutes: number;
}

export const StudySection: React.FC<StudySectionProps> = ({
  studySessions,
  studySubjects,
  studyGoals,
  todayStr,
  onAddStudySubject,
  onAddStudyGoal,
  onToggleStudyGoal,
  onDeleteStudyGoal,
  onLogStudySession,
  dailyGoalMinutes
}) => {
  const [subjectInput, setSubjectInput] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(studySubjects[0] || 'Philosophy');
  
  // Timer state
  const [isActive, setIsActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(1500); // Default study focus is 25 minutes
  const [presetTime, setPresetTime] = useState(1500); // Remembers preconfigured time
  const [newGoalInput, setNewGoalInput] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (studySubjects.length > 0 && !studySubjects.includes(selectedSubject)) {
      setSelectedSubject(studySubjects[0]);
    }
  }, [studySubjects, selectedSubject]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSessionTime((prev) => {
          if (prev <= 1) {
            handleStopAndLog();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setSessionTime(presetTime);
  };

  const handleStopAndLog = () => {
    setIsActive(false);
    const elapsedSeconds = presetTime - sessionTime;
    const elapsedMinutes = Math.round(elapsedSeconds / 60);

    if (elapsedMinutes >= 1) {
      onLogStudySession(selectedSubject, elapsedMinutes);
      setSessionTime(presetTime);
    } else {
      alert("Study session must last at least 1 minute to be logged.");
      setSessionTime(presetTime);
    }
  };

  const handlePresetSelect = (mins: number) => {
    setIsActive(false);
    setSessionTime(mins * 60);
    setPresetTime(mins * 60);
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectInput.trim()) return;
    onAddStudySubject(subjectInput.trim());
    setSelectedSubject(subjectInput.trim());
    setSubjectInput('');
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalInput.trim()) return;
    onAddStudyGoal(newGoalInput.trim());
    setNewGoalInput('');
  };

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Stats calculation
  const totalStudyToday = studySessions
    .filter((s) => s.date === todayStr)
    .reduce((a, b) => a + b.duration, 0);

  const weeklyAverage = (() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const sessions = studySessions.filter((s) => new Date(s.date) >= oneWeekAgo);
    const total = sessions.reduce((a, b) => a + b.duration, 0);
    return Math.round(total / 7);
  })();

  const sessionCountToday = studySessions.filter((s) => s.date === todayStr).length;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h2 className="text-3xl font-black font-display tracking-tight text-white flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-pink-500 text-glow-pink" />
          <span className="text-gradient">Deep Study Lab</span>
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Lock out notification clutter. Immerse yourself in undivided cognitive effort.
        </p>
      </div>

      {/* High priority study indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block font-display">Study Focus Today</span>
          <div className="text-3xl font-black font-mono mt-1 text-zinc-100">{totalStudyToday} m</div>
          <p className="text-[10px] text-zinc-400 mt-2">
            Goal: <strong className="text-pink-400">{dailyGoalMinutes || 120} mins</strong> daily limit.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block font-display">7-Day Daily Avg</span>
          <div className="text-3xl font-black font-mono mt-1 text-zinc-100">{weeklyAverage} m</div>
          <p className="text-[10px] text-zinc-400 mt-2">Consistency compounds daily.</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block font-display">Completed Blocks</span>
          <div className="text-3xl font-black font-mono mt-1 text-zinc-100">{sessionCountToday}</div>
          <p className="text-[10px] text-zinc-400 mt-2">Recorded study chunks today.</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block font-display">Target Efficiency</span>
          <div className="text-3xl font-black font-mono mt-1 text-zinc-100">
            {dailyGoalMinutes > 0 ? Math.round(Math.min(100, (totalStudyToday / dailyGoalMinutes) * 100)) : 0}%
          </div>
          <p className="text-[10px] text-zinc-400 mt-2">Goal completion multiplier.</p>
        </div>
      </div>

      {/* Modern interactive clock mechanism */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Timer main */}
        <div className="glass-panel rounded-2xl p-6 lg:col-span-2 flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
          
          <div className="flex gap-2 bg-zinc-950/40 p-1.5 rounded-xl border border-zinc-900/50">
            {[15, 25, 50, 90].map((mins) => (
              <button
                key={mins}
                onClick={() => handlePresetSelect(mins)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wide ${
                  presetTime === mins * 60
                    ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 border border-pink-500/30'
                    : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>

          <div className="text-center py-6">
            <div className="text-7xl md:text-8xl font-black font-mono tracking-tight text-gradient select-none drop-shadow-[0_0_24px_rgba(168,85,247,0.15)]">
              {formatTime(sessionTime)}
            </div>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold mt-2 flex items-center justify-center gap-1.5">
              <BookOpen className="w-4 h-4 text-pink-400" />
              Focus block: <strong className="text-zinc-300 uppercase">{selectedSubject}</strong>
            </p>
          </div>

          {/* Core Controls */}
          <div className="flex items-center gap-4">
            {!isActive ? (
              <button
                onClick={handleStart}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white flex items-center justify-center shadow-lg hover:brightness-110 active:scale-95 transition-all text-glow-pink"
              >
                <Play className="w-6 h-6 fill-current stroke-[3px]" />
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="w-16 h-16 rounded-full bg-zinc-900 border-2 border-zinc-800 text-zinc-300 flex items-center justify-center shadow-lg hover:bg-zinc-800 active:scale-95 transition-all"
              >
                <Square className="w-5 h-5 fill-current" />
              </button>
            )}

            <button
              onClick={handleReset}
              className="p-3.5 rounded-xl bg-zinc-950/50 border border-zinc-900/50 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={handleStopAndLog}
              disabled={presetTime === sessionTime}
              className={`px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all border ${
                presetTime === sessionTime
                  ? 'border-zinc-900 text-zinc-600 cursor-not-allowed bg-transparent'
                  : 'border-pink-500/30 text-pink-400 bg-pink-500/10 hover:bg-pink-500/20 shadow-[0_0_15px_rgba(244,114,182,0.1)]'
              }`}
            >
              Log Chunks
            </button>
          </div>

          {/* Subject selection */}
          <div className="w-full pt-4 border-t border-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Select Study Vector</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 text-xs font-semibold uppercase tracking-wider focus:border-purple-500 focus:outline-none"
              >
                {studySubjects.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <form onSubmit={handleAddSubject} className="flex-1 flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Construct New Subject</label>
                <input
                  type="text"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  placeholder="e.g. Data Structures"
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-200 text-xs focus:border-purple-500 focus:outline-none placeholder-zinc-600"
                />
              </div>
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-all flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Study goals checkable list */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-200 font-display flex items-center gap-2 border-b border-zinc-900 pb-3">
              <CheckCircle2 className="w-4 h-4 text-pink-400" />
              Today's Syllabus Focus
            </h3>
            <p className="text-zinc-500 text-xs mt-1">Specific micro-chapters or papers to cover during focus sprints.</p>
            
            <div className="space-y-2 mt-4 max-h-60 overflow-y-auto no-scrollbar">
              {studyGoals.filter(goal => goal.date === todayStr).length === 0 ? (
                <p className="text-zinc-600 text-xs italic text-center py-8">No syllabus goals set for today.</p>
              ) : (
                studyGoals.filter(goal => goal.date === todayStr).map((goal) => (
                  <div 
                    key={goal.id} 
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      goal.done 
                        ? 'bg-zinc-900/40 border-indigo-500/25 opacity-60' 
                        : 'border-zinc-800 bg-zinc-950/20'
                    }`}
                  >
                    <button
                      onClick={() => onToggleStudyGoal(goal.id)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                        goal.done 
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' 
                          : 'border-zinc-600 hover:border-pink-500'
                      }`}
                    >
                      {goal.done && <Check className="w-3 h-3 stroke-[3px]" />}
                    </button>
                    <span className={`text-xs flex-1 truncate ${goal.done ? 'line-through text-zinc-500' : 'text-zinc-300 font-medium'}`}>
                      {goal.name}
                    </span>
                    <button
                      onClick={() => onDeleteStudyGoal(goal.id)}
                      className="text-zinc-600 hover:text-red-400 p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <form onSubmit={handleAddGoal} className="mt-4 pt-3 border-t border-zinc-900 flex gap-2">
            <input
              type="text"
              value={newGoalInput}
              onChange={(e) => setNewGoalInput(e.target.value)}
              placeholder="e.g. Finish Chapter 3 notes"
              className="flex-1 bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:border-pink-500 focus:outline-none placeholder-zinc-600"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 rounded-xl transition-all font-bold text-xs uppercase tracking-wider border border-pink-500/20"
            >
              Add Goal
            </button>
          </form>
        </div>

      </div>

      {/* History logs */}
      <div className="glass-panel rounded-2xl p-5">
        <h3 className="text-sm font-bold text-zinc-300 font-display flex items-center gap-2 border-b border-zinc-900 pb-3">
          <Calendar className="w-4 h-4 text-purple-400" />
          Recent Cognitive Sprints
        </h3>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Vector</th>
                <th className="py-2.5 px-3">Duration Logged</th>
                <th className="py-2.5 px-3">Intensity Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-xs">
              {studySessions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-zinc-600 italic">No study blocks completed yet. Ready to start?</td>
                </tr>
              ) : (
                studySessions.slice(-6).reverse().map((session) => (
                  <tr key={session.id} className="hover:bg-zinc-900/30">
                    <td className="py-3 px-3 text-zinc-400 font-mono">{session.date}</td>
                    <td className="py-3 px-3 font-semibold text-zinc-200 uppercase tracking-wider">{session.subject}</td>
                    <td className="py-3 px-3 font-mono text-pink-400 font-bold">{session.duration} minutes</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono text-[9px] font-bold">
                        100% Focused
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
