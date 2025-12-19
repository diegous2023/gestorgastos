import React from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { X, Calendar, DollarSign, Euro } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useExpenses } from '@/context/ExpenseContext';
import { CategoryId, getCategoryById } from '@/types/expense';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CategoryHistoryModalProps {
  categoryId: CategoryId | null;
  isOpen: boolean;
  onClose: () => void;
}

const CategoryHistoryModal: React.FC<CategoryHistoryModalProps> = ({ categoryId, isOpen, onClose }) => {
  const { expenses } = useExpenses();
  
  if (!categoryId) return null;
  
  const category = getCategoryById(categoryId);
  const categoryExpenses = expenses
    .filter(exp => exp.category === categoryId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalUSD = categoryExpenses.reduce((sum, exp) => sum + (exp.amountUSD || 0), 0);
  const totalEUR = categoryExpenses.reduce((sum, exp) => sum + (exp.amountEUR || 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-3">
            <span className="text-3xl">{category?.icon}</span>
            <div>
              <span className="block">{category?.name}</span>
              <span className="text-sm font-normal text-muted-foreground">
                {categoryExpenses.length} gasto{categoryExpenses.length !== 1 ? 's' : ''} registrado{categoryExpenses.length !== 1 ? 's' : ''}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mb-1">
              <DollarSign className="w-4 h-4" />
              <span>Total USD</span>
            </div>
            <p className="text-xl font-bold text-usd">${totalUSD.toFixed(2)}</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mb-1">
              <Euro className="w-4 h-4" />
              <span>Total EUR</span>
            </div>
            <p className="text-xl font-bold text-eur">€{totalEUR.toFixed(2)}</p>
          </div>
        </div>

        {/* Expense List */}
        <ScrollArea className="h-[400px] pr-4">
          {categoryExpenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay gastos en esta categoría</p>
            </div>
          ) : (
            <div className="space-y-3">
              {categoryExpenses.map((expense) => (
                <div 
                  key={expense.id} 
                  className="bg-secondary/30 rounded-lg p-3 transition-all hover:bg-secondary/50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-sm">{expense.description}</p>
                    <div className="text-right">
                      {expense.amountUSD && (
                        <p className="text-sm font-semibold text-usd">${expense.amountUSD.toFixed(2)}</p>
                      )}
                      {expense.amountEUR && (
                        <p className="text-sm font-semibold text-eur">€{expense.amountEUR.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{format(parseISO(expense.date), "d 'de' MMMM, yyyy", { locale: es })}</span>
                  </div>
                  {expense.note && (
                    <p className="text-xs text-muted-foreground mt-1 italic">"{expense.note}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryHistoryModal;