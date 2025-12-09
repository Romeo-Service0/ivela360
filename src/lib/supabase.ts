import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://jswwrffxubwknryvhqqa.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impzd3dyZmZ4dWJ3a25yeXZocXFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMDIzODAsImV4cCI6MjA4MDY3ODM4MH0.8ijnZbI86m2x4XRdW3I9hVSdP1qVq0T3Fi9jYkd3fHw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Role types - Rôles disponibles dans l'application
export type EmployeeRole = 'manager' | 'superviseur' | 'rh' | 'collaborateur' | 'pair';

// Labels for roles
export const ROLE_LABELS: Record<EmployeeRole, string> = {
  manager: 'Manager (N+2)',
  superviseur: 'Superviseur (N+1)',
  rh: 'RH',
  collaborateur: 'Collaborateur',
  pair: 'Pair',
};

// Database types
export interface Employee {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  matricule: string;
  poste: string;
  service: string;
  division: string;
  manager_id: string | null;
  role: EmployeeRole;
  created_at: string;
}

export interface GoalSetting {
  id: string;
  employee_id: string;
  cycle_year: number;
  service_priorities: string[];
  meeting_date: string;
  status: 'draft' | 'submitted' | 'approved';
  employee_signature: string | null;
  manager_signature: string | null;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  goal_setting_id: string;
  description: string;
  specific: boolean;
  traceable: boolean;
  weight: number;
  development_level: 'D1' | 'D2' | 'D3' | 'D4';
  leadership_style: 'S1' | 'S2' | 'S3' | 'S4';
  created_at: string;
}

export interface Appraisal {
  id: string;
  employee_id: string;
  goal_setting_id: string;
  type: 'mid-year' | 'end-year';
  cycle_year: number;
  objectives_score: number | null;
  behavior_score: number | null;
  global_score: number | null;
  employee_appreciation: string | null;
  manager_appreciation: string | null;
  strengths: string | null;
  areas_for_improvement: string | null;
  career_wishes: string | null;
  training_needs: string | null;
  status: 'draft' | 'submitted' | 'approved';
  employee_signature: string | null;
  manager_signature: string | null;
  created_at: string;
  updated_at: string;
}

export interface BehavioralEvaluation {
  id: string;
  appraisal_id: string;
  category: string;
  criterion: string;
  score: number;
  created_at: string;
}
