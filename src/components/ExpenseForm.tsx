import React, { useState, useEffect, useMemo, useRef } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useExpenses } from '@/context/ExpenseContext';
import { CATEGORIES, CategoryId, Currency, Category } from '@/types/expense';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import ExpenseSuccessModal from './ExpenseSuccessModal';
import CreateCategoryInline from './CreateCategoryInline';
import CategoryLimitAlert from './CategoryLimitAlert';

const ExpenseForm: React.FC = () => {
  const { addExpense, customCategories, addCustomCategory, deleteCustomCategory, categoryLimits, expenses } = useExpenses();
  const { toast } = useToast();
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [amountUSD, setAmountUSD] = useState('');
  const [amountEUR, setAmountEUR] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [note, setNote] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const descriptionInputRef = useRef<HTMLInputElement>(null);
  
  // Limit alert state
  const [showLimitAlert, setShowLimitAlert] = useState(false);
  const [limitAlertData, setLimitAlertData] = useState<{
    categoryName: string;
    categoryIcon: string;
    status: 'warning' | 'danger';
    percentageUsed: number;
  } | null>(null);
  const [dismissedLimits, setDismissedLimits] = useState<Set<CategoryId>>(new Set());

  const allCategories = [...CATEGORIES, ...customCategories];

  // Get unique descriptions from previous expenses for autocomplete
  const suggestionDescriptions = useMemo(() => {
    const uniqueDescriptions = [...new Set(expenses.map(exp => exp.description))];
    if (!description.trim()) return [];
    
    const filtered = uniqueDescriptions.filter(desc => 
      desc.toLowerCase().includes(description.toLowerCase()) && 
      desc.toLowerCase() !== description.toLowerCase()
    );
    
    return filtered.slice(0, 5);
  }, [expenses, description]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (descriptionInputRef.current && !descriptionInputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currencies: { value: Currency; label: string }[] = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'BOTH', label: 'USD + EUR' },
  ];

  // Calculate current month spending for a category
  const getCategoryMonthlySpending = (categoryId: CategoryId) => {
    const now = new Date();
    const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');
    
    const monthlyExpenses = expenses.filter(
      exp => exp.category === categoryId && exp.date >= monthStart && exp.date <= monthEnd
    );
    
    const totalUSD = monthlyExpenses.reduce((sum, exp) => sum + (exp.amountUSD || 0), 0);
    const totalEUR = monthlyExpenses.reduce((sum, exp) => sum + (exp.amountEUR || 0), 0);
    
    return { usd: totalUSD, eur: totalEUR };
  };

  // Check limit status for a category
  const checkCategoryLimitStatus = (categoryId: CategoryId): { status: 'ok' | 'warning' | 'danger'; percentage: number } | null => {
    const limit = categoryLimits.find(l => l.categoryId === categoryId);
    if (!limit) return null;
    
    const spending = getCategoryMonthlySpending(categoryId);
    
    let percentage = 0;
    
    if (limit.currency === 'USD' && limit.limitUSD && limit.limitUSD > 0) {
      percentage = (spending.usd / limit.limitUSD) * 100;
    } else if (limit.currency === 'EUR' && limit.limitEUR && limit.limitEUR > 0) {
      percentage = (spending.eur / limit.limitEUR) * 100;
    } else if (limit.currency === 'BOTH') {
      const usdPercentage = limit.limitUSD && limit.limitUSD > 0 ? (spending.usd / limit.limitUSD) * 100 : 0;
      const eurPercentage = limit.limitEUR && limit.limitEUR > 0 ? (spending.eur / limit.limitEUR) * 100 : 0;
      percentage = Math.max(usdPercentage, eurPercentage);
    }
    
    if (percentage >= 100) {
      return { status: 'danger', percentage };
    } else if (percentage >= 75) {
      return { status: 'warning', percentage };
    }
    
    return { status: 'ok', percentage };
  };

  // Handle category selection with limit check
  const handleCategorySelect = (cat: Category) => {
    setCategory(cat.id);
    
    // Check if already dismissed
    if (dismissedLimits.has(cat.id)) return;
    
    const limitStatus = checkCategoryLimitStatus(cat.id);
    
    if (limitStatus && (limitStatus.status === 'warning' || limitStatus.status === 'danger')) {
      setLimitAlertData({
        categoryName: cat.name,
        categoryIcon: cat.icon,
        status: limitStatus.status,
        percentageUsed: limitStatus.percentage,
      });
      setShowLimitAlert(true);
    }
  };

  const handleLimitAlertClose = () => {
    setShowLimitAlert(false);
    if (category) {
      setDismissedLimits(prev => new Set(prev).add(category));
    }
  };

  // Reset dismissed limits when categoryLimits change (user resets limit)
  useEffect(() => {
    setDismissedLimits(new Set());
  }, [categoryLimits]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast({ title: 'Error', description: 'Ingresa una descripción', variant: 'destructive' });
      return;
    }
    
    if (!category) {
      toast({ title: 'Error', description: 'Selecciona una categoría', variant: 'destructive' });
      return;
    }

    const parsedUSD = parseFloat(amountUSD) || 0;
    const parsedEUR = parseFloat(amountEUR) || 0;

    if (currency === 'USD' && parsedUSD <= 0) {
      toast({ title: 'Error', description: 'Ingresa un monto válido en USD', variant: 'destructive' });
      return;
    }
    if (currency === 'EUR' && parsedEUR <= 0) {
      toast({ title: 'Error', description: 'Ingresa un monto válido en EUR', variant: 'destructive' });
      return;
    }
    if (currency === 'BOTH' && parsedUSD <= 0 && parsedEUR <= 0) {
      toast({ title: 'Error', description: 'Ingresa al menos un monto', variant: 'destructive' });
      return;
    }

    const success = await addExpense({
      description: description.trim(),
      category,
      currency,
      amountUSD: parsedUSD > 0 ? parsedUSD : undefined,
      amountEUR: parsedEUR > 0 ? parsedEUR : undefined,
      date: format(date, 'yyyy-MM-dd'),
      note: note.trim() || undefined,
    });

    if (success) {
      setDescription('');
      setCategory(null);
      setAmountUSD('');
      setAmountEUR('');
      setNote('');
      setDate(new Date());
      setShowSuccessModal(true);
    }
  };

  return (
    <>
      <div className="glass-card p-4 animate-slide-up">
        <h2 className="font-display text-lg font-semibold mb-3">Registrar Gasto</h2>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative" ref={descriptionInputRef}>
            <Input
              placeholder="Descripción"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="bg-secondary/50 border-border"
            />
            {showSuggestions && suggestionDescriptions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                {suggestionDescriptions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setDescription(suggestion);
                      setShowSuggestions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Categoría</p>
            <div className="grid grid-cols-4 gap-2">
              {allCategories.map((cat) => {
                const isCustomCategory = customCategories.some((c) => c.id === cat.id);

                return (
                  <div key={cat.id} className="relative">
                    <button
                      type="button"
                      onClick={() => handleCategorySelect(cat)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200",
                        category === cat.id
                          ? "bg-primary/20 border-2 border-primary"
                          : "bg-secondary/50 border-2 border-transparent hover:bg-secondary"
                      )}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-xs font-medium truncate w-full text-center">{cat.name}</span>
                    </button>

                    {isCustomCategory && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            type="button"
                            onClick={(e) => e.stopPropagation()}
                            className="absolute -top-1 -right-1 p-1.5 rounded-full bg-destructive/10 hover:bg-destructive/20 transition-colors"
                            aria-label={`Eliminar categoría ${cat.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card border-border">
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                            <AlertDialogDescription>
                              ¿Seguro que deseas eliminar "{cat.name}"? Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={async (e) => {
                                e.stopPropagation();
                                await deleteCustomCategory(cat.id);
                                if (category === cat.id) setCategory(null);
                              }}
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                );
              })}
              {/* Create category button - always at the end */}
              <CreateCategoryInline
                onCreateCategory={addCustomCategory}
                onCategoryCreated={(id) => setCategory(id)}
                existingCategories={allCategories.map(c => c.id)}
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Moneda</p>
            <div className="flex gap-2">
              {currencies.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCurrency(c.value)}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all duration-200",
                    currency === c.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-secondary-foreground hover:bg-secondary"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(currency === 'USD' || currency === 'BOTH') && (
              <Input
                type="number"
                step="0.01"
                placeholder="Monto USD"
                value={amountUSD}
                onChange={(e) => setAmountUSD(e.target.value)}
                className="bg-secondary/50 border-border"
              />
            )}
            {(currency === 'EUR' || currency === 'BOTH') && (
              <Input
                type="number"
                step="0.01"
                placeholder="Monto EUR"
                value={amountEUR}
                onChange={(e) => setAmountEUR(e.target.value)}
                className="bg-secondary/50 border-border"
              />
            )}
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal bg-secondary/50 border-border"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, 'PPP', { locale: es })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <Input
            placeholder="Nota (opcional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="bg-secondary/50 border-border"
          />

          <Button type="submit" className="w-full btn-primary">
            <Heart className="w-4 h-4 mr-2" />
            Registrar sin culpa
          </Button>
        </form>
      </div>

      <ExpenseSuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
      />

      {limitAlertData && (
        <CategoryLimitAlert
          isOpen={showLimitAlert}
          onClose={handleLimitAlertClose}
          categoryName={limitAlertData.categoryName}
          categoryIcon={limitAlertData.categoryIcon}
          status={limitAlertData.status}
          percentageUsed={limitAlertData.percentageUsed}
        />
      )}
    </>
  );
};

export default ExpenseForm;