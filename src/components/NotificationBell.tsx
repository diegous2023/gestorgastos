import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  message: string;
  created_at: string;
}

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchReadNotifications();

    // Subscribe to realtime notifications
    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (data) {
      setNotifications(data);
    }
  };

  const fetchReadNotifications = async () => {
    if (!user?.email) return;
    
    const { data } = await supabase
      .from('user_notification_reads')
      .select('notification_id')
      .eq('user_email', user.email);
    
    if (data) {
      setReadIds(new Set(data.map(r => r.notification_id)));
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user?.email || readIds.has(notificationId)) return;

    await supabase
      .from('user_notification_reads')
      .insert({ user_email: user.email, notification_id: notificationId });
    
    setReadIds((prev) => new Set([...prev, notificationId]));
  };

  const markAllAsRead = async () => {
    if (!user?.email) return;

    const unreadIds = notifications.filter(n => !readIds.has(n.id)).map(n => n.id);
    if (unreadIds.length === 0) return;

    const inserts = unreadIds.map(id => ({ user_email: user.email, notification_id: id }));
    await supabase.from('user_notification_reads').insert(inserts);
    
    setReadIds(new Set(notifications.map(n => n.id)));
  };

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notificaciones</h3>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                Marcar todas leídas
              </Button>
            )}
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              No hay notificaciones
            </p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-border/50 cursor-pointer hover:bg-secondary/50 transition-colors ${
                  !readIds.has(notification.id) ? 'bg-primary/5' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <p className="text-sm">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(notification.created_at).toLocaleString('es-ES')}
                </p>
                {!readIds.has(notification.id) && (
                  <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2" />
                )}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
