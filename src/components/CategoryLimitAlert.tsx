import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp } from 'lucide-react';

interface CategoryLimitAlertProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  categoryIcon: string;
  status: 'warning' | 'danger';
  percentageUsed: number;
}

const CategoryLimitAlert: React.FC<CategoryLimitAlertProps> = ({
  isOpen,
  onClose,
  categoryName,
  categoryIcon,
  status,
  percentageUsed,
}) => {
  const isWarning = status === 'warning';
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-card border-border max-w-sm mx-auto">
        <AlertDialogHeader className="text-center space-y-4">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
            isWarning 
              ? 'bg-amber-500/10' 
              : 'bg-destructive/10'
          }`}>
            {isWarning ? (
              <TrendingUp className="w-8 h-8 text-amber-500" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-destructive" />
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">{categoryIcon}</span>
              <AlertDialogTitle className="text-lg font-semibold">
                {categoryName}
              </AlertDialogTitle>
            </div>
            
            <AlertDialogDescription className="text-base">
              {isWarning ? (
                <>
                  Estás <span className="font-semibold text-amber-500">cerca de alcanzar</span> el límite establecido para esta categoría.
                </>
              ) : (
                <>
                  {percentageUsed >= 100 ? (
                    <>
                      Ya <span className="font-semibold text-destructive">excediste</span> el límite establecido para esta categoría.
                    </>
                  ) : (
                    <>
                      Ya <span className="font-semibold text-destructive">alcanzaste</span> el límite establecido para esta categoría.
                    </>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </div>

          {/* Progress indicator */}
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                isWarning ? 'bg-amber-500' : 'bg-destructive'
              }`}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
          <p className={`text-sm font-medium ${
            isWarning ? 'text-amber-500' : 'text-destructive'
          }`}>
            {percentageUsed.toFixed(0)}% utilizado
          </p>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="mt-4">
          <Button 
            onClick={onClose} 
            className={`w-full ${
              isWarning 
                ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                : 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
            }`}
          >
            Estoy consciente 😔
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CategoryLimitAlert;
