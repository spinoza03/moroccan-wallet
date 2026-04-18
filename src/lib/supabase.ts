import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qmloullwdzwapztswquz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtbG91bGx3ZHp3YXB6dHN3cXV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MTk3ODAsImV4cCI6MjA5MTQ5NTc4MH0.XmBqk9a0O7rP3cg7mXH348XS_7ZEyJNhvcmjV-RE-eY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type SubscriptionPlan = 'monthly' | 'yearly' | 'trial';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  is_admin: boolean;
  subscription_status: 'pending' | 'active' | 'expired' | 'none' | 'trial';
  subscription_plan: SubscriptionPlan | null;
  subscription_start: string | null;
  subscription_end: string | null;
  payment_receipt_url: string | null;
  payment_submitted_at: string | null;
  created_at: string;
}
