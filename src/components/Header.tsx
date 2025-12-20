import React, { useEffect, useState } from 'react';
import logo from '@/assets/logo.jpg';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from './NotificationBell';
import FinanceQuotes from './FinanceQuotes';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  
  const mainTabs = [
    { id: 'principal', label: 'Principal' },
    { id: 'graficas', label: 'Gráficas' },
    { id: 'categorias', label: 'Categorías' },
  ];

  // Listen for service worker updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        setSwRegistration(registration);
      });
    }
  }, []);

  const handleUpdateApp = async () => {
    try {
      // Check for new service worker and skip waiting
      if (swRegistration) {
        await swRegistration.update();
        
        if (swRegistration.waiting) {
          // Tell the waiting service worker to activate
          swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      }
      
      // Clear caches and reload
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      toast({ title: "Actualizando...", description: "La aplicación se está actualizando" });
      
      // Force reload from server
      setTimeout(() => {
        window.location.reload();
      }, 300);
    } catch (error) {
      console.error('Error updating app:', error);
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Primera fila: Logo + nombre */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md flex-shrink-0">
            <img
              src={logo}
              alt="Gestor de Gastos"
              className="w-full h-full object-cover"
              style={{ mixBlendMode: 'multiply' }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-lg font-bold gradient-text truncate">Bienvenido, {user?.name || 'Usuario'}</h1>
            <p className="text-xs text-muted-foreground truncate">Controla tu dinero o él te controlará a ti 🚀</p>
          </div>
        </div>

        {/* Segunda fila: Botones de acción */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUpdateApp}
            className="flex items-center gap-1 text-xs px-2 py-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refrescar</span>
          </Button>
          
          <div className="flex items-center gap-1">
            <NotificationBell />
            <Button variant="ghost" size="sm" onClick={logout} className="text-xs px-2 py-1">
              Salir
            </Button>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {/* Main tabs row */}
          <div className="flex gap-2">
            {mainTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Analysis tab - full width below */}
          <button
            onClick={() => onTabChange('analisis')}
            className={`
              w-full px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300
              ${activeTab === 'analisis'
                ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }
            `}
          >
            ¿En qué gasto más?
          </button>
        </nav>

        {/* Quote bar (queda fija porque el header es sticky) */}
        <div className="mt-3">
          <FinanceQuotes />
        </div>
      </div>
    </header>
  );
};

export default Header;