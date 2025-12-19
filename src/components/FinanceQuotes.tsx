import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

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

const FinanceQuotes: React.FC = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Start with a random quote
    setCurrentQuoteIndex(Math.floor(Math.random() * FINANCE_QUOTES.length));

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % FINANCE_QUOTES.length);
        setIsAnimating(false);
      }, 300);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const currentQuote = FINANCE_QUOTES[currentQuoteIndex];

  return (
    <div className="glass-card p-4 mb-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-50" />
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className={`flex-1 transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
          <p className="text-sm italic text-foreground leading-relaxed">
            "{currentQuote.quote}"
          </p>
          <p className="text-xs text-muted-foreground mt-2 font-medium">
            — {currentQuote.author}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinanceQuotes;