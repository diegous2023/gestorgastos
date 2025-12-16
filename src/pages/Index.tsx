import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExpenseProvider, useExpenses } from '@/context/ExpenseContext';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import TotalCards from '@/components/TotalCards';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import ChartView from '@/components/ChartView';
import CategoryView from '@/components/CategoryView';
import SpecialNotificationModal from '@/components/SpecialNotificationModal';

const IndexContent: React.FC<{ activeTab: string; onTabChange: (tab: string) => void }> = ({ activeTab, onTabChange }) => {
  const { isLoading } = useExpenses();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header activeTab={activeTab} onTabChange={onTabChange} />
        <main className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-muted-foreground">Cargando tus gastos...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={onTabChange} />
      
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {activeTab === 'principal' && (
          <>
            <TotalCards />
            <ExpenseForm />
            <ExpenseList />
          </>
        )}
        
        {activeTab === 'graficas' && <ChartView />}
        
        {activeTab === 'categorias' && <CategoryView />}
      </main>
      
      <SpecialNotificationModal />
    </div>
  );
};

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState('principal');
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ExpenseProvider>
      <IndexContent activeTab={activeTab} onTabChange={setActiveTab} />
    </ExpenseProvider>
  );
};

export default Index;
