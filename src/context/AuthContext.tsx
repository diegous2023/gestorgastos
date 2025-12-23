import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AuthUser {
  email: string;
  name: string;
}

interface PinStatus {
  required: boolean;
  hasPin: boolean;
  verified: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  login: (email: string) => Promise<{ success: boolean; error?: string; hasPin?: boolean }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  pinStatus: PinStatus;
  setPinVerified: () => void;
  createPin: (pin: string) => Promise<{ success: boolean; error?: string }>;
  verifyPin: (pin: string) => Promise<{ success: boolean; error?: string }>;
  pendingEmail: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const REMEMBER_DEVICE_KEY = 'gestor_pin_remember';

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
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [pinStatus, setPinStatus] = useState<PinStatus>({
    required: false,
    hasPin: false,
    verified: false
  });

  // Check if device is remembered
  const isDeviceRemembered = useCallback((email: string) => {
    try {
      const remembered = localStorage.getItem(REMEMBER_DEVICE_KEY);
      if (remembered) {
        const data = JSON.parse(remembered);
        return data.email === email && data.remembered === true;
      }
    } catch {
      return false;
    }
    return false;
  }, []);

  // Listen for user changes via Realtime (PIN changes, status changes, etc.)
  useEffect(() => {
    if (!user?.email) return;

    console.log('Setting up Realtime listener for:', user.email);

    const channel = supabase
      .channel('user-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'authorized_users',
          filter: `email=eq.${user.email}`
        },
        async (payload) => {
          console.log('Realtime update received:', payload);
          
          const oldData = payload.old as { pin?: string; updated_at?: string };
          const newData = payload.new as { pin?: string; updated_at?: string };
          
          // Sign out if PIN changed or if admin triggered a session reset
          const pinChanged = oldData.pin !== newData.pin;
          const forceLogout = oldData.updated_at !== newData.updated_at;
          
          if (pinChanged || forceLogout) {
            console.log('Session invalidated, signing out user. PIN changed:', pinChanged, 'Force logout:', forceLogout);
            localStorage.removeItem(REMEMBER_DEVICE_KEY);
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
            setPinStatus({ required: false, hasPin: false, verified: false });
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.email]);

  // Validate session on load (important for PWA)
  const validateSession = useCallback(async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('authorized_users')
        .select('updated_at')
        .eq('email', email)
        .single();
      
      if (error || !data) return;
      
      const lastUpdatedAt = localStorage.getItem(`user_updated_at_${email}`);
      const currentUpdatedAt = data.updated_at;
      
      // If updated_at changed, force logout
      if (lastUpdatedAt && lastUpdatedAt !== currentUpdatedAt) {
        console.log('Session invalidated - user data changed, forcing logout');
        localStorage.removeItem(REMEMBER_DEVICE_KEY);
        localStorage.removeItem(`user_updated_at_${email}`);
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setPinStatus({ required: false, hasPin: false, verified: false });
      } else {
        // Store current updated_at
        localStorage.setItem(`user_updated_at_${email}`, currentUpdatedAt);
      }
    } catch (error) {
      console.error('Error validating session:', error);
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        // Extract user info from app_metadata if available
        if (session?.user?.app_metadata?.authorized_email) {
          const userEmail = session.user.app_metadata.authorized_email;
          setUser({
            email: userEmail,
            name: session.user.app_metadata.authorized_name || '',
          });
          
          // Validate session for PWA (check if user data changed)
          validateSession(userEmail);
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      if (session?.user?.app_metadata?.authorized_email) {
        const userEmail = session.user.app_metadata.authorized_email;
        setUser({
          email: userEmail,
          name: session.user.app_metadata.authorized_name || '',
        });
        
        // Validate session for PWA
        await validateSession(userEmail);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [validateSession]);

  const login = async (email: string): Promise<{ success: boolean; error?: string; hasPin?: boolean }> => {
    try {
      // First, sign in anonymously to get a session
      const { error: signInError } = await supabase.auth.signInAnonymously();
      
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
        await supabase.auth.signOut();
        return { success: false, error: 'Error al verificar el correo' };
      }

      if (data.error) {
        await supabase.auth.signOut();
        return { success: false, error: data.error };
      }

      // Check if device is remembered
      const deviceRemembered = isDeviceRemembered(email.toLowerCase().trim());
      
      // Set PIN status based on response
      const hasPin = !!data.hasPin;
      const pinVerified = deviceRemembered;
      
      setPinStatus({
        required: true,
        hasPin: hasPin,
        verified: pinVerified
      });
      
      setPendingEmail(email.toLowerCase().trim());

      // Store the user's updated_at for session validation
      const { data: userData } = await supabase
        .from('authorized_users')
        .select('updated_at')
        .eq('email', email.toLowerCase().trim())
        .single();
      
      if (userData) {
        localStorage.setItem(`user_updated_at_${email.toLowerCase().trim()}`, userData.updated_at);
      }

      // If device is remembered and user has PIN, complete login
      if (deviceRemembered && hasPin) {
        // Refresh the session to get updated app_metadata
        await supabase.auth.refreshSession();
        setUser({ email: data.email, name: data.name });
        return { success: true, hasPin: true };
      }

      // If no PIN or device not remembered, need to handle PIN
      if (!hasPin || !deviceRemembered) {
        // For users without PIN (needs to create) or needs verification
        // Refresh session first
        await supabase.auth.refreshSession();
        setUser({ email: data.email, name: data.name });
        return { success: true, hasPin: hasPin };
      }
      
      return { success: true, hasPin: hasPin };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Error de conexión' };
    }
  };

  const createPin = async (pin: string): Promise<{ success: boolean; error?: string }> => {
    if (!pendingEmail && !user?.email) {
      return { success: false, error: 'No hay usuario pendiente' };
    }

    const email = pendingEmail || user?.email;

    try {
      const { data, error } = await supabase.functions.invoke('verify-pin', {
        body: { email, pin, action: 'create' }
      });

      if (error || data.error) {
        return { success: false, error: data?.error || 'Error al crear PIN' };
      }

      setPinStatus(prev => ({ ...prev, hasPin: true, verified: true }));
      return { success: true };
    } catch (err) {
      console.error('Create PIN error:', err);
      return { success: false, error: 'Error de conexión' };
    }
  };

  const verifyPin = async (pin: string): Promise<{ success: boolean; error?: string }> => {
    if (!pendingEmail && !user?.email) {
      return { success: false, error: 'No hay usuario pendiente' };
    }

    const email = pendingEmail || user?.email;

    try {
      const { data, error } = await supabase.functions.invoke('verify-pin', {
        body: { email, pin, action: 'verify' }
      });

      if (error || data.error) {
        return { success: false, error: data?.error || 'PIN incorrecto' };
      }

      setPinStatus(prev => ({ ...prev, verified: true }));
      return { success: true };
    } catch (err) {
      console.error('Verify PIN error:', err);
      return { success: false, error: 'Error de conexión' };
    }
  };

  const setPinVerified = () => {
    setPinStatus(prev => ({ ...prev, verified: true }));
  };

  const rememberDevice = (email: string) => {
    localStorage.setItem(REMEMBER_DEVICE_KEY, JSON.stringify({ email, remembered: true }));
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setPinStatus({ required: false, hasPin: false, verified: false });
    setPendingEmail(null);
  };

  // Expose rememberDevice function through context value customization
  const contextValue: AuthContextType & { rememberDevice: (email: string) => void } = {
    user,
    session,
    login,
    logout,
    isLoading,
    pinStatus,
    setPinVerified,
    createPin,
    verifyPin,
    pendingEmail,
    rememberDevice
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
