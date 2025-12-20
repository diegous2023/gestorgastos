import React, { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trash2, Filter, Pencil } from 'lucide-react';
import { useExpenses } from '@/context/ExpenseContext';
import { getCategoryById, Expense } from '@/types/expense';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EditExpenseModal from './EditExpenseModal';

const ExpenseList: React.FC = () => {
  const { expenses, deleteExpense, customCategories } = useExpenses();
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const months = useMemo(() => {
    const uniqueMonths = new Set<string>();
    expenses.forEach(exp => {
      const date = parseISO(exp.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      uniqueMonths.add(key);
    });
    return Array.from(uniqueMonths).sort().reverse();
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    if (filterMonth === 'all') return expenses;
    return expenses.filter(exp => {
      const date = parseISO(exp.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return key === filterMonth;
    });
  }, [expenses, filterMonth]);

  const getMonthLabel = (key: string) => {
    const [year, month] = key.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return format(date, 'MMMM yyyy', { locale: es });
  };

  const getCategoryInfo = (categoryId: string) => {
    // First check standard categories
    const standardCat = getCategoryById(categoryId as any);
    if (standardCat) return standardCat;
    
    // Then check custom categories
    const customCat = customCategories.find(c => c.id === categoryId);
    if (customCat) return customCat;
    
    return { icon: '📦', name: categoryId };
  };

  if (expenses.length === 0) {
    return (
      <div className="glass-card p-8 text-center animate-fade-in">
        <p className="text-muted-foreground">No hay gastos registrados</p>
        <p className="text-sm text-muted-foreground/70 mt-1">Agrega tu primer gasto arriba</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 animate-slide-up">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-[200px] bg-secondary/50 border-border">
              <SelectValue placeholder="Filtrar por mes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los meses</SelectItem>
              {months.map(month => (
                <SelectItem key={month} value={month}>
                  {getMonthLabel(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {filteredExpenses.map((expense, index) => {
            const category = getCategoryInfo(expense.category);
            return (
              <div
                key={expense.id}
                className="glass-card-hover p-4 flex items-center justify-between"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{category?.icon}</span>
                    <h3 className="font-semibold truncate">{expense.description}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {category?.name} • {format(parseISO(expense.date), 'dd/MM/yyyy')}
                  </p>
                  {expense.note && (
                    <p className="text-xs text-muted-foreground/70 mt-1 truncate">
                      {expense.note}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    {expense.amountUSD !== undefined && (
                      <p className="font-semibold text-usd">
                        ${expense.amountUSD.toFixed(2)}
                      </p>
                    )}
                    {expense.amountEUR !== undefined && (
                      <p className="font-semibold text-eur">
                        €{expense.amountEUR.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setEditingExpense(expense)}
                    className="p-2 rounded-lg hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <EditExpenseModal
        expense={editingExpense}
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
      />
    </>
  );
};

export default ExpenseList;