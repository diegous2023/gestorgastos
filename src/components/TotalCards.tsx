import React from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { DollarSign, Euro } from 'lucide-react';

const TotalCards: React.FC = () => {
  const { getTotals } = useExpenses();
  const totals = getTotals();

  return (
    <div className="grid grid-cols-2 gap-4 animate-fade-in">
      <div className="glass-card p-5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-usd/20 to-transparent opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-usd/20">
              <DollarSign className="w-4 h-4 text-usd" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total USD
            </span>
          </div>
          <p className="text-2xl font-bold text-usd">
            ${totals.usd.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="glass-card p-5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-eur/20 to-transparent opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-eur/20">
              <Euro className="w-4 h-4 text-eur" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total EUR
            </span>
          </div>
          <p className="text-2xl font-bold text-eur">
            €{totals.eur.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TotalCards;
