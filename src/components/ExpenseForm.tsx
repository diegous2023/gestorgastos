import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Heart, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { useExpenses } from '@/context/ExpenseContext';
import { CATEGORIES, CategoryId, Currency } from '@/types/expense';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import ExpenseSuccessModal from './ExpenseSuccessModal';
import CreateCategoryModal from './CreateCategoryModal';

interface BreakdownItem {
  id: string;
  description: string;
  category: CategoryId | null;
  amountUSD: string;
  amountEUR: string;
}

const ExpenseForm: React.FC = () => {
  const { addExpense, customCategories } = useExpenses();
  const { toast } = useToast();
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [amountUSD, setAmountUSD] = useState('');
  const [amountEUR, setAmountEUR] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [note, setNote] = useState('');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [breakdownItems, setBreakdownItems] = useState<BreakdownItem[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const allCategories = [...CATEGORIES, ...customCategories];

  const currencies: { value: Currency; label: string }[] = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'BOTH', label: 'USD + EUR' },
  ];

  const addBreakdownItem = () => {
    setBreakdownItems(prev => [...prev, {
      id: Date.now().toString(),
      description: '',
      category: null,
      amountUSD: '',
      amountEUR: '',
    }]);
  };

  const updateBreakdownItem = (id: string, field: keyof BreakdownItem, value: string | CategoryId | null) => {
    setBreakdownItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeBreakdownItem = (id: string) => {
    setBreakdownItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (showBreakdown && breakdownItems.length > 0) {
      // Handle breakdown submission
      for (const item of breakdownItems) {
        if (!item.description.trim()) {
          toast({ title: 'Error', description: 'Ingresa descripción para todos los gastos desglosados', variant: 'destructive' });
          return;
        }
        if (!item.category) {
          toast({ title: 'Error', description: 'Selecciona categoría para todos los gastos desglosados', variant: 'destructive' });
          return;
        }
        const parsedUSD = parseFloat(item.amountUSD) || 0;
        const parsedEUR = parseFloat(item.amountEUR) || 0;
        if (currency === 'USD' && parsedUSD <= 0) {
          toast({ title: 'Error', description: 'Ingresa montos válidos para todos los gastos', variant: 'destructive' });
          return;
        }
        if (currency === 'EUR' && parsedEUR <= 0) {
          toast({ title: 'Error', description: 'Ingresa montos válidos para todos los gastos', variant: 'destructive' });
          return;
        }
        if (currency === 'BOTH' && parsedUSD <= 0 && parsedEUR <= 0) {
          toast({ title: 'Error', description: 'Ingresa montos válidos para todos los gastos', variant: 'destructive' });
          return;
        }
      }

      // Add all breakdown items as separate expenses
      let allSuccess = true;
      for (const item of breakdownItems) {
        const success = await addExpense({
          description: item.description.trim(),
          category: item.category!,
          currency,
          amountUSD: parseFloat(item.amountUSD) || undefined,
          amountEUR: parseFloat(item.amountEUR) || undefined,
          date: format(date, 'yyyy-MM-dd'),
          note: note.trim() || undefined,
        });
        if (!success) allSuccess = false;
      }

      if (allSuccess) {
        setBreakdownItems([]);
        setShowBreakdown(false);
        setNote('');
        setDate(new Date());
        setShowSuccessModal(true);
      }
    } else {
      // Normal single expense
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
        // Reset form
        setDescription('');
        setCategory(null);
        setAmountUSD('');
        setAmountEUR('');
        setNote('');
        setDate(new Date());
        setShowSuccessModal(true);
      }
    }
  };

  const toggleBreakdown = (checked: boolean) => {
    setShowBreakdown(checked);
    if (checked && breakdownItems.length === 0) {
      addBreakdownItem();
    }
  };

  return (
    <>
      <div className="glass-card p-5 animate-slide-up">
        <h2 className="font-display text-lg font-semibold mb-4">Registrar Gasto</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!showBreakdown && (
            <>
              <Input
                placeholder="Descripción"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-secondary/50 border-border"
              />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Categoría</p>
                <div className="grid grid-cols-3 gap-2">
                  {allCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-200",
                        category === cat.id
                          ? "bg-primary/20 border-2 border-primary"
                          : "bg-secondary/50 border-2 border-transparent hover:bg-secondary"
                      )}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-xs font-medium">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

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

          {!showBreakdown && (
            <div className="grid grid-cols-2 gap-3">
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
          )}

          {/* Breakdown toggle */}
          <div className="flex items-center space-x-2 p-3 bg-secondary/30 rounded-lg">
            <Checkbox
              id="breakdown"
              checked={showBreakdown}
              onCheckedChange={toggleBreakdown}
            />
            <label
              htmlFor="breakdown"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Desglosar gasto
            </label>
            {showBreakdown ? (
              <ChevronUp className="w-4 h-4 ml-auto text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-auto text-muted-foreground" />
            )}
          </div>

          {/* Breakdown items */}
          {showBreakdown && (
            <div className="space-y-4 p-4 bg-secondary/20 rounded-lg border border-border">
              <p className="text-sm font-medium text-muted-foreground">Divide tu gasto en diferentes categorías:</p>
              
              {breakdownItems.map((item, index) => (
                <div key={item.id} className="space-y-3 p-3 bg-background/50 rounded-lg border border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Gasto #{index + 1}</span>
                    {breakdownItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBreakdownItem(item.id)}
                        className="p-1 hover:bg-destructive/20 rounded text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <Input
                    placeholder="Descripción"
                    value={item.description}
                    onChange={(e) => updateBreakdownItem(item.id, 'description', e.target.value)}
                    className="bg-secondary/50 border-border"
                  />

                  <div className="grid grid-cols-4 gap-1.5 max-h-[120px] overflow-y-auto">
                    {allCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => updateBreakdownItem(item.id, 'category', cat.id)}
                        className={cn(
                          "flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all duration-200",
                          item.category === cat.id
                            ? "bg-primary/20 border-2 border-primary"
                            : "bg-secondary/50 border-2 border-transparent hover:bg-secondary"
                        )}
                      >
                        <span className="text-sm">{cat.icon}</span>
                        <span className="text-[10px] font-medium truncate w-full text-center">{cat.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {(currency === 'USD' || currency === 'BOTH') && (
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="USD"
                        value={item.amountUSD}
                        onChange={(e) => updateBreakdownItem(item.id, 'amountUSD', e.target.value)}
                        className="bg-secondary/50 border-border text-sm"
                      />
                    )}
                    {(currency === 'EUR' || currency === 'BOTH') && (
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="EUR"
                        value={item.amountEUR}
                        onChange={(e) => updateBreakdownItem(item.id, 'amountEUR', e.target.value)}
                        className="bg-secondary/50 border-border text-sm"
                      />
                    )}
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addBreakdownItem}
                className="w-full"
              >
                + Agregar otro gasto
              </Button>
            </div>
          )}

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
    </>
  );
};

export default ExpenseForm;