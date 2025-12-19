import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useExpenses } from '@/context/ExpenseContext';
import { CATEGORIES, CategoryId } from '@/types/expense';

const SpendingAnalysis: React.FC = () => {
  const { expenses, getTotalsByCategory } = useExpenses();

  const chartData = useMemo(() => {
    const data = CATEGORIES.map(cat => {
      const totals = getTotalsByCategory(cat.id);
      return {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        usd: totals.usd,
        eur: totals.eur,
        total: totals.usd + totals.eur, // Combined for sorting
      };
    }).filter(item => item.total > 0);

    return data.sort((a, b) => b.total - a.total);
  }, [expenses, getTotalsByCategory]);

  const topCategories = chartData.slice(0, 5);
  const totalSpentUSD = chartData.reduce((sum, item) => sum + item.usd, 0);
  const totalSpentEUR = chartData.reduce((sum, item) => sum + item.eur, 0);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-muted-foreground">Aún no tienes gastos registrados</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Gastado USD</p>
          <p className="text-2xl font-bold text-usd">${totalSpentUSD.toFixed(2)}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Gastado EUR</p>
          <p className="text-2xl font-bold text-eur">€{totalSpentEUR.toFixed(2)}</p>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold mb-4 text-center">Distribución de Gastos</h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={100}
              innerRadius={40}
              fill="#8884d8"
              dataKey="total"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold flex items-center gap-2">
                        <span>{data.icon}</span>
                        {data.name}
                      </p>
                      <p className="text-sm text-usd">USD: ${data.usd.toFixed(2)}</p>
                      <p className="text-sm text-eur">EUR: €{data.eur.toFixed(2)}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top Categories */}
      <div className="glass-card p-5">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Top Categorías de Gasto
        </h3>
        <div className="space-y-3">
          {topCategories.map((cat, index) => {
            const percentUSD = totalSpentUSD > 0 ? (cat.usd / totalSpentUSD) * 100 : 0;
            const percentEUR = totalSpentEUR > 0 ? (cat.eur / totalSpentEUR) * 100 : 0;
            
            return (
              <div key={cat.id} className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold"
                  style={{ backgroundColor: `${cat.color}20` }}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium flex items-center gap-2">
                      <span>{cat.icon}</span>
                      {cat.name}
                    </span>
                    <div className="text-right text-sm">
                      {cat.usd > 0 && <span className="text-usd">${cat.usd.toFixed(2)}</span>}
                      {cat.usd > 0 && cat.eur > 0 && <span className="text-muted-foreground mx-1">|</span>}
                      {cat.eur > 0 && <span className="text-eur">€{cat.eur.toFixed(2)}</span>}
                    </div>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.max(percentUSD, percentEUR)}%`,
                        backgroundColor: cat.color
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="glass-card p-4">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Todas las categorías</h4>
        <div className="flex flex-wrap gap-2">
          {chartData.map(cat => (
            <div 
              key={cat.id}
              className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full text-sm"
            >
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpendingAnalysis;