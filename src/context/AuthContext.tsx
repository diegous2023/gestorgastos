import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AuthUser {
  email: string;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  login: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        // Extract user info from app_metadata if available
        if (session?.user?.app_metadata?.authorized_email) {
          setUser({
            email: session.user.app_metadata.authorized_email,
            name: session.user.app_metadata.authorized_name || '',
          });
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session?.user?.app_metadata?.authorized_email) {
        setUser({
          email: session.user.app_metadata.authorized_email,
          name: session.user.app_metadata.authorized_name || '',
        });
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // First, sign in anonymously to get a session
      const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();
      
      if (signInError) {
        console.error('Anonymous sign in error:', signInError);
        return { success: false, error: 'Error de conexión' };
      }

      // Call the edge function to validate email and set app_metadata
      const { data, error } = await supabase.functions.invoke('authorize-user', {
        body: { email: email.toLowerCase().trim() }
      });

      if (error) {
        console.error('Edge function error:', error);
        // Sign out since authorization failed
        await supabase.auth.signOut();
        return { success: false, error: 'Error al verificar el correo' };
      }

      if (data.error) {
        // Sign out since authorization failed
        await supabase.auth.signOut();
        return { success: false, error: data.error };
      }

      // Refresh the session to get updated app_metadata
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('Session refresh error:', refreshError);
        return { success: false, error: 'Error al actualizar la sesión' };
      }

      // Set user from the response
      setUser({ email: data.email, name: data.name });
      
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Error de conexión' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
