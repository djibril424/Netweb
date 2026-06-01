import React, { createContext, useContext, useState, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { router } from './core/routes.jsx';

export const AuthContext = createContext({
  session: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  setProfile: () => {}
});

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    }, []);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  },);

  const refreshProfile = async () => {
    if (session) {
      await fetchProfile(session.user.id);
    }
  };

  const contextValue = {
    session,
    profile,
    loading,
    refreshProfile,
    setProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
      <RouterProvider router={router} />
    </AuthContext.Provider>
  );
}

