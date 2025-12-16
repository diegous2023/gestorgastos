import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExpenseProvider } from '@/context/ExpenseContext';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import TotalCards from '@/components/TotalCards';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import ChartView from '@/components/ChartView';
import CategoryView from '@/components/CategoryView';
import SpecialNotificationModal from '@/components/SpecialNotificationModal';

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
      <div className="min-h-screen bg-background">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
        
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
    </ExpenseProvider>
  );
};

export default Index;
