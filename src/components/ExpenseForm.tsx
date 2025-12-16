import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useExpenses } from '@/context/ExpenseContext';
import { CATEGORIES, CategoryId, Currency } from '@/types/expense';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const ExpenseForm: React.FC = () => {
  const { addExpense } = useExpenses();
  const { toast } = useToast();
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [amountUSD, setAmountUSD] = useState('');
  const [amountEUR, setAmountEUR] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [note, setNote] = useState('');

  const currencies: { value: Currency; label: string }[] = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'BOTH', label: 'USD + EUR' },
  ];

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

    await addExpense({
      description: description.trim(),
      category,
      currency,
      amountUSD: parsedUSD > 0 ? parsedUSD : undefined,
      amountEUR: parsedEUR > 0 ? parsedEUR : undefined,
      date: format(date, 'yyyy-MM-dd'),
      note: note.trim() || undefined,
    });

    // Reset form
    setDescription('');
    setCategory(null);
    setAmountUSD('');
    setAmountEUR('');
    setNote('');
    setDate(new Date());
  };

  return (
    <div className="glass-card p-5 animate-slide-up">
      <h2 className="font-display text-lg font-semibold mb-4">Registrar Gasto</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-secondary/50 border-border"
        />

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Categoría</p>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
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
          <Plus className="w-4 h-4 mr-2" />
          Agregar Gasto
        </Button>
      </form>
    </div>
  );
};

export default ExpenseForm;
