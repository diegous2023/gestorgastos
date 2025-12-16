import React, { useState, useMemo } from 'react';
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useExpenses } from '@/context/ExpenseContext';

type ChartPeriod = 'month' | 'year' | 'day';

const ChartView: React.FC = () => {
  const { expenses, getMonthlyTotals, getYearlyTotals, getDailyTotals } = useExpenses();
  const [period, setPeriod] = useState<ChartPeriod>('month');

  const periods: { value: ChartPeriod; label: string }[] = [
    { value: 'month', label: 'Por Mes' },
    { value: 'year', label: 'Por Año' },
    { value: 'day', label: 'Por Día' },
  ];

  const chartData = useMemo(() => {
    const now = new Date();
    
    if (period === 'month') {
      const data = [];
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(now, i);
        const totals = getMonthlyTotals(date.getFullYear(), date.getMonth());
        data.push({
          name: format(date, 'MMM yyyy', { locale: es }).toUpperCase(),
          USD: totals.usd,
          EUR: totals.eur,
        });
      }
      return data;
    }
    
    if (period === 'year') {
      const data = [];
      const currentYear = now.getFullYear();
      for (let year = currentYear - 2; year <= currentYear; year++) {
        const totals = getYearlyTotals(year);
        data.push({
          name: year.toString(),
          USD: totals.usd,
          EUR: totals.eur,
        });
      }
      return data;
    }
    
    if (period === 'day') {
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      const days = eachDayOfInterval({ start, end });
      
      return days.slice(0, 15).map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const totals = getDailyTotals(dateStr);
        return {
          name: format(day, 'dd', { locale: es }),
          USD: totals.usd,
          EUR: totals.eur,
        };
      });
    }
    
    return [];
  }, [period, expenses, getMonthlyTotals, getYearlyTotals, getDailyTotals]);

  const monthlyTotals = useMemo(() => {
    const now = new Date();
    return getMonthlyTotals(now.getFullYear(), now.getMonth());
  }, [getMonthlyTotals, expenses]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex gap-2 justify-center">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300
              ${period === p.value 
                ? 'bg-primary text-primary-foreground shadow-lg' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }
            `}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="glass-card p-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 22%)" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: 'hsl(215 20% 65%)', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(217 33% 22%)' }}
            />
            <YAxis 
              tick={{ fill: 'hsl(215 20% 65%)', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(217 33% 22%)' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(222 47% 14%)',
                border: '1px solid hsl(217 33% 22%)',
                borderRadius: '8px',
                color: 'hsl(210 40% 98%)',
              }}
              formatter={(value: number, name: string) => [
                `${name === 'USD' ? '$' : '€'}${value.toFixed(2)}`,
                name === 'USD' ? 'USD ($)' : 'EUR (€)'
              ]}
            />
            <Legend 
              formatter={(value) => value === 'USD' ? 'USD ($)' : 'EUR (€)'}
            />
            <Bar dataKey="USD" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="EUR" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card p-5">
        <h3 className="font-display font-semibold mb-2">
          {format(new Date(), 'MMMM yyyy', { locale: es }).toUpperCase()}
        </h3>
        <p className="text-muted-foreground">
          USD: <span className="text-usd font-semibold">${monthlyTotals.usd.toFixed(2)}</span>
          {' | '}
          EUR: <span className="text-eur font-semibold">€{monthlyTotals.eur.toFixed(2)}</span>
        </p>
      </div>
    </div>
  );
};

export default ChartView;
