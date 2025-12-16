import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface SpecialNotification {
  id: string;
  title: string;
  description: string;
  button1_text: string;
  button2_text: string;
  dismiss_button: number;
}

const SpecialNotificationModal: React.FC = () => {
  const { user } = useAuth();
  const [notification, setNotification] = useState<SpecialNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (user?.email) {
      fetchActiveNotification();
    }
  }, [user?.email]);

  const fetchActiveNotification = async () => {
    if (!user?.email) return;

    // Get active special notification
    const { data: notifications } = await supabase
      .from('special_notifications')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!notifications || notifications.length === 0) return;

    const activeNotification = notifications[0];

    // Check if user has dismissed it
    const { data: dismissals } = await supabase
      .from('special_notification_dismissals')
      .select('id')
      .eq('user_email', user.email)
      .eq('notification_id', activeNotification.id);

    if (!dismissals || dismissals.length === 0) {
      setNotification(activeNotification);
      setIsVisible(true);
    }
  };

  const handleButtonClick = async (buttonNumber: number) => {
    if (!notification || !user?.email) return;

    if (buttonNumber === notification.dismiss_button) {
      // Dismiss permanently
      await supabase
        .from('special_notification_dismissals')
        .insert({ 
          user_email: user.email, 
          notification_id: notification.id 
        });
      setIsVisible(false);
    }
    // If not the dismiss button, just close for now (will show again on next visit)
    setIsVisible(false);
  };

  if (!isVisible || !notification) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-gradient-to-b from-card to-background rounded-3xl p-8 shadow-2xl border border-border animate-scale-in">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-display font-bold text-center gradient-text mb-4">
          {notification.title}
        </h2>

        {/* Description */}
        <p className="text-center text-muted-foreground mb-8 leading-relaxed">
          {notification.description}
        </p>

        {/* Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => handleButtonClick(1)}
            className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all"
          >
            {notification.button1_text}
          </Button>
          <Button
            onClick={() => handleButtonClick(2)}
            variant="secondary"
            className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-accent to-primary text-primary-foreground hover:opacity-90 transition-all"
          >
            {notification.button2_text}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SpecialNotificationModal;