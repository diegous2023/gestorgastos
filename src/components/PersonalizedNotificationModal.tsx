import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { UserCircle } from 'lucide-react';

interface PersonalizedNotification {
  id: string;
  title: string;
  description: string;
  button1_text: string;
  button2_text: string;
  dismiss_button: number;
  button_count: number;
}

const PersonalizedNotificationModal: React.FC = () => {
  const { user } = useAuth();
  const [notification, setNotification] = useState<PersonalizedNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (user?.email) {
      fetchActiveNotification();
    }
  }, [user?.email]);

  const fetchActiveNotification = async () => {
    if (!user?.email) return;

    // Get active personalized notification for this user that hasn't been dismissed
    const { data: notifications } = await supabase
      .from('user_personalized_notifications')
      .select('*')
      .eq('user_email', user.email)
      .eq('is_active', true)
      .eq('is_dismissed', false)
      .order('created_at', { ascending: false })
      .limit(1);

    if (notifications && notifications.length > 0) {
      setNotification(notifications[0]);
      setIsVisible(true);
    }
  };

  const handleButtonClick = async (buttonNumber: number) => {
    if (!notification) return;

    // For single button notifications, always dismiss
    // For two button notifications, dismiss only if the dismiss button is clicked
    const shouldDismiss = notification.button_count === 1 || buttonNumber === notification.dismiss_button;

    if (shouldDismiss) {
      // Dismiss permanently by updating is_dismissed
      await supabase
        .from('user_personalized_notifications')
        .update({ is_dismissed: true })
        .eq('id', notification.id);
    }
    setIsVisible(false);
  };

  if (!isVisible || !notification) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-gradient-to-b from-card to-background rounded-3xl p-8 shadow-2xl border border-border animate-scale-in">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
            <UserCircle className="w-10 h-10 text-primary-foreground" />
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
          {notification.button_count === 2 && (
            <Button
              onClick={() => handleButtonClick(2)}
              variant="secondary"
              className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-accent to-primary text-primary-foreground hover:opacity-90 transition-all"
            >
              {notification.button2_text}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalizedNotificationModal;
