import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthUser {
  email: string;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('expense_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase
        .from('authorized_users')
        .select('email, name, status')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (error) {
        return { success: false, error: 'Error al verificar el correo' };
      }

      if (!data) {
        return { 
          success: false, 
          error: 'Este correo no se encuentra autorizado por favor contacte al administrador 🚀' 
        };
      }

      if (data.status === 'suspended') {
        return { 
          success: false, 
          error: 'Tu cuenta ha sido suspendida. Contacta al administrador.' 
        };
      }

      const authUser = { email: data.email, name: data.name };
      setUser(authUser);
      localStorage.setItem('expense_user', JSON.stringify(authUser));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('expense_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
