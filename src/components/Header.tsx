import React from 'react';
import logo from '@/assets/logo.jpg';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'principal', label: 'Principal' },
    { id: 'graficas', label: 'Gráficas' },
    { id: 'categorias', label: 'Categorías' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full py-4 px-4 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="Gestor de Gastos" 
              className="w-10 h-10 rounded-lg object-cover"
            />
            <h1 className="font-display text-xl font-bold gradient-text">
              Gestor de Gastos
            </h1>
          </div>
        </div>
        
        <nav className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300
                ${activeTab === tab.id 
                  ? 'bg-primary text-primary-foreground shadow-lg' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
