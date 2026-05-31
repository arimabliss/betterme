/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  BookOpen, 
  Dumbbell, 
  Calendar as CalendarIcon, 
  Clock, 
  Sprout, 
  BarChart2, 
  Settings as SettingsIcon,
  Flame,
  Menu,
  X,
  Sun,
  Moon,
  Compass
} from 'lucide-react';

import { AppState, Habit, CalendarEvent, DailyReflection, PlannerTask, StudySession, GymWorkout } from './types';
import { UnifiedDashboard } from './components/UnifiedDashboard';
import { HabitsSection } from './components/HabitsSection';
import { StudySection } from './components/StudySection';
import { GymSection } from './components/GymSection';
import { CalendarSection } from './components/CalendarSection';
import { PlannerSection } from './components/PlannerSection';
import { GrowthSection } from './components/GrowthSection';
import { AnalyticsSection } from './components/AnalyticsSection';
import { SettingsSection } from './components/SettingsSection';
import { PasscodeLockScreen } from './components/PasscodeLockScreen';
import { formatLocalDate } from './utils/date';
import { Lock } from 'lucide-react';

const STORAGE_KEY = 'betterme_universe_growth_ledger';

const INITIAL_STATE: AppState = {
  habits: {},
  habitDefs: [], // Empty initially per "Build your own habits - nothing preloaded"
  habitStreaks: {},
  studySessions: [],
  studySubjects: ['Philosophy', 'Systems Design', 'Data Math', 'Stoicism'],
  studyGoals: [],
  gymPlan: {
    monday: ['Chest', 'Triceps'],
    tuesday: ['Back', 'Biceps'],
    wednesday: ['Shoulders', 'Core'],
    thursday: ['Legs'],
    friday: ['Biceps', 'Triceps'],
    saturday: ['Cardio', 'Stretch'],
    sunday: []
  },
  gymWorkouts: [],
  plannerTasks: [],
  calendarEvents: [],
  reflections: [],
  moodLog: {},
  detoxDays: 0,
  detoxHistory: [],
  settings: {
    theme: 'dark',
    dailyStudyGoalMinutes: 120,
    userName: 'Champion',
    focusSound: '120'
  },
  lastActiveDate: new Date().toDateString()
};

export default function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Timezone-localized Date coordinate anchor
  const todayStr = formatLocalDate();

  // Screenlock for passcode integration
  const [isScreenLocked, setIsScreenLocked] = useState(false);

  // Initialize and load from local storage
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // Fill out state structural changes
        const merged = {
          ...INITIAL_STATE,
          ...parsed,
          settings: {
            ...INITIAL_STATE.settings,
            ...(parsed.settings || {})
          }
        };
        setState(merged);
        
        // Handle passcode locking on initial application mount
        if (merged.settings.isPasscodeRequired && merged.settings.passcodeHash) {
          setIsScreenLocked(true);
        }
        
        // Apply theme color modes
        if (merged.settings.theme === 'light') {
          document.body.classList.add('light-mode');
        } else {
          document.body.classList.remove('light-mode');
        }
      } catch (err) {
        console.error("Local records load failure, utilizing initial sandbox blueprints:", err);
      }
    }
  }, []);

  // Save changes to localStorage helper
  const updateState = (updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Theme support
  const handleToggleTheme = () => {
    updateState((prev) => {
      const nextTheme = prev.settings.theme === 'dark' ? 'light' : 'dark';
      if (nextTheme === 'light') {
        document.body.classList.add('light-mode');
      } else {
        document.body.classList.remove('light-mode');
      }
      return {
        ...prev,
        settings: {
          ...prev.settings,
          theme: nextTheme
        }
      };
    });
  };

  // Nav coordinate lists
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'habits', label: 'Habit Systems', icon: CheckSquare },
    { id: 'study', label: 'Study Lab', icon: BookOpen },
    { id: 'gym', label: 'Gym Ledger', icon: Dumbbell },
    { id: 'calendar', label: 'Calendar Ledger', icon: CalendarIcon },
    { id: 'planner', label: 'Hour Planner', icon: Clock },
    { id: 'growth', label: 'Stoic Growth', icon: Sprout },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'settings', label: 'Configurations', icon: SettingsIcon },
  ];

  // Habits Operations
  const handleAddHabit = (name: string, category: 'morning' | 'night' | 'daily') => {
    updateState((prev) => {
      const id = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + `_${Date.now()}`;
      const newHabit: Habit = {
        id,
        name,
        category,
        createdAt: new Date().toISOString()
      };
      return {
        ...prev,
        habitDefs: [...prev.habitDefs, newHabit]
      };
    });
  };

  const handleToggleHabit = (id: string) => {
    updateState((prev) => {
      const key = `${todayStr}_${id}`;
      const wasCompleted = !!prev.habits[key];
      const updatedHabits = { ...prev.habits };
      
      if (wasCompleted) {
        delete updatedHabits[key];
      } else {
        updatedHabits[key] = true;
      }

      // Calculate streak values
      const updatedStreaks = { ...prev.habitStreaks };
      let currentStreak = updatedStreaks[id] || 0;
      if (wasCompleted) {
        currentStreak = Math.max(0, currentStreak - 1);
      } else {
        currentStreak += 1;
      }
      updatedStreaks[id] = currentStreak;

      return {
        ...prev,
        habits: updatedHabits,
        habitStreaks: updatedStreaks
      };
    });
  };

  const handleDeleteHabit = (id: string) => {
    updateState((prev) => {
      const filteredDefs = prev.habitDefs.filter((h) => h.id !== id);
      const filteredStreaks = { ...prev.habitStreaks };
      delete filteredStreaks[id];
      
      // Filter out raw index hashes as well
      const filteredCompletions = { ...prev.habits };
      Object.keys(filteredCompletions).forEach((k) => {
        if (k.endsWith(`_${id}`)) {
          delete filteredCompletions[k];
        }
      });

      return {
        ...prev,
        habitDefs: filteredDefs,
        habitStreaks: filteredStreaks,
        habits: filteredCompletions
      };
    });
  };

  // Study Operations
  const handleAddStudySubject = (name: string) => {
    updateState((prev) => {
      if (prev.studySubjects.includes(name)) return prev;
      return {
        ...prev,
        studySubjects: [...prev.studySubjects, name]
      };
    });
  };

  const handleAddStudyGoal = (name: string) => {
    updateState((prev) => {
      const newGoal = {
        id: `goal_${Date.now()}`,
        name,
        done: false,
        date: todayStr
      };
      return {
        ...prev,
        studyGoals: [...prev.studyGoals, newGoal]
      };
    });
  };

  const handleToggleStudyGoal = (id: string) => {
    updateState((prev) => {
      const updatedGoals = prev.studyGoals.map((g) => {
        if (g.id === id) {
          return { ...g, done: !g.done };
        }
        return g;
      });
      return {
        ...prev,
        studyGoals: updatedGoals
      };
    });
  };

  const handleDeleteStudyGoal = (id: string) => {
    updateState((prev) => {
      const filtered = prev.studyGoals.filter((g) => g.id !== id);
      return {
        ...prev,
        studyGoals: filtered
      };
    });
  };

  const handleLogStudySession = (subject: string, durationMinutes: number) => {
    updateState((prev) => {
      const newSession: StudySession = {
        id: `session_${Date.now()}`,
        date: todayStr,
        subject,
        duration: durationMinutes,
        createdAt: new Date().toISOString()
      };
      return {
        ...prev,
        studySessions: [...prev.studySessions, newSession]
      };
    });
  };

  // Gym Operations
  const handleUpdateGymPlan = (newPlan: AppState['gymPlan']) => {
    updateState((prev) => ({
      ...prev,
      gymPlan: newPlan
    }));
  };

  const handleAddExercise = (name: string, muscle: string, setsCount: number, repsCount: number) => {
    updateState((prev) => {
      const workouts = [...prev.gymWorkouts];
      let todayWorkout = workouts.find((w) => w.date === todayStr);

      if (!todayWorkout) {
        todayWorkout = {
          id: `workout_${Date.now()}`,
          date: todayStr,
          name: `${muscle} Blast`,
          exercises: []
        };
        workouts.push(todayWorkout);
      }

      const sets = Array.from({ length: setsCount }, () => ({
        reps: repsCount,
        done: false
      }));

      todayWorkout.exercises.push({
        name,
        muscle,
        sets
      });

      return {
        ...prev,
        gymWorkouts: workouts
      };
    });
  };

  const handleToggleGymSet = (exerciseIdx: number, setIdx: number) => {
    updateState((prev) => {
      const workouts = prev.gymWorkouts.map((w) => {
        if (w.date === todayStr) {
          const exercises = [...w.exercises];
          const exercise = { ...exercises[exerciseIdx] };
          const sets = [...exercise.sets];
          sets[setIdx] = { ...sets[setIdx], done: !sets[setIdx].done };
          exercise.sets = sets;
          exercises[exerciseIdx] = exercise;
          return { ...w, exercises };
        }
        return w;
      });
      return {
        ...prev,
        gymWorkouts: workouts
      };
    });
  };

  const handleRemoveGymExercise = (exerciseIdx: number) => {
    updateState((prev) => {
      const workouts = prev.gymWorkouts.map((w) => {
        if (w.date === todayStr) {
          const exercises = w.exercises.filter((_, idx) => idx !== exerciseIdx);
          return { ...w, exercises };
        }
        return w;
      });
      return {
        ...prev,
        gymWorkouts: workouts
      };
    });
  };

  const handleAddCustomSet = (exerciseIdx: number, reps: number, weight?: number) => {
    updateState((prev) => {
      const workouts = prev.gymWorkouts.map((w) => {
        if (w.date === todayStr) {
          const exercises = [...w.exercises];
          const exercise = { ...exercises[exerciseIdx] };
          const sets = [...exercise.sets, { reps, weight, done: false }];
          exercise.sets = sets;
          exercises[exerciseIdx] = exercise;
          return { ...w, exercises };
        }
        return w;
      });
      return {
        ...prev,
        gymWorkouts: workouts
      };
    });
  };

  // Calendar Event Operations
  const handleAddCalendarEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    updateState((prev) => {
      const newEvent: CalendarEvent = {
        ...eventData,
        id: `evt_${Date.now()}`
      };
      return {
        ...prev,
        calendarEvents: [...prev.calendarEvents, newEvent]
      };
    });
  };

  const handleDeleteCalendarEvent = (id: string) => {
    updateState((prev) => {
      const filtered = prev.calendarEvents.filter((e) => e.id !== id);
      return {
        ...prev,
        calendarEvents: filtered
      };
    });
  };

  // Daily Planner & Reflection Operations
  const handleAddTask = (task: string, priority: 'High' | 'Medium' | 'Low', time: string) => {
    updateState((prev) => {
      const newTask: PlannerTask = {
        id: `task_${Date.now()}`,
        date: todayStr,
        task,
        priority,
        time,
        done: false
      };
      return {
        ...prev,
        plannerTasks: [...prev.plannerTasks, newTask]
      };
    });
  };

  const handleToggleTask = (id: string) => {
    updateState((prev) => {
      const updated = prev.plannerTasks.map((t) => {
        if (t.id === id) {
          return { ...t, done: !t.done };
        }
        return t;
      });
      return {
        ...prev,
        plannerTasks: updated
      };
    });
  };

  const handleDeleteTask = (id: string) => {
    updateState((prev) => {
      const filtered = prev.plannerTasks.filter((t) => t.id !== id);
      return {
        ...prev,
        plannerTasks: filtered
      };
    });
  };

  const handleSaveReflection = (text: string, rating: number) => {
    updateState((prev) => {
      const reflections = [...prev.reflections];
      const index = reflections.findIndex((r) => r.date === todayStr);

      if (index >= 0) {
        reflections[index] = { ...reflections[index], text, rating };
      } else {
        reflections.push({
          date: todayStr,
          text,
          rating
        });
      }

      return {
        ...prev,
        reflections
      };
    });
  };

  // Self Growth Operations
  const handleCheckDetoxDay = (checked: boolean) => {
    updateState((prev) => {
      let detoxHistory = [...prev.detoxHistory];
      let detoxDays = prev.detoxDays || 0;

      if (checked) {
        if (!detoxHistory.includes(todayStr)) {
          detoxHistory.push(todayStr);
          detoxDays += 1;
        }
      } else {
        if (detoxHistory.includes(todayStr)) {
          detoxHistory = detoxHistory.filter((d) => d !== todayStr);
          detoxDays = Math.max(0, detoxDays - 1);
        }
      }

      return {
        ...prev,
        detoxHistory,
        detoxDays
      };
    });
  };

  const handleResetDetox = () => {
    updateState((prev) => ({
      ...prev,
      detoxDays: 0,
      detoxHistory: []
    }));
  };

  const handleLogMood = (mood: string) => {
    updateState((prev) => {
      const moodLog = { ...prev.moodLog, [todayStr]: mood };
      return {
        ...prev,
        moodLog
      };
    });
  };

  // Configuration general updates
  const handleUpdateSettings = (settings: AppState['settings']) => {
    updateState((prev) => ({
      ...prev,
      settings
    }));
  };

  const handleRestoreData = (newData: AppState) => {
    updateState(() => newData);
  };

  const handleResetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(INITIAL_STATE);
  };

  // Nav actions
  const navigateTo = (section: string) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  // Calculate generic active streaks
  const overallStreak = navItems.length > 0 ? state.detoxDays || 0 : 0;

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative z-10">
      {isScreenLocked && state.settings.isPasscodeRequired && state.settings.passcodeHash && (
        <PasscodeLockScreen
          passcodeHash={state.settings.passcodeHash}
          userName={state.settings.userName}
          onUnlock={() => setIsScreenLocked(false)}
        />
      )}
      {/* Premium Hardware-Accelerated Glass Gradient Background */}
      <div className="fixed inset-0 -z-30 pointer-events-none overflow-hidden select-none">
        {state.settings.theme === 'light' ? (
          <div className="absolute inset-0 bg-[#f7f6fa] transition-all duration-700">
            {/* Soft pink glow top-left */}
            <div className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] max-w-[650px] max-h-[650px] rounded-full bg-pink-400/6 blur-[100px] md:blur-[120px]" />
            {/* Soft purple glow bottom-right */}
            <div className="absolute -bottom-[10%] -right-[10%] w-[70vw] h-[70vw] max-w-[750px] max-h-[750px] rounded-full bg-purple-400/8 blur-[110px] md:blur-[130px]" />
            {/* Soft indigo glow center */}
            <div className="absolute top-[30%] left-[30%] w-[50vw] h-[50vw] max-w-[550px] max-h-[550px] rounded-full bg-indigo-400/5 blur-[100px] md:blur-[115px]" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-[#030308] transition-all duration-700 font-sans">
            {/* Soft pink/rose glass glow top-left */}
            <div className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] max-w-[650px] max-h-[650px] rounded-full bg-pink-500/5 blur-[100px] md:blur-[120px]" />
            {/* Soft purple glass glow bottom-right */}
            <div className="absolute -bottom-[10%] -right-[10%] w-[70vw] h-[70vw] max-w-[750px] max-h-[750px] rounded-full bg-purple-500/6 blur-[110px] md:blur-[130px]" />
            {/* Soft indigo glass glow center */}
            <div className="absolute top-[30%] left-[30%] w-[50vw] h-[50vw] max-w-[550px] max-h-[550px] rounded-full bg-indigo-500/4 blur-[100px] md:blur-[115px]" />
          </div>
        )}
      </div>
      
      {/* Sidebar navigation styled in midnight black glass */}
      <aside className="hidden md:flex flex-col w-64 bg-zinc-950/75 border-r border-zinc-900/85 backdrop-blur-2xl p-5 sticky top-0 h-screen z-40 justify-between select-none">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-2">
            <div className="p-2 bg-gradient-to-tr from-pink-500 to-purple-500 rounded-xl shadow-lg border border-pink-400/20">
              <Compass className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-lg font-black font-display tracking-tight text-white leading-none">
                BetterMe
              </h1>
              <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-widest mt-1 block">
                Lock In Edition
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider relative group border border-transparent ${
                    isActive 
                      ? 'bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-pink-400 font-black border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.06)]' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 hover:border-zinc-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-pink-400' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Badge Profile at Bottom */}
        <div className="border-t border-zinc-900 pt-4 mt-4">
          <div className="flex items-center gap-3 bg-zinc-950/40 p-3 rounded-2xl border border-zinc-900">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/25 border border-pink-500/35 flex items-center justify-center font-bold font-mono text-pink-400 text-sm">
              {(state.settings.userName || 'C')[0]}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-black text-white block truncate">{state.settings.userName || 'Champion'}</span>
              <span className="text-[9px] text-pink-400 font-mono font-bold flex items-center gap-0.5 mt-0.5 uppercase tracking-wide">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Dopamine Detox: {state.detoxDays}d
              </span>
            </div>
          </div>
          <button
            onClick={handleToggleTheme}
            className="w-full mt-3 py-2 bg-zinc-950/30 hover:bg-zinc-900/60 border border-zinc-900 hover:border-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white uppercase transition-all flex items-center justify-center gap-1 leading-none rounded-xl"
            title="Alternative Appearance toggles to eye safe levels"
          >
            {state.settings.theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
            )}
            Theme: {state.settings.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          
          {state.settings.isPasscodeRequired && state.settings.passcodeHash && (
            <button
              onClick={() => setIsScreenLocked(true)}
              className="w-full mt-2 py-2 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 hover:border-pink-500/35 text-[10px] font-bold text-pink-400 hover:text-pink-300 uppercase transition-all flex items-center justify-center gap-1 leading-none rounded-xl"
              title="Lock active terminal log"
            >
              <Lock className="w-3.5 h-3.5" />
              Lock Terminal
            </button>
          )}

          <div className="mt-4 pt-3 border-t border-zinc-900 pb-1 text-center font-sans">
            <p className="text-[9px] text-zinc-650 font-medium leading-relaxed uppercase tracking-wider">
              © 2026 BetterMe<br/>
              all rights reserved by <span className="text-zinc-500 font-bold block mt-0.5">arima • bliss devs</span>
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Top bar */}
      <header className="md:hidden bg-zinc-950/80 border-b border-zinc-900/80 backdrop-blur-xl px-4 py-3 sticky top-0 z-50 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-pink-400" />
          <h1 className="text-sm font-black font-display tracking-tight text-white uppercase">
            BetterMe
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleTheme}
            className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400"
          >
            {state.settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/90 backdrop-blur-2xl z-40 flex flex-col justify-center px-6 space-y-6">
          <nav className="space-y-2 text-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold transition-all uppercase tracking-widest border border-transparent ${
                    isActive 
                      ? 'bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-pink-400 border-pink-500/20' 
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-12 h-12 rounded-full border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center mx-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main scrolling layout */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 max-h-[calc(100vh_-_56px)] md:max-h-screen">
        <div className="max-w-6xl mx-auto">
          {activeSection === 'dashboard' && (
            <UnifiedDashboard 
              state={state} 
              onSetSection={navigateTo} 
              todayStr={todayStr} 
            />
          )}

          {activeSection === 'habits' && (
            <HabitsSection
              habitDefs={state.habitDefs}
              habits={state.habits}
              habitStreaks={state.habitStreaks}
              todayStr={todayStr}
              onAddHabit={handleAddHabit}
              onToggleHabit={handleToggleHabit}
              onDeleteHabit={handleDeleteHabit}
            />
          )}

          {activeSection === 'study' && (
            <StudySection
              studySessions={state.studySessions}
              studySubjects={state.studySubjects}
              studyGoals={state.studyGoals}
              todayStr={todayStr}
              onAddStudySubject={handleAddStudySubject}
              onAddStudyGoal={handleAddStudyGoal}
              onToggleStudyGoal={handleToggleStudyGoal}
              onDeleteStudyGoal={handleDeleteStudyGoal}
              onLogStudySession={handleLogStudySession}
              dailyGoalMinutes={state.settings.dailyStudyGoalMinutes}
            />
          )}

          {activeSection === 'gym' && (
            <GymSection
              gymPlan={state.gymPlan}
              gymWorkouts={state.gymWorkouts}
              todayStr={todayStr}
              onUpdateGymPlan={handleUpdateGymPlan}
              onAddExercise={handleAddExercise}
              onToggleGymSet={handleToggleGymSet}
              onRemoveGymExercise={handleRemoveGymExercise}
              onAddCustomSet={handleAddCustomSet}
            />
          )}

          {activeSection === 'calendar' && (
            <CalendarSection
              state={state}
              todayStr={todayStr}
              onAddCalendarEvent={handleAddCalendarEvent}
              onDeleteCalendarEvent={handleDeleteCalendarEvent}
            />
          )}

          {activeSection === 'planner' && (
            <PlannerSection
              plannerTasks={state.plannerTasks}
              reflections={state.reflections}
              todayStr={todayStr}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onSaveReflection={handleSaveReflection}
            />
          )}

          {activeSection === 'growth' && (
            <GrowthSection
              state={state}
              todayStr={todayStr}
              onCheckDetoxDay={handleCheckDetoxDay}
              onResetDetox={handleResetDetox}
              onLogMood={handleLogMood}
            />
          )}

          {activeSection === 'analytics' && (
            <AnalyticsSection 
              state={state} 
              todayStr={todayStr} 
            />
          )}

          {activeSection === 'settings' && (
            <SettingsSection
              state={state}
              onUpdateSettings={handleUpdateSettings}
              onRestoreData={handleRestoreData}
              onResetAllData={handleResetAllData}
            />
          )}

          {/* User-requested copyright and branding footer */}
          <footer className="mt-12 pt-6 border-t border-zinc-900/60 text-center select-none">
            <p className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest">
              all rights reserved by arima • bliss devs
            </p>
          </footer>
        </div>
      </main>

    </div>
  );
}
