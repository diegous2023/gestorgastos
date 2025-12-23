import { useState, useEffect } from 'react';

const NewYearCountdown = () => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; isLastDay: boolean; hide?: boolean }>({ days: 0, hours: 0, isLastDay: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const newYear = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0);
      
      // If we're already in 2026 or later, don't show
      if (now.getFullYear() >= 2026) {
        return { days: 0, hours: 0, isLastDay: false, hide: true };
      }
      
      const difference = newYear.getTime() - now.getTime();
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      // Check if it's December 31st
      const isLastDay = now.getMonth() === 11 && now.getDate() === 31;
      
      return { days, hours, isLastDay, hide: false };
    };

    const updateCountdown = () => {
      const result = calculateTimeLeft();
      setTimeLeft(result);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000 * 60); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Don't render if we're past 2026
  if (timeLeft.hide) return null;

  return (
    <div className="fixed left-3 bottom-20 z-40">
      <div className="bg-background/90 backdrop-blur-sm border border-border/50 rounded-xl px-3 py-2 shadow-lg relative">
        {/* Christmas Hat */}
        <div className="absolute -top-4 -left-1 text-lg animate-hat-wiggle">
          🎅
        </div>
        <div className="text-center pl-2">
          <div className="text-sm font-semibold text-foreground">
            2026 🍾
          </div>
          <div className="text-xs text-muted-foreground">
            {timeLeft.isLastDay ? (
              <>Faltan {timeLeft.hours}h</>
            ) : (
              <>Faltan {timeLeft.days} días</>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes hat-wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        .animate-hat-wiggle {
          animation: hat-wiggle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NewYearCountdown;
