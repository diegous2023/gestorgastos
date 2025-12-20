import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Trash2, Pause, Play, Bell, Users, Lock, Sparkles, UserCircle, LogOut, Pencil, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface AuthorizedUser {
  id: string;
  email: string;
  name: string;
  status: string;
  created_at: string;
}

interface Notification {
  id: string;
  title: string | null;
  message: string;
  created_at: string;
}

interface SpecialNotification {
  id: string;
  title: string;
  description: string;
  button1_text: string;
  button2_text: string;
  dismiss_button: number;
  button_count: number;
  is_active: boolean;
  created_at: string;
}

interface PersonalizedNotification {
  id: string;
  user_email: string;
  title: string;
  description: string;
  button1_text: string;
  button2_text: string;
  dismiss_button: number;
  button_count: number;
  is_active: boolean;
  is_dismissed: boolean;
  created_at: string;
}

const Admin: React.FC = () => {
  const { user, login, logout, isLoading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'notifications' | 'special' | 'personalized'>('users');
  
  // Users state
  const [users, setUsers] = useState<AuthorizedUser[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  
  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newNotificationTitle, setNewNotificationTitle] = useState('');
  const [newNotificationMessage, setNewNotificationMessage] = useState('');
  
  // Special notifications state
  const [specialNotifications, setSpecialNotifications] = useState<SpecialNotification[]>([]);
  const [newSpecialTitle, setNewSpecialTitle] = useState('');
  const [newSpecialDescription, setNewSpecialDescription] = useState('');
  const [newSpecialButton1, setNewSpecialButton1] = useState('Aceptar');
  const [newSpecialButton2, setNewSpecialButton2] = useState('Confirmo que ya revisé las actualizaciones');
  const [newSpecialDismissButton, setNewSpecialDismissButton] = useState(2);
  const [newSpecialButtonCount, setNewSpecialButtonCount] = useState(2);
  const [editingSpecial, setEditingSpecial] = useState<SpecialNotification | null>(null);

  // Personalized notifications state
  const [personalizedNotifications, setPersonalizedNotifications] = useState<PersonalizedNotification[]>([]);
  const [newPersonalizedEmail, setNewPersonalizedEmail] = useState('');
  const [newPersonalizedTitle, setNewPersonalizedTitle] = useState('');
  const [newPersonalizedDescription, setNewPersonalizedDescription] = useState('');
  const [newPersonalizedButton1, setNewPersonalizedButton1] = useState('Aceptar');
  const [newPersonalizedButton2, setNewPersonalizedButton2] = useState('Entendido');
  const [newPersonalizedDismissButton, setNewPersonalizedDismissButton] = useState(2);
  
  // Dialog state
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: AuthorizedUser | null }>({ open: false, user: null });
  const [suspendDialog, setSuspendDialog] = useState<{ open: boolean; user: AuthorizedUser | null; action: 'suspend' | 'reactivate' }>({ open: false, user: null, action: 'suspend' });

  // Check if user is admin when auth state changes
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.email) {
        setIsAdmin(false);
        setIsCheckingAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('admin_roles')
          .select('role')
          .eq('user_email', user.email)
          .eq('role', 'admin')
          .maybeSingle();

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
        }
      } catch (err) {
        console.error('Error checking admin:', err);
        setIsAdmin(false);
      }
      setIsCheckingAdmin(false);
    };

    if (!authLoading) {
      checkAdminStatus();
    }
  }, [user?.email, authLoading]);

  // Fetch data when admin is confirmed
  useEffect(() => {
    if (isAdmin && user?.email) {
      fetchUsers();
      fetchNotifications();
      fetchSpecialNotifications();
      fetchPersonalizedNotifications();
    }
  }, [isAdmin, user?.email]);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('authorized_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setUsers(data);
    }
  };

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setNotifications(data);
    }
  };

  const fetchSpecialNotifications = async () => {
    const { data, error } = await supabase
      .from('special_notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setSpecialNotifications(data);
    }
  };

  const fetchPersonalizedNotifications = async () => {
    const { data, error } = await supabase
      .from('user_personalized_notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setPersonalizedNotifications(data);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      toast({ title: "Error", description: "Ingresa tu correo", variant: "destructive" });
      return;
    }

    setIsLoggingIn(true);
    const result = await login(loginEmail);
    setIsLoggingIn(false);

    if (!result.success) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Verificando permisos...", description: "Comprobando si eres administrador" });
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsAdmin(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim()) {
      toast({ title: "Error", description: "Completa todos los campos", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from('authorized_users')
      .insert({ email: newEmail.toLowerCase().trim(), name: newName.trim() });

    if (error) {
      if (error.code === '23505') {
        toast({ title: "Error", description: "Este correo ya está registrado", variant: "destructive" });
      } else {
        toast({ title: "Error", description: "No se pudo agregar el usuario", variant: "destructive" });
      }
      return;
    }

    setNewEmail('');
    setNewName('');
    fetchUsers();
    toast({ title: "Éxito", description: "Usuario agregado correctamente" });
  };

  const handleDeleteUser = async () => {
    if (!deleteDialog.user) return;
    
    const { error } = await supabase
      .from('authorized_users')
      .delete()
      .eq('id', deleteDialog.user.id);

    if (error) {
      toast({ title: "Error", description: "No se pudo eliminar el usuario", variant: "destructive" });
      return;
    }

    setDeleteDialog({ open: false, user: null });
    fetchUsers();
    toast({ title: "Éxito", description: "Usuario eliminado" });
  };

  const handleToggleStatus = async () => {
    if (!suspendDialog.user) return;
    
    const newStatus = suspendDialog.action === 'suspend' ? 'suspended' : 'active';
    
    const { error } = await supabase
      .from('authorized_users')
      .update({ status: newStatus })
      .eq('id', suspendDialog.user.id);

    if (error) {
      toast({ title: "Error", description: "No se pudo actualizar el estado", variant: "destructive" });
      return;
    }

    setSuspendDialog({ open: false, user: null, action: 'suspend' });
    fetchUsers();
    toast({ 
      title: "Éxito", 
      description: newStatus === 'suspended' ? 'Usuario suspendido' : 'Usuario reactivado' 
    });
  };

  const handleAddNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotificationMessage.trim()) {
      toast({ title: "Error", description: "Escribe un mensaje", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from('notifications')
      .insert({ 
        title: newNotificationTitle.trim() || null,
        message: newNotificationMessage.trim() 
      });

    if (error) {
      toast({ title: "Error", description: "No se pudo crear la notificación", variant: "destructive" });
      return;
    }

    setNewNotificationTitle('');
    setNewNotificationMessage('');
    fetchNotifications();
    toast({ title: "Éxito", description: "Notificación enviada" });
  };

  const handleDeleteNotification = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchNotifications();
      toast({ title: "Éxito", description: "Notificación eliminada" });
    }
  };

  const handleAddSpecialNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpecialTitle.trim() || !newSpecialDescription.trim()) {
      toast({ title: "Error", description: "Completa todos los campos", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from('special_notifications')
      .insert({ 
        title: newSpecialTitle.trim(),
        description: newSpecialDescription.trim(),
        button1_text: newSpecialButton1.trim(),
        button2_text: newSpecialButtonCount === 2 ? newSpecialButton2.trim() : '',
        dismiss_button: newSpecialButtonCount === 1 ? 1 : newSpecialDismissButton,
        button_count: newSpecialButtonCount,
        is_active: true
      });

    if (error) {
      toast({ title: "Error", description: "No se pudo crear la notificación especial", variant: "destructive" });
      return;
    }

    resetSpecialForm();
    fetchSpecialNotifications();
    toast({ title: "Éxito", description: "Notificación especial creada" });
  };

  const resetSpecialForm = () => {
    setNewSpecialTitle('');
    setNewSpecialDescription('');
    setNewSpecialButton1('Aceptar');
    setNewSpecialButton2('Confirmo que ya revisé las actualizaciones');
    setNewSpecialDismissButton(2);
    setNewSpecialButtonCount(2);
    setEditingSpecial(null);
  };

  const handleEditSpecialNotification = (notification: SpecialNotification) => {
    setEditingSpecial(notification);
    setNewSpecialTitle(notification.title);
    setNewSpecialDescription(notification.description);
    setNewSpecialButton1(notification.button1_text);
    setNewSpecialButton2(notification.button2_text);
    setNewSpecialDismissButton(notification.dismiss_button);
    setNewSpecialButtonCount(notification.button_count);
  };

  const handleUpdateSpecialNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpecial || !newSpecialTitle.trim() || !newSpecialDescription.trim()) {
      toast({ title: "Error", description: "Completa todos los campos", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from('special_notifications')
      .update({ 
        title: newSpecialTitle.trim(),
        description: newSpecialDescription.trim(),
        button1_text: newSpecialButton1.trim(),
        button2_text: newSpecialButtonCount === 2 ? newSpecialButton2.trim() : '',
        dismiss_button: newSpecialButtonCount === 1 ? 1 : newSpecialDismissButton,
        button_count: newSpecialButtonCount
      })
      .eq('id', editingSpecial.id);

    if (error) {
      toast({ title: "Error", description: "No se pudo actualizar la notificación", variant: "destructive" });
      return;
    }

    resetSpecialForm();
    fetchSpecialNotifications();
    toast({ title: "Éxito", description: "Notificación actualizada" });
  };

  const handleToggleSpecialNotification = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('special_notifications')
      .update({ is_active: !isActive })
      .eq('id', id);

    if (!error) {
      fetchSpecialNotifications();
      toast({ title: "Éxito", description: isActive ? "Notificación desactivada" : "Notificación activada" });
    }
  };

  const handleDeleteSpecialNotification = async (id: string) => {
    const { error } = await supabase
      .from('special_notifications')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchSpecialNotifications();
      toast({ title: "Éxito", description: "Notificación especial eliminada" });
    }
  };

  const handleAddPersonalizedNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonalizedEmail.trim() || !newPersonalizedTitle.trim() || !newPersonalizedDescription.trim()) {
      toast({ title: "Error", description: "Completa todos los campos", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from('user_personalized_notifications')
      .insert({ 
        user_email: newPersonalizedEmail.toLowerCase().trim(),
        title: newPersonalizedTitle.trim(),
        description: newPersonalizedDescription.trim(),
        button1_text: newPersonalizedButton1.trim(),
        button2_text: newPersonalizedButton2.trim(),
        dismiss_button: newPersonalizedDismissButton,
        is_active: true,
        is_dismissed: false
      });

    if (error) {
      toast({ title: "Error", description: "No se pudo crear la notificación personalizada", variant: "destructive" });
      return;
    }

    setNewPersonalizedEmail('');
    setNewPersonalizedTitle('');
    setNewPersonalizedDescription('');
    setNewPersonalizedButton1('Aceptar');
    setNewPersonalizedButton2('Entendido');
    setNewPersonalizedDismissButton(2);
    fetchPersonalizedNotifications();
    toast({ title: "Éxito", description: "Notificación personalizada creada" });
  };

  const handleTogglePersonalizedNotification = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('user_personalized_notifications')
      .update({ is_active: !isActive, is_dismissed: false })
      .eq('id', id);

    if (!error) {
      fetchPersonalizedNotifications();
      toast({ title: "Éxito", description: isActive ? "Notificación desactivada" : "Notificación activada" });
    }
  };

  const handleResetPersonalizedDismissal = async (id: string) => {
    const { error } = await supabase
      .from('user_personalized_notifications')
      .update({ is_dismissed: false })
      .eq('id', id);

    if (!error) {
      fetchPersonalizedNotifications();
      toast({ title: "Éxito", description: "Notificación reiniciada - volverá a aparecer al usuario" });
    }
  };

  const handleDeletePersonalizedNotification = async (id: string) => {
    const { error } = await supabase
      .from('user_personalized_notifications')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchPersonalizedNotifications();
      toast({ title: "Éxito", description: "Notificación personalizada eliminada" });
    }
  };

  // Loading state
  if (authLoading || isCheckingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="glass-card rounded-2xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show login form
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="glass-card rounded-2xl p-8 w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold">Panel de Administrador</h1>
            <p className="text-muted-foreground text-sm">Ingresa tu correo de administrador</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="admin@ejemplo.com"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="h-12"
            />
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-primary to-accent"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? 'Verificando...' : 'Ingresar'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Logged in but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="glass-card rounded-2xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">Acceso Denegado</h1>
          <p className="text-muted-foreground text-sm mb-4">
            El correo <strong>{user.email}</strong> no tiene permisos de administrador.
          </p>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    );
  }

  // Admin authenticated - show admin panel
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold gradient-text">Panel de Administrador</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={activeTab === 'users' ? 'default' : 'secondary'}
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 ${activeTab === 'users' ? 'bg-gradient-to-r from-primary to-accent' : ''}`}
          >
            <Users className="w-4 h-4" />
            Usuarios
          </Button>
          <Button
            variant={activeTab === 'notifications' ? 'default' : 'secondary'}
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 ${activeTab === 'notifications' ? 'bg-gradient-to-r from-primary to-accent' : ''}`}
          >
            <Bell className="w-4 h-4" />
            Notificaciones
          </Button>
          <Button
            variant={activeTab === 'special' ? 'default' : 'secondary'}
            onClick={() => setActiveTab('special')}
            className={`flex items-center gap-2 ${activeTab === 'special' ? 'bg-gradient-to-r from-primary to-accent' : ''}`}
          >
            <Sparkles className="w-4 h-4" />
            Especial Global
          </Button>
          <Button
            variant={activeTab === 'personalized' ? 'default' : 'secondary'}
            onClick={() => setActiveTab('personalized')}
            className={`flex items-center gap-2 ${activeTab === 'personalized' ? 'bg-gradient-to-r from-primary to-accent' : ''}`}
          >
            <UserCircle className="w-4 h-4" />
            Personalizada
          </Button>
        </div>

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Add user form */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">Agregar Usuario</h2>
              <form onSubmit={handleAddUser} className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="text"
                  placeholder="Nombre"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="email"
                  placeholder="Correo electrónico"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" className="bg-gradient-to-r from-primary to-accent">Agregar</Button>
              </form>
            </div>

            {/* Users list */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">Usuarios Autorizados ({users.length})</h2>
              <div className="space-y-3">
                {users.map((user) => (
                  <div 
                    key={user.id} 
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      user.status === 'suspended' ? 'bg-destructive/5 border-destructive/30' : 'bg-secondary/50 border-border'
                    }`}
                  >
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {user.status === 'suspended' && (
                        <span className="text-xs text-destructive font-medium">SUSPENDIDO</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSuspendDialog({ 
                          open: true, 
                          user, 
                          action: user.status === 'active' ? 'suspend' : 'reactivate' 
                        })}
                        title={user.status === 'active' ? 'Suspender' : 'Reactivar'}
                      >
                        {user.status === 'active' ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => setDeleteDialog({ open: true, user })}
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No hay usuarios registrados</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            {/* Add notification form */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">Nueva Notificación</h2>
              <form onSubmit={handleAddNotification} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Título (opcional)"
                  value={newNotificationTitle}
                  onChange={(e) => setNewNotificationTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Descripción de la notificación..."
                  value={newNotificationMessage}
                  onChange={(e) => setNewNotificationMessage(e.target.value)}
                  rows={3}
                />
                <Button type="submit" className="bg-gradient-to-r from-primary to-accent">Enviar</Button>
              </form>
            </div>

            {/* Notifications list */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">Notificaciones Enviadas</h2>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className="flex items-start justify-between p-4 rounded-lg bg-secondary/50 border border-border"
                  >
                    <div className="flex-1">
                      {notification.title && (
                        <p className="font-semibold text-primary">{notification.title}</p>
                      )}
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.created_at).toLocaleString('es-ES')}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteNotification(notification.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No hay notificaciones</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'special' && (
          <div className="space-y-6">
            {/* Add/Edit special notification form */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">
                  {editingSpecial ? 'Editar Notificación Especial' : 'Crear Notificación Especial'}
                </h2>
                {editingSpecial && (
                  <Button variant="ghost" size="sm" onClick={resetSpecialForm}>
                    <X className="w-4 h-4 mr-1" /> Cancelar
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Esta notificación aparecerá como una ventana emergente para todos los usuarios.
              </p>
              <form onSubmit={editingSpecial ? handleUpdateSpecialNotification : handleAddSpecialNotification} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Título de la notificación"
                  value={newSpecialTitle}
                  onChange={(e) => setNewSpecialTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Descripción detallada..."
                  value={newSpecialDescription}
                  onChange={(e) => setNewSpecialDescription(e.target.value)}
                  rows={4}
                />
                
                {/* Button count selector */}
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <Label className="text-sm font-medium mb-3 block">¿Cuántos botones tendrá la notificación?</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="buttonCount" 
                        checked={newSpecialButtonCount === 1}
                        onChange={() => {
                          setNewSpecialButtonCount(1);
                          setNewSpecialDismissButton(1);
                        }}
                        className="accent-primary"
                      />
                      <span>1 botón (siempre oculta)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="buttonCount" 
                        checked={newSpecialButtonCount === 2}
                        onChange={() => setNewSpecialButtonCount(2)}
                        className="accent-primary"
                      />
                      <span>2 botones</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">Texto del botón 1</Label>
                    <Input
                      type="text"
                      placeholder="Aceptar"
                      value={newSpecialButton1}
                      onChange={(e) => setNewSpecialButton1(e.target.value)}
                    />
                  </div>
                  {newSpecialButtonCount === 2 && (
                    <div>
                      <Label className="text-sm text-muted-foreground mb-2 block">Texto del botón 2</Label>
                      <Input
                        type="text"
                        placeholder="Confirmar"
                        value={newSpecialButton2}
                        onChange={(e) => setNewSpecialButton2(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {newSpecialButtonCount === 2 && (
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <Label className="text-sm font-medium mb-3 block">¿Qué botón oculta la notificación permanentemente?</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="dismissButton" 
                          checked={newSpecialDismissButton === 1}
                          onChange={() => setNewSpecialDismissButton(1)}
                          className="accent-primary"
                        />
                        <span>Botón 1</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="dismissButton" 
                          checked={newSpecialDismissButton === 2}
                          onChange={() => setNewSpecialDismissButton(2)}
                          className="accent-primary"
                        />
                        <span>Botón 2</span>
                      </label>
                    </div>
                  </div>
                )}

                <Button type="submit" className="bg-gradient-to-r from-primary to-accent">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {editingSpecial ? 'Guardar Cambios' : 'Crear Notificación Especial'}
                </Button>
              </form>
            </div>

            {/* Special notifications list */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">Notificaciones Especiales</h2>
              <div className="space-y-3">
                {specialNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 rounded-lg border ${notification.is_active ? 'bg-primary/5 border-primary/30' : 'bg-secondary/50 border-border'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{notification.title}</p>
                          {notification.is_active && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">ACTIVA</span>
                          )}
                          <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                            {notification.button_count === 1 ? '1 botón' : '2 botones'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Botón 1: {notification.button1_text}</span>
                          {notification.button_count === 2 && (
                            <>
                              <span>Botón 2: {notification.button2_text}</span>
                              <span>Oculta con: Botón {notification.dismiss_button}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditSpecialNotification(notification)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Switch
                          checked={notification.is_active}
                          onCheckedChange={() => handleToggleSpecialNotification(notification.id, notification.is_active)}
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteSpecialNotification(notification.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {specialNotifications.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No hay notificaciones especiales</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'personalized' && (
          <div className="space-y-6">
            {/* Add personalized notification form */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">Crear Notificación Personalizada</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Esta notificación aparecerá solo para el usuario especificado.
              </p>
              <form onSubmit={handleAddPersonalizedNotification} className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Correo del usuario</Label>
                  <Input
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    value={newPersonalizedEmail}
                    onChange={(e) => setNewPersonalizedEmail(e.target.value)}
                  />
                </div>
                <Input
                  type="text"
                  placeholder="Título de la notificación"
                  value={newPersonalizedTitle}
                  onChange={(e) => setNewPersonalizedTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Descripción detallada..."
                  value={newPersonalizedDescription}
                  onChange={(e) => setNewPersonalizedDescription(e.target.value)}
                  rows={4}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">Texto del botón 1</Label>
                    <Input
                      type="text"
                      placeholder="Aceptar"
                      value={newPersonalizedButton1}
                      onChange={(e) => setNewPersonalizedButton1(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">Texto del botón 2</Label>
                    <Input
                      type="text"
                      placeholder="Entendido"
                      value={newPersonalizedButton2}
                      onChange={(e) => setNewPersonalizedButton2(e.target.value)}
                    />
                  </div>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <Label className="text-sm font-medium mb-3 block">¿Qué botón oculta la notificación permanentemente?</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="personalizedDismissButton" 
                        checked={newPersonalizedDismissButton === 1}
                        onChange={() => setNewPersonalizedDismissButton(1)}
                        className="accent-primary"
                      />
                      <span>Botón 1</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="personalizedDismissButton" 
                        checked={newPersonalizedDismissButton === 2}
                        onChange={() => setNewPersonalizedDismissButton(2)}
                        className="accent-primary"
                      />
                      <span>Botón 2</span>
                    </label>
                  </div>
                </div>
                <Button type="submit" className="bg-gradient-to-r from-primary to-accent">
                  <UserCircle className="w-4 h-4 mr-2" />
                  Crear Notificación Personalizada
                </Button>
              </form>
            </div>

            {/* Personalized notifications list */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">Notificaciones Personalizadas</h2>
              <div className="space-y-3">
                {personalizedNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 rounded-lg border ${notification.is_active && !notification.is_dismissed ? 'bg-primary/5 border-primary/30' : 'bg-secondary/50 border-border'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full">
                            {notification.user_email}
                          </span>
                          {notification.is_active && !notification.is_dismissed && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">ACTIVA</span>
                          )}
                          {notification.is_dismissed && (
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">DESCARTADA</span>
                          )}
                        </div>
                        <p className="font-semibold">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                          <span>Botón 1: {notification.button1_text}</span>
                          <span>Botón 2: {notification.button2_text}</span>
                          <span>Oculta con: Botón {notification.dismiss_button}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {notification.is_dismissed && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResetPersonalizedDismissal(notification.id)}
                            title="Volver a mostrar"
                          >
                            Reiniciar
                          </Button>
                        )}
                        <Switch
                          checked={notification.is_active}
                          onCheckedChange={() => handleTogglePersonalizedNotification(notification.id, notification.is_active)}
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeletePersonalizedNotification(notification.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {personalizedNotifications.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No hay notificaciones personalizadas</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete confirmation dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, user: null })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que deseas eliminar a {deleteDialog.user?.name} ({deleteDialog.user?.email})? Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Suspend/Reactivate confirmation dialog */}
        <AlertDialog open={suspendDialog.open} onOpenChange={(open) => setSuspendDialog({ open, user: null, action: 'suspend' })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {suspendDialog.action === 'suspend' ? '¿Suspender usuario?' : '¿Reactivar usuario?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {suspendDialog.action === 'suspend' 
                  ? `¿Estás seguro de que deseas suspender a ${suspendDialog.user?.name}? No podrá acceder a la aplicación.`
                  : `¿Estás seguro de que deseas reactivar a ${suspendDialog.user?.name}? Podrá volver a acceder a la aplicación.`
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleToggleStatus}>
                {suspendDialog.action === 'suspend' ? 'Suspender' : 'Reactivar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Admin;