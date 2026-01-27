export type Priority = 'low' | 'medium' | 'high';

export type DeadlineStatus = 'immediate' | 'warning' | 'on_track' | 'completed' | 'overdue';

export interface Deadline {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  deadline_at: string;
  priority: Priority;
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
  due_at: string | null;
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
