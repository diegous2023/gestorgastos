import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import logo from '@/assets/logo.jpg';
import { toast } from '@/hooks/use-toast';

const financialQuotes = [
  "El dinero es un excelente sirviente, pero un pésimo amo.",
  "No ahorres lo que queda después de gastar, gasta lo que queda después de ahorrar.",
  "La riqueza no es tener muchas posesiones, sino tener pocas necesidades.",
  "Un peso ahorrado es un peso ganado.",
  "La libertad financiera comienza con el primer paso del ahorro.",
  "Controla tu dinero o él te controlará a ti.",
  "Las metas financieras se logran un día a la vez.",
  "Invertir en ti mismo es la mejor inversión.",
  "El éxito financiero requiere disciplina y paciencia.",
  "Cada gasto es una decisión sobre tu futuro.",
  "La planificación financiera es el mapa hacia tus sueños.",
  "Tu relación con el dinero refleja tu relación contigo mismo.",
];

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [currentQuote, setCurrentQuote] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuote((prev) => (prev + 1) % financialQuotes.length);
        setIsAnimating(false);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu correo electrónico",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const result = await login(email);
    setIsSubmitting(false);

    if (!result.success) {
      toast({
        title: "Acceso Denegado",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10 p-4">
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Quote section */}
        <div className="text-center mb-8 h-20 flex items-center justify-center">
          <p
            className={`text-muted-foreground italic text-lg transition-all duration-500 px-4 ${
              isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}
          >
            "{financialQuotes[currentQuote]}"
          </p>
        </div>

        {/* Login card */}
        <div className="glass-card rounded-3xl p-8 shadow-2xl border border-border/50 backdrop-blur-xl">
          <div className="flex flex-col items-center mb-8">
            <img 
              src={logo} 
              alt="Gestor de Gastos" 
              className="w-20 h-20 rounded-2xl object-cover mb-6 shadow-lg"
            />
            <h1 className="font-display text-3xl font-bold gradient-text text-center">
              GESTOR DE GASTOS
            </h1>
            <p className="text-muted-foreground mt-2">
              Ingresa tu email para comenzar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 text-lg bg-secondary/50 border-border/50 rounded-xl focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300"
            >
              {isSubmitting ? 'Verificando...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </div>

        {/* Footer quote indicator */}
        <div className="flex justify-center mt-6 gap-1">
          {financialQuotes.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === currentQuote ? 'bg-primary w-4' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;
