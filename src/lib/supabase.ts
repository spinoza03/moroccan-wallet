import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qmloullwdzwapztswquz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type SubscriptionPlan = 'monthly' | 'yearly';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  subscription_status: 'pending' | 'active' | 'expired' | 'none';
  subscription_plan: SubscriptionPlan | null;
  subscription_start: string | null;
  subscription_end: string | null;
  payment_receipt_url: string | null;
  payment_submitted_at: string | null;
  created_at: string;
}
