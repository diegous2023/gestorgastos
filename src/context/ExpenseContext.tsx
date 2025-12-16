import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Expense, CategoryLimit, Currency, CategoryId } from '@/types/expense';

interface ExpenseContextType {
  expenses: Expense[];
  categoryLimits: CategoryLimit[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  setCategoryLimit: (limit: CategoryLimit) => void;
  removeCategoryLimit: (categoryId: CategoryId) => void;
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
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [categoryLimits, setCategoryLimits] = useState<CategoryLimit[]>(() => {
    const saved = localStorage.getItem('categoryLimits');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('categoryLimits', JSON.stringify(categoryLimits));
  }, [categoryLimits]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
  };

  const setCategoryLimit = (limit: CategoryLimit) => {
    setCategoryLimits(prev => {
      const filtered = prev.filter(l => l.categoryId !== limit.categoryId);
      return [...filtered, limit];
    });
  };

  const removeCategoryLimit = (categoryId: CategoryId) => {
    setCategoryLimits(prev => prev.filter(l => l.categoryId !== categoryId));
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
