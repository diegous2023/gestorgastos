import React, { useState } from 'react';
import { Target } from 'lucide-react';
import { useExpenses } from '@/context/ExpenseContext';
import { CATEGORIES, CategoryId, Currency, Category } from '@/types/expense';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import CategoryHistoryModal from './CategoryHistoryModal';
import CreateCategoryModal from './CreateCategoryModal';

const CategoryView: React.FC = () => {
  const { getTotalsByCategory, categoryLimits, setCategoryLimit, customCategories, addCustomCategory } = useExpenses();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [limitCurrency, setLimitCurrency] = useState<Currency>('USD');
  const [limitUSD, setLimitUSD] = useState('');
  const [limitEUR, setLimitEUR] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [historyCategory, setHistoryCategory] = useState<CategoryId | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const allCategories = [...CATEGORIES, ...customCategories];

  const getLimit = (categoryId: CategoryId) => {
    return categoryLimits.find(l => l.categoryId === categoryId);
  };

  const getProgressPercentage = (spent: number, limit: number) => {
    if (limit <= 0) return 0;
    return Math.min((spent / limit) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-destructive';
    if (percentage >= 70) return 'bg-warning';
    return 'bg-primary';
  };

  const getStatusMessage = (spent: number, limit: number) => {
    const remaining = limit - spent;
    if (remaining < 0) {
      return { text: `¡Excedido por $${Math.abs(remaining).toFixed(2)}!`, type: 'danger' };
    }
    if (remaining <= limit * 0.3) {
      return { text: `Quedan $${remaining.toFixed(2)}`, type: 'warning' };
    }
    return null;
  };

  const handleSetLimit = async () => {
    if (!selectedCategory) return;

    const usd = parseFloat(limitUSD) || 0;
    const eur = parseFloat(limitEUR) || 0;

    if (limitCurrency === 'USD' && usd <= 0) {
      toast({ title: 'Error', description: 'Ingresa un límite válido', variant: 'destructive' });
      return;
    }
    if (limitCurrency === 'EUR' && eur <= 0) {
      toast({ title: 'Error', description: 'Ingresa un límite válido', variant: 'destructive' });
      return;
    }
    if (limitCurrency === 'BOTH' && usd <= 0 && eur <= 0) {
      toast({ title: 'Error', description: 'Ingresa al menos un límite', variant: 'destructive' });
      return;
    }

    await setCategoryLimit({
      categoryId: selectedCategory,
      currency: limitCurrency,
      limitUSD: usd > 0 ? usd : undefined,
      limitEUR: eur > 0 ? eur : undefined,
    });

    setDialogOpen(false);
    setLimitUSD('');
    setLimitEUR('');
    setSelectedCategory(null);
  };

  const handleCategoryClick = (categoryId: CategoryId) => {
    setHistoryCategory(categoryId);
    setHistoryOpen(true);
  };

  const currencies: { value: Currency; label: string }[] = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'BOTH', label: 'USD + EUR' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full btn-primary">
            <Target className="w-4 h-4 mr-2" />
            Establecer Límite
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display">Establecer Límite</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Categoría</p>
              <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
                {allCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200",
                      selectedCategory === cat.id
                        ? "bg-primary/20 border-2 border-primary"
                        : "bg-secondary/50 border-2 border-transparent hover:bg-secondary"
                    )}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-xs font-medium">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Moneda</p>
              <div className="flex gap-2">
                {currencies.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setLimitCurrency(c.value)}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all duration-200",
                      limitCurrency === c.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/50 text-secondary-foreground hover:bg-secondary"
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(limitCurrency === 'USD' || limitCurrency === 'BOTH') && (
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Límite USD"
                  value={limitUSD}
                  onChange={(e) => setLimitUSD(e.target.value)}
                  className="bg-secondary/50 border-border"
                />
              )}
              {(limitCurrency === 'EUR' || limitCurrency === 'BOTH') && (
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Límite EUR"
                  value={limitEUR}
                  onChange={(e) => setLimitEUR(e.target.value)}
                  className="bg-secondary/50 border-border"
                />
              )}
            </div>

            <Button onClick={handleSetLimit} className="w-full btn-primary">
              Guardar Límite
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {allCategories.map((category, index) => {
          const totals = getTotalsByCategory(category.id);
          const limit = getLimit(category.id);
          
          return (
            <div 
              key={category.id} 
              className="category-card"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => handleCategoryClick(category.id)}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{category.icon}</span>
                <div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">Toca para ver historial</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>USD: <span className="text-usd font-semibold">${totals.usd.toFixed(2)}</span></span>
                  <span>EUR: <span className="text-eur font-semibold">€{totals.eur.toFixed(2)}</span></span>
                </div>

                {limit && (
                  <div className="space-y-2 pt-2 border-t border-border" onClick={(e) => e.stopPropagation()}>
                    {limit.limitUSD && (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Límite USD</span>
                          <span>${limit.limitUSD.toFixed(2)}</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className={cn("progress-fill", getProgressColor(getProgressPercentage(totals.usd, limit.limitUSD)))}
                            style={{ width: `${getProgressPercentage(totals.usd, limit.limitUSD)}%` }}
                          />
                        </div>
                        {getStatusMessage(totals.usd, limit.limitUSD)?.type === 'danger' && (
                          <p className="text-xs text-destructive mt-1 font-medium">
                            {getStatusMessage(totals.usd, limit.limitUSD)?.text}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {limit.limitEUR && (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Límite EUR</span>
                          <span>€{limit.limitEUR.toFixed(2)}</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className={cn("progress-fill", getProgressColor(getProgressPercentage(totals.eur, limit.limitEUR)))}
                            style={{ width: `${getProgressPercentage(totals.eur, limit.limitEUR)}%` }}
                          />
                        </div>
                        {getStatusMessage(totals.eur, limit.limitEUR)?.type === 'danger' && (
                          <p className="text-xs text-destructive mt-1 font-medium">
                            {getStatusMessage(totals.eur, limit.limitEUR)?.text}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Create Category Card */}
        <CreateCategoryModal 
          onCreateCategory={addCustomCategory}
          existingCategories={allCategories.map(c => c.id)}
        />
      </div>

      {/* History Modal */}
      <CategoryHistoryModal 
        categoryId={historyCategory}
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </div>
  );
};

export default CategoryView;