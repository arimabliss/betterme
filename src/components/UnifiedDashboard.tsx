/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  Flame, 
  TrendingUp, 
  Activity, 
  Brain, 
  Award, 
  Clock, 
  Zap, 
  CheckCircle2, 
  ShieldAlert,
  ChevronRight,
  Info,
  LayoutDashboard
} from 'lucide-react';
import { AppState, Habit, HabitCompletion } from '../types';
import { formatLocalDate } from '../utils/date';

interface UnifiedDashboardProps {
  state: AppState;
  onSetSection: (section: string) => void;
  todayStr: string;
}

const QUOTES = [
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "Consistency compounds into greatness. What you do today matters most.", author: "Unknown" },
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
  { text: "The first and best victory is to conquer self.", author: "Plato" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" }
];

export const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({ state, onSetSection, todayStr }) => {
  
  // Discipline Score
  const disciplineScore = useMemo(() => {
    let score = 0;
    
    // Habits completed today
    const habitsToday = Object.keys(state.habits).filter(k => k.startsWith(todayStr)).length;
    const totalHabits = state.habitDefs.length;
    if (totalHabits > 0) {
      score += Math.round((habitsToday / totalHabits) * 40); // Max 40 pts
    }
    
    // Workouts completed in the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const gymCompletions = state.gymWorkouts.filter(w => {
      const wDate = new Date(w.date);
      return wDate >= oneWeekAgo && w.exercises.some(e => e.sets.some(s => s.done));
    }).length;
    score += Math.min(30, gymCompletions * 10); // Max 30 pts (3 workouts)

    // Study minutes today
    const studyToday = state.studySessions
      .filter(s => s.date === todayStr)
      .reduce((sum, s) => sum + s.duration, 0);
    const studyRatio = Math.min(1.0, studyToday / (state.settings.dailyStudyGoalMinutes || 120));
    score += Math.round(studyRatio * 30); // Max 30 pts
    
    return Math.min(100, Math.max(0, score));
  }, [state, todayStr]);

  // Focus Score
  const focusScore = useMemo(() => {
    const studyToday = state.studySessions
      .filter(s => s.date === todayStr)
      .reduce((sum, s) => sum + s.duration, 0);
    const completedTasksRatio = () => {
      const tasksToday = state.plannerTasks.filter(t => t.date === todayStr);
      if (tasksToday.length === 0) return 1.0;
      return tasksToday.filter(t => t.done).length / tasksToday.length;
    };
    
    const studyScale = Math.min(1.0, studyToday / 180); // 3 hours = 100% study score component
    const taskScale = completedTasksRatio();
    
    return Math.round((studyScale * 60) + (taskScale * 40));
  }, [state, todayStr]);

  // Dopamine Control Score
  const dopamineScore = useMemo(() => {
    // Avoid short term triggers: detox streak + no-trigger habits
    let detoxBonus = Math.min(40, (state.detoxDays || 0) * 8);
    let detoxDoneToday = state.detoxHistory.includes(todayStr) ? 20 : 0;
    
    // Check if any negative habit (marked as 'no social', 'no trigger') has been checked done
    const negativeHabitsChecked = state.habitDefs
      .filter(h => h.name.toLowerCase().includes('no ') || h.name.toLowerCase().includes('stop') || h.name.toLowerCase().includes('detox'))
      .every(h => {
        const key = `${todayStr}_${h.id}`;
        return state.habits[key] === true;
      });

    let habitsBonus = negativeHabitsChecked ? 40 : 15;
    return Math.min(100, detoxBonus + detoxDoneToday + habitsBonus);
  }, [state, todayStr]);

  // Overall Streak
  const overallStreak = useMemo(() => {
    let streak = 0;
    const d = new Date();
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(d);
      checkDate.setDate(d.getDate() - i);
      const dateStr = formatLocalDate(checkDate);
      
      let activeOnDay = false;
      
      // Any habit done?
      const habitCount = Object.keys(state.habits).filter(k => k.startsWith(dateStr)).length;
      if (habitCount > 0) activeOnDay = true;
      
      // Any gym session with completed sets?
      const hasGym = state.gymWorkouts.some(w => w.date === dateStr && w.exercises.some(e => e.sets.some(s => s.done)));
      if (hasGym) activeOnDay = true;
      
      // Any study sessions?
      const hasStudy = state.studySessions.some(s => s.date === dateStr && s.duration > 0);
      if (hasStudy) activeOnDay = true;
      
      // Any customized planner task done?
      const hasPlanner = state.plannerTasks.some(t => t.date === dateStr && t.done);
      if (hasPlanner) activeOnDay = true;

      // Detox checked?
      if (state.detoxHistory.includes(dateStr)) activeOnDay = true;

      if (activeOnDay) {
        streak++;
      } else {
        // If not active on "today" (first check), streak might be preserved if they were active yesterday
        if (i === 0) {
          continue; // Allow today to be unlogged yet
        }
        break;
      }
    }
    return streak;
  }, [state, todayStr]);

  // Daily Quote logic (using a hash of the date string to keep it constant throughout the day)
  const quote = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < todayStr.length; i++) {
       hash = todayStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % QUOTES.length;
    return QUOTES[idx];
  }, [todayStr]);

  // Weekly Habits Completion chart calculation
  const weeklyData = useMemo(() => {
    const data = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const d = new Date();
    d.setDate(d.getDate() - d.getDay()); // Start of this week (Sunday)
    
    for (let i = 0; i < 7; i++) {
      const current = new Date(d);
      current.setDate(d.getDate() + i);
      const cStr = formatLocalDate(current);
      const completed = Object.keys(state.habits).filter(k => k.startsWith(cStr)).length;
      data.push({
        label: weekdays[i],
        count: completed,
        date: cStr
      });
    }
    return data;
  }, [state.habits]);

  // Max value in weekly habits to auto-scale SVG chart
  const maxWeeklyCount = useMemo(() => {
    const max = Math.max(...weeklyData.map(d => d.count));
    return max === 0 ? 5 : max + 1;
  }, [weeklyData]);

  // Last 28 days for Heatmap matrix
  const heatmapData = useMemo(() => {
    const list = [];
    const d = new Date();
    d.setDate(d.getDate() - 27); // Last 28 days
    
    for (let i = 0; i < 28; i++) {
      const curr = new Date(d);
      curr.setDate(d.getDate() + i);
      const cStr = formatLocalDate(curr);
      
      const habitCount = Object.keys(state.habits).filter(k => k.startsWith(cStr)).length;
      const gymWorkout = state.gymWorkouts.find(w => w.date === cStr);
      const gymExerciseCount = gymWorkout ? gymWorkout.exercises.length : 0;
      const studyMins = state.studySessions.filter(s => s.date === cStr).reduce((a, b) => a + b.duration, 0);
      
      const totalScore = habitCount * 2 + gymExerciseCount * 3 + Math.min(10, Math.floor(studyMins / 30));
      let level = 0;
      if (totalScore > 0 && totalScore <= 3) level = 1;
      else if (totalScore > 3 && totalScore <= 7) level = 2;
      else if (totalScore > 7 && totalScore <= 12) level = 3;
      else if (totalScore > 12) level = 4;
      
      list.push({ date: cStr, count: totalScore, level });
    }
    return list;
  }, [state.habits, state.gymWorkouts, state.studySessions]);

  // Today progress components
  const gymDoneToday = useMemo(() => {
    const todayWorkout = state.gymWorkouts.find(w => w.date === todayStr);
    if (!todayWorkout) return 0;
    const totalSets = todayWorkout.exercises.reduce((sum, e) => sum + e.sets.length, 0);
    const doneSets = todayWorkout.exercises.reduce((sum, e) => sum + e.sets.filter(s => s.done).length, 0);
    if (totalSets === 0) return 0;
    return Math.round((doneSets / totalSets) * 100);
  }, [state.gymWorkouts, todayStr]);

  const studyMinsToday = useMemo(() => {
    return state.studySessions
      .filter(s => s.date === todayStr)
      .reduce((sum, s) => sum + s.duration, 0);
  }, [state.studySessions, todayStr]);

  const habitsDoneCount = useMemo(() => {
    return Object.keys(state.habits).filter(k => k.startsWith(todayStr)).length;
  }, [state.habits, todayStr]);

  const circularProgress = (pct: number, colorClass: string, trackColor: string) => {
    const radius = 35;
    const circum = 2 * Math.PI * radius;
    const strokeDashoffset = circum - (Math.min(100, Math.max(0, pct)) / 100) * circum;
    return (
      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 80 80">
        <circle 
          cx="40" 
          cy="40" 
          r={radius} 
          className={trackColor} 
          strokeWidth="6" 
          fill="none" 
        />
        <circle 
          cx="40" 
          cy="40" 
          r={radius} 
          className={`${colorClass} transition-all duration-700 ease-out-back`} 
          strokeWidth="6" 
          fill="none" 
          strokeDasharray={circum}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header section with human-friendly display */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black font-display tracking-tight text-white flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-pink-500 text-glow-pink" />
            <span className="text-gradient">BetterMe Dashboard</span>
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Welcome back, <span className="text-white font-semibold">{state.settings.userName || 'Champion'}</span>. Lock in today and level up.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-950/40 border border-zinc-800/50 px-4 py-2 rounded-2xl">
          <Clock className="w-4 h-4 text-violet-400" />
          <span className="font-mono text-xs text-zinc-300 font-semibold uppercase tracking-wider">
            {new Date(todayStr).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Main stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Discipline score */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute right-3 top-3 p-2 bg-pink-500/10 rounded-xl">
            <Zap className="w-5 h-5 text-pink-400 text-glow-pink" />
          </div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block font-display">Discipline Rating</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-black font-mono text-zinc-100">{disciplineScore}</span>
            <span className="text-zinc-500 text-xs font-semibold">/100</span>
          </div>
          <div className="w-full bg-zinc-800/50 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full transition-all duration-1000"
              style={{ width: `${disciplineScore}%` }}
            />
          </div>
          <span className="text-[10px] text-zinc-400 block mt-2">
            Calculated from habits, gym session efforts & study hours.
          </span>
        </div>

        {/* Card 2: Focus score */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute right-3 top-3 p-2 bg-violet-500/10 rounded-xl">
            <Brain className="w-5 h-5 text-violet-400 text-glow-purple" />
          </div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block font-display">Focus Quotient</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-black font-mono text-zinc-100">{focusScore}</span>
            <span className="text-zinc-500 text-xs font-semibold">/100</span>
          </div>
          <div className="w-full bg-zinc-800/50 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-1000"
              style={{ width: `${focusScore}%` }}
            />
          </div>
          <span className="text-[10px] text-zinc-400 block mt-2">
            Combines planned task completed ratio & deep study minutes.
          </span>
        </div>

        {/* Card 3: Dopamine score */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute right-3 top-3 p-2 bg-indigo-500/10 rounded-xl">
            <Award className="w-5 h-5 text-indigo-400 text-glow-indigo" />
          </div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block font-display">Dopamine Balance</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-black font-mono text-zinc-100">{dopamineScore}</span>
            <span className="text-zinc-500 text-xs font-semibold">%</span>
          </div>
          <div className="w-full bg-zinc-800/50 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-full rounded-full transition-all duration-1000"
              style={{ width: `${dopamineScore}%` }}
            />
          </div>
          <span className="text-[10px] text-zinc-400 block mt-2">
            Social detox efforts, positive habits and trigger blocks.
          </span>
        </div>

        {/* Card 4: Overall Streak */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute right-3 top-3 p-2 bg-amber-500/10 rounded-xl">
            <Flame className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block font-display">Overall Active Streak</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-black font-mono text-amber-400">{overallStreak}</span>
            <span className="text-zinc-400 text-xs font-semibold">days</span>
          </div>
          <p className="text-zinc-400 text-[11px] mt-3">
            {overallStreak >= 3 ? 'You are on a roll! Keep it going.' : 'Log any system activity daily to compound consistency.'}
          </p>
        </div>
      </div>

      {/* Main visualization row: Weekly charts, Heatmap, Ring visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Progress Bar Chart (Clean Responsive SVG implementation) */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-300 font-display flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-pink-400" />
              Weekly Habit Consistency
            </h3>
            <p className="text-zinc-400 text-xs mt-1">Number of healthy habits completed daily across this week.</p>
          </div>
          
          <div className="h-44 w-full mt-4 flex items-end justify-between px-2">
            {weeklyData.map((d, index) => {
              const heightPct = (d.count / maxWeeklyCount) * 100;
              const isToday = d.date === todayStr;
              return (
                <div key={index} className="flex flex-col items-center flex-1 group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 border border-zinc-800 text-white font-mono text-[10px] rounded px-1.5 py-0.5 mb-1 absolute transform -translate-y-12">
                    {d.count} completed
                  </div>
                  {/* Bar */}
                  <div className="w-8 bg-zinc-950/50 rounded-lg h-32 flex items-end relative overflow-hidden">
                    <div 
                      className={`w-full rounded-b-lg rounded-t-sm transition-all duration-700 ease-out-back ${
                        isToday 
                          ? 'bg-gradient-to-t from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.3)]' 
                          : 'bg-gradient-to-t from-violet-600/70 to-pink-500/70'
                      }`}
                      style={{ height: `${Math.max(4, heightPct)}%` }}
                    />
                  </div>
                  <span className={`text-[11px] font-bold mt-2 ${isToday ? 'text-pink-400 font-black' : 'text-zinc-400'}`}>
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Goal Rings container */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-300 font-display flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-400" />
              Today's Targets
            </h3>
            <p className="text-zinc-400 text-xs mt-1">Visualizing progress towards high-priority discipline goals.</p>
          </div>

          <div className="grid grid-cols-3 gap-3 my-4 py-2">
            {/* Gym Ring */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center">
                {circularProgress(gymDoneToday, 'stroke-pink-500 drop-shadow-[0_0_6px_rgba(244,114,182,0.3)]', 'stroke-zinc-800')}
                <div className="absolute font-mono text-xs font-bold text-zinc-200">{gymDoneToday}%</div>
              </div>
              <span className="text-[11px] font-bold text-zinc-300 mt-2">Gym Gym</span>
              <span className="text-[9px] text-zinc-500 mt-0.5">Exercises done</span>
            </div>

            {/* Study Ring */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center">
                {circularProgress(
                  Math.round(Math.min(100, (studyMinsToday / (state.settings.dailyStudyGoalMinutes || 120)) * 100)),
                  'stroke-purple-500 drop-shadow-[0_0_6px_rgba(168,85,247,0.3)]',
                  'stroke-zinc-800'
                )}
                <div className="absolute font-mono text-xs font-bold text-zinc-200">
                  {Math.round(Math.min(100, (studyMinsToday / (state.settings.dailyStudyGoalMinutes || 120)) * 100))}%
                </div>
              </div>
              <span className="text-[11px] font-bold text-zinc-300 mt-2">Study Hrs</span>
              <span className="text-[9px] text-zinc-500 mt-0.5">{studyMinsToday}m logged</span>
            </div>

            {/* Habits Ring */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center">
                {circularProgress(
                  Math.round(state.habitDefs.length > 0 ? (habitsDoneCount / state.habitDefs.length) * 100 : 0),
                  'stroke-indigo-500 drop-shadow-[0_0_6px_rgba(99,102,241,0.3)]',
                  'stroke-zinc-800'
                )}
                <div className="absolute font-mono text-xs font-bold text-zinc-200">
                  {state.habitDefs.length > 0 ? Math.round((habitsDoneCount / state.habitDefs.length) * 100) : 0}%
                </div>
              </div>
              <span className="text-[11px] font-bold text-zinc-300 mt-2">Routine</span>
              <span className="text-[9px] text-zinc-500 mt-0.5">{habitsDoneCount}/{state.habitDefs.length} habits</span>
            </div>
          </div>
          
          <div className="text-[11px] bg-zinc-950/20 border border-zinc-800/40 px-3 py-2 rounded-xl text-center text-zinc-400">
            {disciplineScore >= 80 ? 'Unbelievable effort! Peak performance achieved.' : 'Complete remaining routine habits to secure your goals.'}
          </div>
        </div>

        {/* Heatmap module */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-300 font-display flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Consistency Grid
            </h3>
            <p className="text-zinc-400 text-xs mt-1">Growth heatmap over the past 4 weeks of training and focus.</p>
          </div>

          <div className="mt-4">
            <div className="flex flex-wrap gap-2 justify-center py-2 max-w-[280px] mx-auto">
              {heatmapData.map((d, index) => {
                let colorClass = 'bg-zinc-900 border border-zinc-800/20';
                if (d.level === 1) colorClass = 'bg-pink-950/40 border border-pink-900/30';
                else if (d.level === 2) colorClass = 'bg-pink-800/40 border border-pink-700/50 shadow-[0_0_4px_rgba(244,114,182,0.1)]';
                else if (d.level === 3) colorClass = 'bg-pink-600/60 border border-pink-500/50 shadow-[0_0_6px_rgba(244,114,182,0.2)]';
                else if (d.level === 4) colorClass = 'bg-pink-500 border border-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.3)] animate-pulse';
                
                return (
                  <div 
                    key={index} 
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transiton-all ${colorClass} group relative cursor-pointer`}
                  >
                    <span className="font-mono text-[9px] font-semibold text-zinc-400 group-hover:text-white transition-colors">
                      {d.date.split('-')[2]}
                    </span>
                    {/* Tooltip on hover */}
                    <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[10px] rounded px-2 py-1 absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 z-10 shadow-lg">
                      {d.date}: {d.count} XP
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-3 pt-2 border-t border-zinc-900">
            <span>Past 28 Days</span>
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <span className="w-2.5 h-2.5 rounded bg-zinc-900" />
              <span className="w-2.5 h-2.5 rounded bg-pink-950/40" />
              <span className="w-2.5 h-2.5 rounded bg-pink-800/40" />
              <span className="w-2.5 h-2.5 rounded bg-pink-500" />
              <span>More</span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer inspiration card */}
      <div className="glass-panel rounded-2xl p-6 bg-gradient-glow relative overflow-hidden text-center flex flex-col items-center justify-center">
        {/* Abstract design vector frame decoration to replace emoji elements */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full filter blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full filter blur-2xl pointer-events-none" />
        
        <p className="text-white text-base md:text-lg italic font-display font-medium max-w-2xl text-shadow-pink leading-relaxed">
          "{quote.text}"
        </p>
        <span className="text-zinc-400 text-xs mt-3 uppercase tracking-widest font-mono font-bold">
          — {quote.author}
        </span>
      </div>
    </div>
  );
};
