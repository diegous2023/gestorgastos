import React, { useState, useRef, useEffect } from 'react';
import { Shield, Lock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import logo from '@/assets/logo.jpg';

interface PinModalProps {
  isOpen: boolean;
  mode: 'create' | 'verify';
  onSubmit: (pin: string, rememberDevice: boolean) => void;
  isLoading?: boolean;
}

const PinModal: React.FC<PinModalProps> = ({ isOpen, mode, onSubmit, isLoading }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setPin(['', '', '', '']);
      setConfirmPin(['', '', '', '']);
      setStep('enter');
      setError('');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  const handlePinChange = (index: number, value: string, isConfirm: boolean = false) => {
    if (!/^\d*$/.test(value)) return;
    
    const newPin = isConfirm ? [...confirmPin] : [...pin];
    newPin[index] = value.slice(-1);
    
    if (isConfirm) {
      setConfirmPin(newPin);
    } else {
      setPin(newPin);
    }
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      const refs = isConfirm ? confirmRefs : inputRefs;
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number, isConfirm: boolean = false) => {
    if (e.key === 'Backspace') {
      const currentPin = isConfirm ? confirmPin : pin;
      const refs = isConfirm ? confirmRefs : inputRefs;
      
      if (!currentPin[index] && index > 0) {
        refs.current[index - 1]?.focus();
      }
    }
  };

  const handleSubmit = () => {
    const pinValue = pin.join('');
    
    if (pinValue.length !== 4) {
      setError('Ingresa los 4 dígitos');
      return;
    }

    if (mode === 'create') {
      if (step === 'enter') {
        setStep('confirm');
        setTimeout(() => confirmRefs.current[0]?.focus(), 100);
        return;
      }
      
      const confirmValue = confirmPin.join('');
      if (pinValue !== confirmValue) {
        setError('Los PINs no coinciden');
        setConfirmPin(['', '', '', '']);
        confirmRefs.current[0]?.focus();
        return;
      }
    }

    onSubmit(pinValue, rememberDevice);
  };

  const handleWhatsAppHelp = () => {
    window.open('https://wa.me/34641521099?text=Hola%20vengo%20del%20Gestor%20de%20Gastos%20y%20he%20olvidado%20mi%20PIN%2C%20me%20podr%C3%ADas%20ayudar%20por%20favor%20%F0%9F%98%94', '_blank');
  };

  if (!isOpen) return null;

  const renderPinInputs = (values: string[], refs: React.MutableRefObject<(HTMLInputElement | null)[]>, isConfirm: boolean = false) => (
    <div className="flex gap-3 justify-center">
      {values.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { refs.current[index] = el; }}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handlePinChange(index, e.target.value, isConfirm)}
          onKeyDown={(e) => handleKeyDown(e, index, isConfirm)}
          className="w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 border-border bg-secondary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
        />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm">
        <div className="glass-card rounded-3xl p-8 shadow-2xl">
          {/* Logo and header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-2xl overflow-hidden mb-4 shadow-lg bg-transparent">
              <img 
                src={logo} 
                alt="Gestor de Gastos" 
                className="w-full h-full object-cover"
                style={{ mixBlendMode: 'multiply' }}
              />
            </div>
            
            {mode === 'create' ? (
              <>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display text-xl font-bold text-center gradient-text">
                  Ahora tu Gestor de Gastos es más seguro
                </h2>
                <p className="text-muted-foreground text-sm text-center mt-2">
                  {step === 'enter' ? 'Crea un PIN de 4 dígitos' : 'Confirma tu PIN'}
                </p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display text-xl font-bold text-center">
                  Ingresa tu PIN
                </h2>
                <p className="text-muted-foreground text-sm text-center mt-2">
                  Introduce tu PIN de 4 dígitos para continuar
                </p>
              </>
            )}
          </div>

          {/* PIN inputs */}
          <div className="space-y-6">
            {mode === 'create' && step === 'confirm' ? (
              renderPinInputs(confirmPin, confirmRefs, true)
            ) : (
              renderPinInputs(pin, inputRefs)
            )}

            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}

            {/* Remember device checkbox */}
            <div className="flex items-center justify-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberDevice}
                onCheckedChange={(checked) => setRememberDevice(checked as boolean)}
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                Recordar en este dispositivo
              </label>
            </div>

            {/* Submit button */}
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-accent"
            >
              {isLoading ? 'Verificando...' : mode === 'create' && step === 'enter' ? 'Continuar' : 'Confirmar'}
            </Button>

            {/* Forgot PIN link - only show in verify mode */}
            {mode === 'verify' && (
              <button
                onClick={handleWhatsAppHelp}
                className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Olvidé mi PIN
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinModal;
