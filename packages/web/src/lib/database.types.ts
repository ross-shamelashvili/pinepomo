export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          timezone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          timezone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          timezone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      timer_sessions: {
        Row: {
          id: string;
          user_id: string;
          device_id: string;
          started_at: string;
          ended_at: string | null;
          duration_mins: number;
          status: 'running' | 'paused' | 'completed' | 'cancelled';
          task_name: string | null;
          todoist_task_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          device_id: string;
          started_at: string;
          ended_at?: string | null;
          duration_mins: number;
          status: 'running' | 'paused' | 'completed' | 'cancelled';
          task_name?: string | null;
          todoist_task_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          device_id?: string;
          started_at?: string;
          ended_at?: string | null;
          duration_mins?: number;
          status?: 'running' | 'paused' | 'completed' | 'cancelled';
          task_name?: string | null;
          todoist_task_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'timer_sessions_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          work_mins: number;
          break_mins: number;
          long_break_mins: number;
          daily_goal: number;
          theme_id: string;
          mode: 'light' | 'dark';
          todoist_api_key: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          work_mins?: number;
          break_mins?: number;
          long_break_mins?: number;
          daily_goal?: number;
          theme_id?: string;
          mode?: 'light' | 'dark';
          todoist_api_key?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          work_mins?: number;
          break_mins?: number;
          long_break_mins?: number;
          daily_goal?: number;
          theme_id?: string;
          mode?: 'light' | 'dark';
          todoist_api_key?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_settings_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
