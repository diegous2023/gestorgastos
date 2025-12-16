import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Expense, CategoryLimit, CategoryId } from '@/types/expense';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface ExpenseContextType {
  expenses: Expense[];
  categoryLimits: CategoryLimit[];
  isLoading: boolean;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setCategoryLimit: (limit: CategoryLimit) => Promise<void>;
  removeCategoryLimit: (categoryId: CategoryId) => Promise<void>;
  getTotalsByCategory: (categoryId: CategoryId) => { usd: number; eur: number };
  getTotals: () => { usd: number; eur: number };
  getMonthlyTotals: (year: number, month: number) => { usd: number; eur: number };
  getYearlyTotals: (year: number) => { usd: number; eur: number };
  getDailyTotals: (date: string) => { usd: number; eur: number };
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

interface ExpenseProviderProps {
  children: ReactNode;
}

export const ExpenseProvider: React.FC<ExpenseProviderProps> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categoryLimits, setCategoryLimits] = useState<CategoryLimit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Fetch expenses from database
  const fetchExpenses = async () => {
    if (!user?.email) return;
    
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_email', user.email)
        .order('date', { ascending: false });

      if (error) throw error;

      const mappedExpenses: Expense[] = (data || []).map(exp => ({
        id: exp.id,
        description: exp.description,
        category: exp.category as CategoryId,
        amountUSD: exp.amount_usd ? Number(exp.amount_usd) : undefined,
        amountEUR: exp.amount_eur ? Number(exp.amount_eur) : undefined,
        currency: exp.currency as Expense['currency'],
        date: exp.date,
        note: exp.note || undefined,
      }));

      setExpenses(mappedExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Error al cargar los gastos');
    }
  };

  // Fetch category limits from database
  const fetchCategoryLimits = async () => {
    if (!user?.email) return;
    
    try {
      const { data, error } = await supabase
        .from('category_limits')
        .select('*')
        .eq('user_email', user.email);

      if (error) throw error;

      const mappedLimits: CategoryLimit[] = (data || []).map(limit => ({
        categoryId: limit.category_id as CategoryId,
        limitUSD: limit.limit_usd ? Number(limit.limit_usd) : undefined,
        limitEUR: limit.limit_eur ? Number(limit.limit_eur) : undefined,
        currency: limit.currency as CategoryLimit['currency'],
      }));

      setCategoryLimits(mappedLimits);
    } catch (error) {
      console.error('Error fetching category limits:', error);
      toast.error('Error al cargar los límites');
    }
  };

  // Load data when user changes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      if (user?.email) {
        await Promise.all([fetchExpenses(), fetchCategoryLimits()]);
      } else {
        setExpenses([]);
        setCategoryLimits([]);
      }
      setIsLoading(false);
    };

    loadData();
  }, [user?.email]);

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    if (!user?.email) {
      toast.error('Debes iniciar sesión para agregar gastos');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_email: user.email,
          description: expense.description,
          category: expense.category,
          amount_usd: expense.amountUSD || null,
          amount_eur: expense.amountEUR || null,
          currency: expense.currency,
          date: expense.date,
          note: expense.note || null,
        })
        .select()
        .single();

      if (error) throw error;

      const newExpense: Expense = {
        id: data.id,
        description: data.description,
        category: data.category as CategoryId,
        amountUSD: data.amount_usd ? Number(data.amount_usd) : undefined,
        amountEUR: data.amount_eur ? Number(data.amount_eur) : undefined,
        currency: data.currency as Expense['currency'],
        date: data.date,
        note: data.note || undefined,
      };

      setExpenses(prev => [newExpense, ...prev]);
      toast.success('Gasto agregado correctamente');
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Error al agregar el gasto');
    }
  };

  const deleteExpense = async (id: string) => {
    if (!user?.email) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_email', user.email);

      if (error) throw error;

      setExpenses(prev => prev.filter(exp => exp.id !== id));
      toast.success('Gasto eliminado');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Error al eliminar el gasto');
    }
  };

  const setCategoryLimit = async (limit: CategoryLimit) => {
    if (!user?.email) {
      toast.error('Debes iniciar sesión para establecer límites');
      return;
    }

    try {
      const { error } = await supabase
        .from('category_limits')
        .upsert({
          user_email: user.email,
          category_id: limit.categoryId,
          limit_usd: limit.limitUSD || null,
          limit_eur: limit.limitEUR || null,
          currency: limit.currency,
        }, {
          onConflict: 'user_email,category_id'
        });

      if (error) throw error;

      setCategoryLimits(prev => {
        const filtered = prev.filter(l => l.categoryId !== limit.categoryId);
        return [...filtered, limit];
      });
      toast.success('Límite actualizado');
    } catch (error) {
      console.error('Error setting category limit:', error);
      toast.error('Error al establecer el límite');
    }
  };

  const removeCategoryLimit = async (categoryId: CategoryId) => {
    if (!user?.email) return;

    try {
      const { error } = await supabase
        .from('category_limits')
        .delete()
        .eq('user_email', user.email)
        .eq('category_id', categoryId);

      if (error) throw error;

      setCategoryLimits(prev => prev.filter(l => l.categoryId !== categoryId));
      toast.success('Límite eliminado');
    } catch (error) {
      console.error('Error removing category limit:', error);
      toast.error('Error al eliminar el límite');
    }
  };

  const getTotalsByCategory = (categoryId: CategoryId) => {
    const categoryExpenses = expenses.filter(exp => exp.category === categoryId);
    return {
      usd: categoryExpenses.reduce((sum, exp) => sum + (exp.amountUSD || 0), 0),
      eur: categoryExpenses.reduce((sum, exp) => sum + (exp.amountEUR || 0), 0),
    };
  };

  const getTotals = () => {
    return {
      usd: expenses.reduce((sum, exp) => sum + (exp.amountUSD || 0), 0),
      eur: expenses.reduce((sum, exp) => sum + (exp.amountEUR || 0), 0),
    };
  };

  const getMonthlyTotals = (year: number, month: number) => {
    const filtered = expenses.filter(exp => {
      const date = new Date(exp.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
    return {
      usd: filtered.reduce((sum, exp) => sum + (exp.amountUSD || 0), 0),
      eur: filtered.reduce((sum, exp) => sum + (exp.amountEUR || 0), 0),
    };
  };

  const getYearlyTotals = (year: number) => {
    const filtered = expenses.filter(exp => {
      const date = new Date(exp.date);
      return date.getFullYear() === year;
    });
    return {
      usd: filtered.reduce((sum, exp) => sum + (exp.amountUSD || 0), 0),
      eur: filtered.reduce((sum, exp) => sum + (exp.amountEUR || 0), 0),
    };
  };

  const getDailyTotals = (dateStr: string) => {
    const filtered = expenses.filter(exp => exp.date === dateStr);
    return {
      usd: filtered.reduce((sum, exp) => sum + (exp.amountUSD || 0), 0),
      eur: filtered.reduce((sum, exp) => sum + (exp.amountEUR || 0), 0),
    };
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        categoryLimits,
        isLoading,
        addExpense,
        deleteExpense,
        setCategoryLimit,
        removeCategoryLimit,
        getTotalsByCategory,
        getTotals,
        getMonthlyTotals,
        getYearlyTotals,
        getDailyTotals,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
