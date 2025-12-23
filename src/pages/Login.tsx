import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import logo from '@/assets/logo.jpg';
import { toast } from '@/hooks/use-toast';
import PinModal from '@/components/PinModal';

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

const REMEMBER_DEVICE_KEY = 'gestor_pin_remember';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [currentQuote, setCurrentQuote] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinMode, setPinMode] = useState<'create' | 'verify'>('create');
  const [isPinLoading, setIsPinLoading] = useState(false);
  const { login, user, pinStatus, createPin, verifyPin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if user is logged in AND PIN is verified
    if (user && pinStatus.verified) {
      navigate('/');
    }
  }, [user, pinStatus.verified, navigate]);

  // Show PIN modal when needed
  useEffect(() => {
    if (user && pinStatus.required && !pinStatus.verified) {
      setPinMode(pinStatus.hasPin ? 'verify' : 'create');
      setShowPinModal(true);
    }
  }, [user, pinStatus]);

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
    // PIN modal will show automatically via useEffect
  };

  const handlePinSubmit = async (pin: string, rememberDevice: boolean) => {
    setIsPinLoading(true);
    
    let result;
    if (pinMode === 'create') {
      result = await createPin(pin);
    } else {
      result = await verifyPin(pin);
    }

    setIsPinLoading(false);

    if (result.success) {
      if (rememberDevice && user?.email) {
        localStorage.setItem(REMEMBER_DEVICE_KEY, JSON.stringify({ 
          email: user.email, 
          remembered: true 
        }));
      }
      setShowPinModal(false);
      navigate('/');
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
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
        <div className="glass-card rounded-3xl p-8 shadow-xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-32 h-32 rounded-3xl overflow-hidden mb-6 shadow-lg bg-transparent">
              <img 
                src={logo} 
                alt="Gestor de Gastos" 
                className="w-full h-full object-cover"
                style={{ mixBlendMode: 'multiply' }}
              />
            </div>
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
                className="h-14 text-lg bg-secondary/50 border-border rounded-xl focus:ring-2 focus:ring-primary/50"
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

      {/* PIN Modal */}
      <PinModal
        isOpen={showPinModal}
        mode={pinMode}
        onSubmit={handlePinSubmit}
        isLoading={isPinLoading}
      />
    </div>
  );
};

export default Login;