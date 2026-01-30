export type Priority = 'low' | 'medium' | 'high';

export type DeadlineStatus = 'immediate' | 'warning' | 'on_track' | 'completed' | 'overdue';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface Deadline {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  deadline_at: string;
  priority: Priority;
  category_id: string | null;
  parent_id: string | null; // For nested deadlines
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface Subtask {
  id: string;
  deadline_id: string;
  user_id: string;
  title: string;
  completed: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface FocusSession {
  id: string;
  user_id: string;
  deadline_id: string | null;
  duration_minutes: number;
  started_at: string;
  completed_at: string | null;
  session_type: 'work' | 'short_break' | 'long_break';
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  percentage: number;
}

// Default categories
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'design', name: 'Diseño', color: 'hsl(280, 100%, 70%)' },
  { id: 'programming', name: 'Programación', color: 'hsl(200, 100%, 60%)' },
  { id: 'marketing', name: 'Marketing', color: 'hsl(340, 100%, 65%)' },
  { id: 'personal', name: 'Personal', color: 'hsl(150, 80%, 50%)' },
  { id: 'work', name: 'Trabajo', color: 'hsl(45, 100%, 55%)' },
];
