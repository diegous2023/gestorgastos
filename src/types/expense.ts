export type Currency = 'USD' | 'EUR' | 'BOTH';

export type CategoryId = 
  | 'comida' 
  | 'transporte' 
  | 'ropa' 
  | 'entretenimiento' 
  | 'salud' 
  | 'educacion' 
  | 'hogar' 
  | 'servicios' 
  | 'otros';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
}

export interface Expense {
  id: string;
  description: string;
  category: CategoryId;
  amountUSD?: number;
  amountEUR?: number;
  currency: Currency;
  date: string;
  note?: string;
}

export interface CategoryLimit {
  categoryId: CategoryId;
  limitUSD?: number;
  limitEUR?: number;
  currency: Currency;
}

export const CATEGORIES: Category[] = [
  { id: 'comida', name: 'Comida', icon: '🍽️', color: 'hsl(142 71% 45%)' },
  { id: 'transporte', name: 'Transporte', icon: '🚗', color: 'hsl(217 91% 60%)' },
  { id: 'ropa', name: 'Ropa', icon: '👕', color: 'hsl(280 87% 65%)' },
  { id: 'entretenimiento', name: 'Entretenimiento', icon: '🎮', color: 'hsl(38 92% 50%)' },
  { id: 'salud', name: 'Salud', icon: '❤️', color: 'hsl(0 72% 51%)' },
  { id: 'educacion', name: 'Educación', icon: '📚', color: 'hsl(168 76% 42%)' },
  { id: 'hogar', name: 'Hogar', icon: '🏠', color: 'hsl(25 95% 53%)' },
  { id: 'servicios', name: 'Servicios', icon: '📱', color: 'hsl(262 83% 58%)' },
  { id: 'otros', name: 'Otros', icon: '📦', color: 'hsl(215 20% 65%)' },
];

export const getCategoryById = (id: CategoryId): Category | undefined => 
  CATEGORIES.find(cat => cat.id === id);
