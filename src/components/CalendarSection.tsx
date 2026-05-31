/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Dumbbell, 
  BookOpen, 
  Clock, 
  Bookmark,
  PlusCircle, 
  MapPin,
  Tag, 
  Info,
  CalendarDays
} from 'lucide-react';
import { AppState, CalendarEvent } from '../types';

interface CalendarSectionProps {
  state: AppState;
  todayStr: string;
  onAddCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onDeleteCalendarEvent: (id: string) => void;
}

export const CalendarSection: React.FC<CalendarSectionProps> = ({
  state,
  todayStr,
  onAddCalendarEvent,
  onDeleteCalendarEvent
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(todayStr);
  const [showEventForm, setShowEventForm] = useState(false);

  // Form states for new event
  const [evtTitle, setEvtTitle] = useState('');
  const [evtPriority, setEvtPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [evtCategory, setEvtCategory] = useState<'personal' | 'study' | 'gym' | 'habit' | 'other'>('personal');
  const [evtTime, setEvtTime] = useState('12:00');
  const [evtNotes, setEvtNotes] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper arrays for calendar grid
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayIndex = new Date(year, month, 1).getDay(); // Weekday starting index (0-6)

  const calendarGrid = useMemo(() => {
    const grid: (number | null)[] = [];
    // Pad start with nulls
    for (let i = 0; i < startDayIndex; i++) {
      grid.push(null);
    }
    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      grid.push(day);
    }
    return grid;
  }, [year, month, daysInMonth, startDayIndex]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const formatDateStr = (dayNum: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(dayNum).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Check if day has any events or completed logs
  const getDayMetadata = (dayNum: number) => {
    const dateStr = formatDateStr(dayNum);
    const hasHabits = Object.keys(state.habits).some(k => k.startsWith(dateStr));
    const hasGym = state.gymWorkouts.some(w => w.date === dateStr && w.exercises.some(e => e.sets.some(s => s.done)));
    const hasStudy = state.studySessions.some(s => s.date === dateStr && s.duration > 0);
    const dayEvents = state.calendarEvents.filter(e => e.date === dateStr);
    
    return {
      hasHabits,
      hasGym,
      hasStudy,
      dayEvents
    };
  };

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtTitle.trim()) return;

    onAddCalendarEvent({
      date: selectedDay,
      title: evtTitle.trim(),
      priority: evtPriority,
      category: evtCategory,
      time: evtTime || undefined,
      notes: evtNotes.trim() || undefined
    });

    setEvtTitle('');
    setEvtNotes('');
    setShowEventForm(false);
  };

  // Selected Day summary calculations
  const selectedDayLogs = useMemo(() => {
    const habitsCompleted = state.habitDefs.filter(h => {
      return !!state.habits[`${selectedDay}_${h.id}`];
    });

    const studySessions = state.studySessions.filter(s => s.date === selectedDay);
    const gymWorkout = state.gymWorkouts.find(w => w.date === selectedDay);
    const customEvents = state.calendarEvents.filter(e => e.date === selectedDay);
    const reflection = state.reflections.find(r => r.date === selectedDay);

    return {
      habitsCompleted,
      studySessions,
      gymWorkout,
      customEvents,
      reflection
    };
  }, [state, selectedDay]);

  const textInputStyle = "bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:border-pink-500 focus:outline-none placeholder-zinc-700";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black font-display tracking-tight text-white flex items-center gap-2">
          <CalendarDays className="w-8 h-8 text-pink-500 text-glow-pink" />
          <span className="text-gradient">Discipline Calendar Ledger</span>
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Historical overview of completed activities, scheduled deadlines, and personal milestones.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Grid Card */}
        <div className="glass-panel rounded-2xl p-5 lg:col-span-2 flex flex-col justify-between">
          
          {/* Navigation Controls */}
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-pink-400" />
              <h3 className="text-base font-black text-white font-display uppercase tracking-wider">
                {monthNames[month]} {year}
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 bg-zinc-950/50 border border-zinc-850 hover:border-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-all"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2.5 py-1.5 bg-zinc-950/50 border border-zinc-850 hover:border-zinc-750 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-white transition-all uppercase tracking-wider"
              >
                Current
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 bg-zinc-950/50 border border-zinc-850 hover:border-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-all"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekdays Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-zinc-500 uppercase tracking-widest my-3">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarGrid.map((dayNum, idx) => {
              if (dayNum === null) {
                return <div key={`empty-${idx}`} className="aspect-square bg-transparent rounded-xl" />;
              }

              const dateStr = formatDateStr(dayNum);
              const isSelected = selectedDay === dateStr;
              const isToday = todayStr === dateStr;
              const meta = getDayMetadata(dayNum);
              const hasActivity = meta.hasHabits || meta.hasGym || meta.hasStudy || meta.dayEvents.length > 0;

              return (
                <button
                  key={`day-${dayNum}`}
                  onClick={() => {
                    setSelectedDay(dateStr);
                    setShowEventForm(false);
                  }}
                  className={`aspect-square rounded-xl p-1 flex flex-col justify-between items-center relative transition-all border ${
                    isSelected
                      ? 'bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/10 border-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.15)] ring-1 ring-pink-500/20'
                      : isToday
                        ? 'border-indigo-400/50 bg-indigo-500/5 hover:border-indigo-400 hover:bg-indigo-500/10'
                        : hasActivity
                          ? 'bg-zinc-950/30 border-zinc-900 hover:border-zinc-700 hover:bg-zinc-900/10'
                          : 'border-transparent text-zinc-400 hover:bg-zinc-900/10'
                  }`}
                >
                  {/* Day Number Label */}
                  <span className={`text-xs font-mono font-bold mt-1 ${isToday ? 'text-indigo-400 font-extrabold' : isSelected ? 'text-pink-400 font-extrabold' : 'text-zinc-300'}`}>
                    {dayNum}
                  </span>

                  {/* Indicators bottom line */}
                  <div className="flex gap-0.5 justify-center mt-auto mb-1">
                    {meta.hasHabits && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_4px_rgba(129,140,248,0.5)]" title="Habits Completed" />
                    )}
                    {meta.hasStudy && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_4px_rgba(192,132,252,0.5)]" title="Cognitive study" />
                    )}
                    {meta.hasGym && (
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-400 shadow-[0_0_4px_rgba(244,114,182,0.5)]" title="Power Gym log" />
                    )}
                    {meta.dayEvents.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.5)]" title="Personal scheduled events" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-4 pt-3 border-t border-zinc-900/60 flex-wrap gap-2">
            <span>Grid indicators:</span>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-400" /> Routine Habits</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400" /> Deep Study</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-400" /> Heavy Gym Gym</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Personal Target</span>
            </div>
          </div>
        </div>

        {/* Selected Day highlights sidebar layout */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-zinc-900 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest block font-display">Target Log Analysis</span>
                <h3 className="text-sm font-black text-zinc-100 font-mono mt-0.5">
                  {selectedDay}
                </h3>
              </div>
              <button
                onClick={() => setShowEventForm(!showEventForm)}
                className="p-1 px-2.5 bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 text-pink-400 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Schedule Target
              </button>
            </div>

            {/* Inline Event Construct Form */}
            {showEventForm ? (
              <form onSubmit={handleAddEventSubmit} className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl space-y-3">
                <h4 className="text-[11px] font-black text-pink-400 uppercase tracking-widest">Schedule New Target Event</h4>
                <div className="space-y-2">
                  <div>
                    <input
                      type="text"
                      value={evtTitle}
                      onChange={(e) => setEvtTitle(e.target.value)}
                      placeholder="Event Title (e.g. End Semester Exam)"
                      className={`${textInputStyle} w-full`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-0.5">Priority</label>
                      <select
                        value={evtPriority}
                        onChange={(e) => setEvtPriority(e.target.value as any)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-[10px] text-zinc-300 focus:outline-none"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-0.5">Category</label>
                      <select
                        value={evtCategory}
                        onChange={(e) => setEvtCategory(e.target.value as any)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-[10px] text-zinc-300 focus:outline-none"
                      >
                        <option value="personal">Personal</option>
                        <option value="study">Study Sprint</option>
                        <option value="gym">Gym Session</option>
                        <option value="habit">Habits Systems</option>
                        <option value="other">Other coordinate</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-0.5">Time Limit</label>
                      <input
                        type="time"
                        value={evtTime}
                        onChange={(e) => setEvtTime(e.target.value)}
                        className={`${textInputStyle} w-full py-1`}
                      />
                    </div>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={evtNotes}
                      onChange={(e) => setEvtNotes(e.target.value)}
                      placeholder="Notes (optional)"
                      className={`${textInputStyle} w-full`}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1.5">
                  <button
                    type="button"
                    onClick={() => setShowEventForm(false)}
                    className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 hover:text-zinc-400 uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-[10px] font-bold bg-white text-zinc-950 hover:bg-zinc-200 rounded-lg uppercase tracking-wider"
                  >
                    Save Target
                  </button>
                </div>
              </form>
            ) : null}

            {/* List Details */}
            <div className="space-y-4 max-h-[360px] overflow-y-auto no-scrollbar">

              {/* No logs screen */}
              {selectedDayLogs.habitsCompleted.length === 0 &&
               selectedDayLogs.studySessions.length === 0 &&
               !selectedDayLogs.gymWorkout?.exercises.some(e => e.sets.some(s => s.done)) &&
               selectedDayLogs.customEvents.length === 0 &&
               !selectedDayLogs.reflection ? (
                <div className="text-center py-12 bg-zinc-950/20 border border-zinc-900 rounded-xl p-4">
                  <CalendarDays className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
                  <p className="text-zinc-500 text-xs italic leading-relaxed">
                    No activities logged on {selectedDay}. Change the status trackers, record study hours, log workouts, or schedule personal events.
                  </p>
                </div>
              ) : null}

              {/* Scheduled Events details list */}
              {selectedDayLogs.customEvents.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Scheduled Events</span>
                  {selectedDayLogs.customEvents.map((evt) => (
                    <div key={evt.id} className="flex items-center justify-between p-3 rounded-xl border border-amber-500/30 bg-amber-500/5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                          <h4 className="text-xs font-bold text-zinc-200 truncate">{evt.title}</h4>
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap font-mono text-[9px] text-zinc-500">
                          {evt.time && <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {evt.time}</span>}
                          <span className="uppercase tracking-wider font-extrabold text-[8px] text-amber-550 border border-amber-500/20 px-1 rounded">
                            {evt.priority} Priority
                          </span>
                        </div>
                        {evt.notes && <p className="text-[10px] text-zinc-400 mt-1 italic leading-tight">{evt.notes}</p>}
                      </div>
                      <button
                        onClick={() => onDeleteCalendarEvent(evt.id)}
                        className="text-zinc-600 hover:text-red-400 p-1 rounded-md transition-colors ml-2"
                        title="Delete scheduling"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Habits details list */}
              {selectedDayLogs.habitsCompleted.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Completed Routine Habits</span>
                  <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl space-y-1.5">
                    {selectedDayLogs.habitsCompleted.map((h) => (
                      <div key={h.id} className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-zinc-300 font-medium truncate">{h.name}</span>
                        <span className="font-mono text-[9px] text-zinc-500 font-bold uppercase ml-auto">{h.category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gym details list */}
              {selectedDayLogs.gymWorkout && selectedDayLogs.gymWorkout.exercises.some(e => e.sets.some(s => s.done)) && (
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Gym Session Accomplishment</span>
                  <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200">
                      <Dumbbell className="w-4 h-4 text-pink-400" />
                      Target Muscle overload log:
                    </div>
                    <div className="space-y-1">
                      {selectedDayLogs.gymWorkout.exercises.filter(e => e.sets.some(s => s.done)).map((ex, idx) => {
                        const doneSets = ex.sets.filter(s => s.done).length;
                        return (
                          <div key={idx} className="text-xs flex justify-between font-medium text-zinc-400">
                            <span>{ex.name} <strong className="text-[10px] text-zinc-600 uppercase font-mono tracking-wider ml-1">{ex.muscle}</strong></span>
                            <span className="font-mono text-pink-400 font-bold">{doneSets}/{ex.sets.length} sets completed</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Study details list */}
              {selectedDayLogs.studySessions.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Deep Study Sprints</span>
                  <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl space-y-1.5">
                    {selectedDayLogs.studySessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between text-xs font-medium">
                        <div className="flex items-center gap-1.5 text-zinc-300 min-w-0">
                          <BookOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span className="truncate uppercase tracking-wider">{session.subject}</span>
                        </div>
                        <span className="font-mono text-purple-400 font-bold shrink-0">{session.duration} minutes</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reflection notes details */}
              {selectedDayLogs.reflection && (
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Daily Reflection logs</span>
                  <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider">Discipline Grade:</span>
                      <span className="font-mono font-black text-pink-400">{selectedDayLogs.reflection.rating} / 5</span>
                    </div>
                    <p className="text-zinc-300 text-xs italic leading-relaxed">
                      "{selectedDayLogs.reflection.text}"
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>

          <div className="pt-3 border-t border-zinc-900/65 flex items-center gap-2">
            <Info className="w-4 h-4 text-zinc-500" />
            <p className="text-[10px] text-zinc-500 leading-tight">
              Select any day within the monthly tracker to inspect historical activity matrices.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
