import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Sparkles, ExternalLink, AlertTriangle } from 'lucide-react';

interface SpecialNotification {
  id: string;
  title: string;
  description: string;
  button1_text: string;
  button2_text: string;
  dismiss_button: number;
  button_count: number;
  is_fixed_window: boolean;
  button1_link: string | null;
  button2_link: string | null;
}

const SpecialNotificationModal: React.FC = () => {
  const { user } = useAuth();
  const [notification, setNotification] = useState<SpecialNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (user?.email) {
      fetchActiveNotification();
      
      // Subscribe to realtime updates for special_notifications
      const channel = supabase
        .channel('special-notifications-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'special_notifications'
          },
          (payload) => {
            console.log('Special notification changed:', payload);
            // Refetch when any change happens
            fetchActiveNotification();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
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

    if (!notifications || notifications.length === 0) {
      setNotification(null);
      setIsVisible(false);
      return;
    }

    const activeNotification = notifications[0] as SpecialNotification;

    // For fixed window notifications, always show (no dismissal check)
    if (activeNotification.is_fixed_window) {
      setNotification(activeNotification);
      setIsVisible(true);
      return;
    }

    // Check if user has dismissed it (only for non-fixed window notifications)
    const { data: dismissals } = await supabase
      .from('special_notification_dismissals')
      .select('id')
      .eq('user_email', user.email)
      .eq('notification_id', activeNotification.id);

    if (!dismissals || dismissals.length === 0) {
      setNotification(activeNotification);
      setIsVisible(true);
    } else {
      setNotification(null);
      setIsVisible(false);
    }
  };

  const handleButtonClick = async (buttonNumber: number) => {
    if (!notification || !user?.email) return;

    // Get the link for this button
    const link = buttonNumber === 1 ? notification.button1_link : notification.button2_link;

    // Open link if configured
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }

    // For fixed window notifications, don't dismiss - just open the link
    if (notification.is_fixed_window) {
      return;
    }

    // For regular notifications, handle dismissal logic
    const shouldDismiss = notification.button_count === 1 || buttonNumber === notification.dismiss_button;

    if (shouldDismiss) {
      await supabase
        .from('special_notification_dismissals')
        .insert({ 
          user_email: user.email, 
          notification_id: notification.id 
        });
    }
    setIsVisible(false);
  };

  if (!isVisible || !notification) return null;

  const isFixedWindow = notification.is_fixed_window;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${
        isFixedWindow ? 'bg-background' : 'bg-foreground/50 backdrop-blur-sm'
      } animate-fade-in`}
    >
      <div className={`w-full max-w-md bg-gradient-to-b from-card to-background rounded-3xl p-8 shadow-2xl border ${
        isFixedWindow ? 'border-destructive/50' : 'border-border'
      } animate-scale-in`}>
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
            isFixedWindow 
              ? 'bg-gradient-to-br from-destructive to-destructive/70' 
              : 'bg-gradient-to-br from-primary to-accent'
          }`}>
            {isFixedWindow ? (
              <AlertTriangle className="w-10 h-10 text-destructive-foreground" />
            ) : (
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            )}
          </div>
        </div>

        {/* Fixed Window Badge */}
        {isFixedWindow && (
          <div className="flex justify-center mb-4">
            <span className="text-xs bg-destructive/20 text-destructive px-3 py-1 rounded-full font-medium">
              AVISO IMPORTANTE
            </span>
          </div>
        )}

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
            className={`w-full h-14 text-lg font-semibold rounded-xl transition-all ${
              isFixedWindow && notification.button1_link
                ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90'
                : 'bg-gradient-to-r from-primary to-accent hover:opacity-90'
            }`}
          >
            {notification.button1_text}
            {notification.button1_link && <ExternalLink className="w-5 h-5 ml-2" />}
          </Button>
          {notification.button_count === 2 && (
            <Button
              onClick={() => handleButtonClick(2)}
              variant="secondary"
              className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-accent to-primary text-primary-foreground hover:opacity-90 transition-all"
            >
              {notification.button2_text}
              {notification.button2_link && <ExternalLink className="w-5 h-5 ml-2" />}
            </Button>
          )}
        </div>

        {/* Fixed window info */}
        {isFixedWindow && (
          <p className="text-center text-xs text-muted-foreground mt-6">
            Esta ventana permanecerá activa hasta que el administrador la desactive.
          </p>
        )}
      </div>
    </div>
  );
};

export default SpecialNotificationModal;