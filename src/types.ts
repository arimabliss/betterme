/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Habit {
  id: string;
  name: string;
  category: 'morning' | 'night' | 'daily';
  createdAt: string;
}

export interface HabitCompletion {
  [dateHash: string]: boolean; // key format: YYYY-MM-DD_habitId
}

export interface HabitStreak {
  [habitId: string]: number;
}

export interface StudySession {
  id: string;
  date: string; // YYYY-MM-DD
  subject: string;
  duration: number; // in minutes
  createdAt: string;
}

export interface StudyGoal {
  id: string;
  name: string;
  done: boolean;
  date: string; // YYYY-MM-DD
}

export interface GymSet {
  reps: number;
  weight?: number;
  done: boolean;
}

export interface GymExercise {
  name: string;
  muscle: string;
  sets: GymSet[];
}

export interface GymWorkout {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  exercises: GymExercise[];
}

export interface PlannerTask {
  id: string;
  date: string; // YYYY-MM-DD
  task: string;
  priority: 'High' | 'Medium' | 'Low';
  time: string; // HH:MM
  done: boolean;
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  category: 'personal' | 'study' | 'gym' | 'habit' | 'other';
  time?: string;
  notes?: string;
}

export interface DailyReflection {
  date: string; // YYYY-MM-DD
  text: string;
  rating: number; // 1-5 scale for discipline
}

export interface AppState {
  habits: HabitCompletion;
  habitDefs: Habit[];
  habitStreaks: HabitStreak;
  studySessions: StudySession[];
  studySubjects: string[];
  studyGoals: StudyGoal[];
  gymPlan: {
    [dayOfWeek: string]: string[]; // e.g. monday: ['chest', 'triceps']
  };
  gymWorkouts: GymWorkout[];
  plannerTasks: PlannerTask[];
  calendarEvents: CalendarEvent[];
  reflections: DailyReflection[];
  moodLog: { [date: string]: string };
  detoxDays: number;
  detoxHistory: string[]; // dates when checked
  settings: {
    theme: 'dark' | 'light';
    dailyStudyGoalMinutes: number;
    userName: string;
    focusSound: string;
  };
  lastActiveDate: string;
}
