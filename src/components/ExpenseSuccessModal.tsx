import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';

const FINANCE_QUOTES = [
  { quote: "No guardes lo que te sobra después de gastar, gasta lo que te sobra después de guardar.", author: "Warren Buffett" },
  { quote: "El dinero es un buen sirviente, pero un mal amo.", author: "Francis Bacon" },
  { quote: "La riqueza no es tener muchas posesiones, sino pocas necesidades.", author: "Epicteto" },
  { quote: "Un presupuesto te dice qué es lo que puedes permitirte; un plan te dice cómo conseguirlo.", author: "Dave Ramsey" },
  { quote: "El mejor momento para plantar un árbol fue hace 20 años. El segundo mejor momento es ahora.", author: "Proverbio Chino" },
  { quote: "No se trata de cuánto ganas, sino de cuánto conservas.", author: "Robert Kiyosaki" },
  { quote: "Invertir en conocimiento siempre paga los mejores intereses.", author: "Benjamin Franklin" },
  { quote: "La libertad financiera es un estado mental. Comienza con creer que es posible.", author: "Suze Orman" },
  { quote: "Cuida de los pequeños gastos; un pequeño agujero hunde un barco.", author: "Benjamin Franklin" },
  { quote: "El dinero que tienes te da libertad; el dinero que persigues te esclaviza.", author: "Jean-Jacques Rousseau" },
  { quote: "No pongas todos los huevos en la misma canasta.", author: "Miguel de Cervantes" },
  { quote: "La disciplina financiera de hoy es la libertad de mañana.", author: "Anónimo" },
  { quote: "El hábito del ahorro es en sí mismo una educación.", author: "George Clason" },
  { quote: "Tu futuro depende de muchas cosas, pero principalmente de ti.", author: "Frank Tyger" },
  { quote: "El éxito financiero no es un sprint, es un maratón.", author: "Anónimo" },
];

interface ExpenseSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExpenseSuccessModal: React.FC<ExpenseSuccessModalProps> = ({ isOpen, onClose }) => {
  const [randomQuote, setRandomQuote] = useState(FINANCE_QUOTES[0]);

  useEffect(() => {
    if (isOpen) {
      setRandomQuote(FINANCE_QUOTES[Math.floor(Math.random() * FINANCE_QUOTES.length)]);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-card border-border max-w-sm" hideCloseButton>
        <div className="text-center space-y-6 py-4">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-scale-in">
            <Check className="w-8 h-8 text-primary" />
          </div>

          {/* Title */}
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Gasto registrado sin culpa
            </h2>
          </div>

          {/* Quote */}
          <div className="bg-secondary/30 rounded-lg p-4 relative">
            <Sparkles className="w-4 h-4 text-primary absolute top-3 left-3" />
            <p className="text-sm italic text-foreground leading-relaxed px-4">
              "{randomQuote.quote}"
            </p>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              — {randomQuote.author}
            </p>
          </div>

          {/* Accept Button */}
          <Button onClick={onClose} className="w-full btn-primary">
            Aceptar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseSuccessModal;