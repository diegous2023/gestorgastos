import React from 'react';
import logo from '@/assets/logo.jpg';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from './NotificationBell';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();
  
  const tabs = [
    { id: 'principal', label: 'Principal' },
    { id: 'graficas', label: 'Gráficas' },
    { id: 'categorias', label: 'Categorías' },
    { id: 'analisis', label: '¿En qué gasto más?' },
  ];

  const handleUpdateApp = () => {
    window.location.reload();
    toast({ title: "App actualizada", description: "La aplicación se ha actualizado correctamente" });
  };

  return (
    <header className="sticky top-0 z-50 w-full py-4 px-4 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md">
              <img 
                src={logo} 
                alt="Gestor de Gastos" 
                className="w-full h-full object-cover"
                style={{ mixBlendMode: 'multiply' }}
              />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold gradient-text">
                Bienvenido, {user?.name || 'Usuario'}
              </h1>
              <p className="text-xs text-muted-foreground">
                Controla tu dinero o él te controlará a ti 🚀
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleUpdateApp}
              className="hidden sm:flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar App
            </Button>
            <NotificationBell />
            <Button variant="ghost" size="sm" onClick={logout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
        
        <nav className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg' 
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