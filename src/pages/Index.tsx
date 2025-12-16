import React, { useState } from 'react';
import { ExpenseProvider } from '@/context/ExpenseContext';
import Header from '@/components/Header';
import TotalCards from '@/components/TotalCards';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import ChartView from '@/components/ChartView';
import CategoryView from '@/components/CategoryView';

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState('principal');

  return (
    <ExpenseProvider>
      <div className="min-h-screen bg-background">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
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
      </div>
    </ExpenseProvider>
  );
};

export default Index;
