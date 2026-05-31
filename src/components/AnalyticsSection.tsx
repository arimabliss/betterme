/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  BarChart4, 
  TrendingUp, 
  Award, 
  Brain, 
  Calendar, 
  CheckCircle,
  Clock,
  Dumbbell,
  Shield,
  Activity
} from 'lucide-react';
import { AppState } from '../types';
import { formatLocalDate } from '../utils/date';

interface AnalyticsSectionProps {
  state: AppState;
  todayStr: string;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ state, todayStr }) => {
  
  // Discipline Trend (Last 7 Days)
  const last7DaysData = useMemo(() => {
    const list = [];
    const d = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const c = new Date(d);
      c.setDate(d.getDate() - i);
      const cStr = formatLocalDate(c);
      
      // Calculate discipline score for that day
      let dayScore = 0;
      
      const habitsToday = Object.keys(state.habits).filter(k => k.startsWith(cStr)).length;
      const totalHabits = state.habitDefs.length;
      if (totalHabits > 0) {
        dayScore += Math.round((habitsToday / totalHabits) * 45); // Max 45
      }
      
      const hasGym = state.gymWorkouts.some(w => w.date === cStr && w.exercises.some(e => e.sets.some(s => s.done)));
      if (hasGym) dayScore += 25; // Done workout
      
      const studyMins = state.studySessions.filter(s => s.date === cStr).reduce((a, b) => a + b.duration, 0);
      dayScore += Math.min(30, Math.round((studyMins / 120) * 30)); // Max 30
      
      list.push({
        date: cStr,
        label: c.toLocaleDateString(undefined, { weekday: 'short' }),
        score: Math.min(100, Math.max(0, dayScore))
      });
    }
    return list;
  }, [state]);

  // Overall performance summaries
  const statsSummary = useMemo(() => {
    const totalHabitsChecked = Object.keys(state.habits).length;
    const totalGymWorkoutsChecked = state.gymWorkouts.filter(w => w.exercises.some(e => e.sets.some(s => s.done))).length;
    const totalStudyMins = state.studySessions.reduce((a, b) => a + b.duration, 0);
    const averageReflectionSatisfaction = (() => {
      if (state.reflections.length === 0) return 0;
      const sum = state.reflections.reduce((a, b) => a + b.rating, 0);
      return Math.round((sum / state.reflections.length) * 10) / 10;
    })();

    return {
      totalHabitsChecked,
      totalGymWorkoutsChecked,
      totalStudyMins,
      averageReflectionSatisfaction
    };
  }, [state]);

  // Max value in last 7 days chart
  const maxScoreValue = useMemo(() => {
    const max = Math.max(...last7DaysData.map(d => d.score));
    return max === 0 ? 100 : max;
  }, [last7DaysData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black font-display tracking-tight text-white flex items-center gap-2">
          <BarChart4 className="w-8 h-8 text-pink-500 text-glow-pink" />
          <span className="text-gradient">Discipline Analytics</span>
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Review historical metrics to verify consistency and identify structural trigger windows.
        </p>
      </div>

      {/* Aggregate stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute right-3 top-3 p-2 bg-emerald-500/10 rounded-xl">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block font-display">Lifetime Routine Completion</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-black font-mono text-zinc-100">{statsSummary.totalHabitsChecked}</span>
            <span className="text-zinc-500 text-xs font-semibold">Checks Done</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute right-3 top-3 p-2 bg-pink-500/10 rounded-xl">
            <Dumbbell className="w-5 h-5 text-pink-400 font-glow-pink" />
          </div>
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block font-display">Rigorous Workouts Logs</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-black font-mono text-zinc-100">{statsSummary.totalGymWorkoutsChecked}</span>
            <span className="text-zinc-500 text-xs font-semibold">Sessions Active</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute right-3 top-3 p-2 bg-purple-500/10 rounded-xl">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block font-display">Deep Concentration Sprints</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-black font-mono text-zinc-100">{statsSummary.totalStudyMins}</span>
            <span className="text-zinc-400 text-xs font-semibold">mins studied</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute right-3 top-3 p-2 bg-amber-500/10 rounded-xl">
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block font-display">Discipline Rating Avg</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-black font-mono text-zinc-100">{statsSummary.averageReflectionSatisfaction}</span>
            <span className="text-zinc-500 text-xs font-semibold">/ 5.0</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Responsive SVG Area Chart for Last 7 days discipline scores */}
        <div className="glass-panel rounded-2xl p-5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-200 font-display flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-pink-400" />
              7-Day Discipline Score Velocity
            </h3>
            <p className="text-zinc-500 text-xs">A comprehensive score merging healthy habit, workout, and study variables.</p>
          </div>

          <div className="h-60 mt-6 w-full flex items-end">
            <svg viewBox="0 0 500 180" className="w-full h-full text-pink-500">
              <defs>
                <linearGradient id="disciplGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0.00"/>
                </linearGradient>
              </defs>
              
              {/* Horizontal Help lines */}
              <line x1="0" y1="45" x2="500" y2="45" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
              <line x1="0" y1="135" x2="500" y2="135" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />

              {/* Area path coordinates calculation */}
              {(() => {
                const points = last7DaysData.map((d, i) => {
                  const x = (i / 6) * 440 + 30;
                  const y = 160 - (d.score / 100) * 140; 
                  return { x, y, score: d.score, label: d.label };
                });

                if (points.length === 0) return null;
                const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                const fillPathD = `${pathD} L ${points[points.length - 1].x} 160 L ${points[0].x} 160 Z`;

                return (
                  <>
                    {/* Fill */}
                    <path d={fillPathD} fill="url(#disciplGradient)" />
                    
                    {/* Stroke */}
                    <path d={pathD} fill="none" stroke="url(#gradPinkPurple)" strokeWidth="3" strokeLinecap="round" />
                    
                    {/* Nodes & Labels */}
                    {points.map((p, idx) => (
                      <g key={idx}>
                        <circle cx={p.x} cy={p.y} r="4" fill="#04040a" stroke="#f472b6" strokeWidth="2.5" />
                        <text x={p.x} y={p.y - 10} className="font-mono text-[9px] font-bold fill-zinc-300" textAnchor="middle">{p.score}</text>
                        <text x={p.x} y="176" className="font-display font-medium text-[9px] fill-zinc-500" textAnchor="middle">{p.label}</text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Core breakdown percentages panel */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-200 font-display flex items-center gap-2 border-b border-zinc-900 pb-3">
              <Activity className="w-4 h-4 text-purple-400" />
              Target Variables breakdown
            </h3>
            <p className="text-zinc-500 text-xs">Verifying consistency relative to required self-growth structures.</p>

            <div className="space-y-4 pt-2">
              {/* Routine habits percentage */}
              <div className="space-y-1">
                <div className="flex justify-between items-baseline text-xs font-semibold">
                  <span className="text-zinc-400">Atomic Habits Target</span>
                  <span className="font-mono text-zinc-200">{state.habitDefs.length > 0 ? 'Consistent' : 'Not configured'}</span>
                </div>
                <div className="w-full bg-zinc-950/60 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full transition-all duration-1000"
                    style={{ width: `${state.habitDefs.length > 0 ? 85 : 0}%` }}
                  />
                </div>
              </div>

              {/* Study goal percentage */}
              <div className="space-y-1">
                <div className="flex justify-between items-baseline text-xs font-semibold">
                  <span className="text-zinc-400">Knowledge Deep Training</span>
                  <span className="font-mono text-zinc-200">
                    {Math.round(Math.min(100, (statsSummary.totalStudyMins / 3600) * 100))}% toward 60hrs
                  </span>
                </div>
                <div className="w-full bg-zinc-950/60 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-purple-500 h-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (statsSummary.totalStudyMins / 3600) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Weight workout percentage */}
              <div className="space-y-1">
                <div className="flex justify-between items-baseline text-xs font-semibold">
                  <span className="text-zinc-400">Physical Load Tonnage</span>
                  <span className="font-mono text-zinc-200">{statsSummary.totalGymWorkoutsChecked} logged</span>
                </div>
                <div className="w-full bg-zinc-950/60 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-pink-500 h-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, statsSummary.totalGymWorkoutsChecked * 8)}%` }}
                  />
                </div>
              </div>

              {/* Habit definitions ratio */}
              <div className="text-[11px] text-zinc-500 leading-tight bg-zinc-950/40 p-3 rounded-xl border border-zinc-900 flex gap-2">
                <Shield className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                <span>
                  Compound consistency represents daily efforts across every system coordinate. Avoid single-day lapses to prevent trigger decay.
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
