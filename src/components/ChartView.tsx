import React, { useState, useMemo } from 'react';
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Calendar, TrendingUp, DollarSign, Euro } from 'lucide-react';
import { useExpenses } from '@/context/ExpenseContext';

type ChartPeriod = 'month' | 'year' | 'day';

const ChartView: React.FC = () => {
  const { expenses, getMonthlyTotals, getYearlyTotals, getDailyTotals } = useExpenses();
  const [period, setPeriod] = useState<ChartPeriod>('month');
  const [hoveredData, setHoveredData] = useState<any>(null);

  const periods: { value: ChartPeriod; label: string; icon: React.ReactNode }[] = [
    { value: 'day', label: 'Diario', icon: <Calendar className="w-4 h-4" /> },
    { value: 'month', label: 'Mensual', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'year', label: 'Anual', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  const chartData = useMemo(() => {
    const now = new Date();
    
    if (period === 'month') {
      const data = [];
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(now, i);
        const totals = getMonthlyTotals(date.getFullYear(), date.getMonth());
        data.push({
          name: format(date, 'MMM', { locale: es }),
          fullName: format(date, 'MMMM yyyy', { locale: es }),
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
          fullName: year.toString(),
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
          name: format(day, 'dd'),
          fullName: format(day, "d 'de' MMMM", { locale: es }),
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-lg">
          <p className="font-display font-semibold text-sm mb-2">{payload[0]?.payload?.fullName}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--usd))]" />
              <span className="text-sm">USD: <span className="font-semibold text-usd">${payload[0]?.value?.toFixed(2) || '0.00'}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--eur))]" />
              <span className="text-sm">EUR: <span className="font-semibold text-eur">€{payload[1]?.value?.toFixed(2) || '0.00'}</span></span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Period Selector */}
      <div className="flex justify-center">
        <div className="inline-flex bg-secondary/50 rounded-xl p-1 gap-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300
                ${period === p.value 
                  ? 'bg-card text-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {p.icon}
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Card */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-semibold text-lg">Evolución de Gastos</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--usd))]" />
              <span className="text-muted-foreground">USD</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--eur))]" />
              <span className="text-muted-foreground">EUR</span>
            </div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUSD" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorEUR" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              vertical={false}
            />
            <XAxis 
              dataKey="name" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `$${value}`}
              dx={-5}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="USD" 
              stroke="hsl(142 71% 45%)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorUSD)" 
            />
            <Area 
              type="monotone" 
              dataKey="EUR" 
              stroke="hsl(217 91% 60%)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorEUR)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Current Month Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Este mes (USD)</span>
          </div>
          <p className="text-2xl font-bold text-usd">${monthlyTotals.usd.toFixed(2)}</p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Euro className="w-4 h-4" />
            <span className="text-sm">Este mes (EUR)</span>
          </div>
          <p className="text-2xl font-bold text-eur">€{monthlyTotals.eur.toFixed(2)}</p>
        </div>
      </div>

      {/* Month Label */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {format(new Date(), "MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>
    </div>
  );
};

export default ChartView;