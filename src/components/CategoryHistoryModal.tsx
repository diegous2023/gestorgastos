import React, { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, DollarSign, Euro, ChevronDown, ChevronUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useExpenses } from '@/context/ExpenseContext';
import { CategoryId, getCategoryById } from '@/types/expense';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CategoryHistoryModalProps {
  categoryId: CategoryId | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ConceptGroup {
  description: string;
  expenses: Array<{
    id: string;
    description: string;
    category: string;
    currency: string;
    amountUSD?: number;
    amountEUR?: number;
    date: string;
    note?: string;
  }>;
  totalUSD: number;
  totalEUR: number;
  count: number;
}

const CategoryHistoryModal: React.FC<CategoryHistoryModalProps> = ({ categoryId, isOpen, onClose }) => {
  const { expenses } = useExpenses();
  const [expandedConcept, setExpandedConcept] = useState<string | null>(null);
  
  const category = useMemo(() => categoryId ? getCategoryById(categoryId) : null, [categoryId]);
  
  const categoryExpenses = useMemo(() => {
    if (!categoryId) return [];
    return expenses
      .filter(exp => exp.category === categoryId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, categoryId]);

  // Group expenses by description (concept)
  const conceptGroups = useMemo(() => {
    const groups: Record<string, ConceptGroup> = {};
    
    categoryExpenses.forEach(expense => {
      const key = expense.description.toLowerCase().trim();
      
      if (!groups[key]) {
        groups[key] = {
          description: expense.description,
          expenses: [],
          totalUSD: 0,
          totalEUR: 0,
          count: 0,
        };
      }
      
      groups[key].expenses.push(expense);
      groups[key].totalUSD += expense.amountUSD || 0;
      groups[key].totalEUR += expense.amountEUR || 0;
      groups[key].count += 1;
    });
    
    // Sort by total spending (USD + EUR combined)
    return Object.values(groups).sort((a, b) => 
      (b.totalUSD + b.totalEUR) - (a.totalUSD + a.totalEUR)
    );
  }, [categoryExpenses]);

  const totalUSD = categoryExpenses.reduce((sum, exp) => sum + (exp.amountUSD || 0), 0);
  const totalEUR = categoryExpenses.reduce((sum, exp) => sum + (exp.amountEUR || 0), 0);

  if (!categoryId || !category) return null;

  const toggleConcept = (description: string) => {
    setExpandedConcept(prev => prev === description ? null : description);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-3">
            <span className="text-3xl">{category?.icon}</span>
            <div>
              <span className="block">{category?.name}</span>
              <span className="text-sm font-normal text-muted-foreground">
                {categoryExpenses.length} gasto{categoryExpenses.length !== 1 ? 's' : ''} • {conceptGroups.length} concepto{conceptGroups.length !== 1 ? 's' : ''}
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

        {/* Concept Groups */}
        <ScrollArea className="h-[400px] pr-4">
          {conceptGroups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay gastos en esta categoría</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conceptGroups.map((group) => (
                <div 
                  key={group.description} 
                  className="bg-secondary/30 rounded-lg overflow-hidden"
                >
                  {/* Concept Header - clickable */}
                  <button
                    type="button"
                    onClick={() => toggleConcept(group.description)}
                    className="w-full p-3 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{group.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {group.count} vez{group.count !== 1 ? 'es' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        {group.totalUSD > 0 && (
                          <p className="text-sm font-semibold text-usd">${group.totalUSD.toFixed(2)}</p>
                        )}
                        {group.totalEUR > 0 && (
                          <p className="text-sm font-semibold text-eur">€{group.totalEUR.toFixed(2)}</p>
                        )}
                      </div>
                      {expandedConcept === group.description ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Detail */}
                  {expandedConcept === group.description && (
                    <div className="border-t border-border/50 bg-background/50">
                      {group.expenses.map((expense) => (
                        <div 
                          key={expense.id}
                          className="px-3 py-2 border-b border-border/30 last:border-0"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>{format(parseISO(expense.date), "d MMM yyyy", { locale: es })}</span>
                            </div>
                            <div className="text-right text-sm">
                              {expense.amountUSD && (
                                <span className="text-usd">${expense.amountUSD.toFixed(2)}</span>
                              )}
                              {expense.amountUSD && expense.amountEUR && (
                                <span className="text-muted-foreground mx-1">|</span>
                              )}
                              {expense.amountEUR && (
                                <span className="text-eur">€{expense.amountEUR.toFixed(2)}</span>
                              )}
                            </div>
                          </div>
                          {expense.note && (
                            <p className="text-xs text-muted-foreground mt-1 italic">"{expense.note}"</p>
                          )}
                        </div>
                      ))}
                    </div>
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