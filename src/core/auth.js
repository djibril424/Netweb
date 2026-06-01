
import { supabase } from '../lib/supabase';

export const loginWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account consent'
      }
    }
  });
  if (error) throw error;
  return data;
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getSessionUser = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) return null;
  return session?.user || null;
};
