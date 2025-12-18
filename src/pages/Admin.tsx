import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Trash2, Pause, Play, Bell, Users, Lock, Sparkles, UserCircle, Loader2 } from 'lucide-react';
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
import { useNavigate } from 'react-router-dom';

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
  is_active: boolean;
  is_dismissed: boolean;
  created_at: string;
}

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
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

  // Check authentication and admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.email) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setUserEmail(session.user.email);

      // Check if user is admin using the admin_roles table
      const { data: adminRole, error } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_email', session.user.email)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!adminRole);
      }

      setIsLoading(false);
    };

    checkAdminStatus();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUserEmail(null);
      } else if (session?.user?.email) {
        setIsAuthenticated(true);
        setUserEmail(session.user.email);
        
        // Re-check admin status
        setTimeout(async () => {
          const { data: adminRole } = await supabase
            .from('admin_roles')
            .select('role')
            .eq('user_email', session.user.email)
            .eq('role', 'admin')
            .maybeSingle();
          
          setIsAdmin(!!adminRole);
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch data when authenticated as admin
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchUsers();
      fetchNotifications();
      fetchSpecialNotifications();
      fetchPersonalizedNotifications();
    }
  }, [isAuthenticated, isAdmin]);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
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
        toast({ title: "Error", description: "No se pudo agregar el usuario. Verifica que tienes permisos de administrador.", variant: "destructive" });
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
        button2_text: newSpecialButton2.trim(),
        dismiss_button: newSpecialDismissButton,
        is_active: true
      });

    if (error) {
      toast({ title: "Error", description: "No se pudo crear la notificación especial", variant: "destructive" });
      return;
    }

    setNewSpecialTitle('');
    setNewSpecialDescription('');
    setNewSpecialButton1('Aceptar');
    setNewSpecialButton2('Confirmo que ya revisé las actualizaciones');
    setNewSpecialDismissButton(2);
    fetchSpecialNotifications();
    toast({ title: "Éxito", description: "Notificación especial creada" });
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
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="glass-card rounded-2xl p-8 w-full max-w-md text-center">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold">Panel de Administrador</h1>
            <p className="text-muted-foreground text-sm mt-2">Debes iniciar sesión para acceder</p>
          </div>
          
          <Button 
            onClick={() => navigate('/login')} 
            className="w-full h-12 bg-gradient-to-r from-primary to-accent"
          >
            Ir a Iniciar Sesión
          </Button>
        </div>
      </div>
    );
  }

  // Authenticated but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="glass-card rounded-2xl p-8 w-full max-w-md text-center">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="font-display text-2xl font-bold">Acceso Denegado</h1>
            <p className="text-muted-foreground text-sm mt-2">
              Tu cuenta ({userEmail}) no tiene permisos de administrador.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/')} 
              className="w-full h-12 bg-gradient-to-r from-primary to-accent"
            >
              Ir al Inicio
            </Button>
            <Button 
              variant="outline"
              onClick={handleLogout} 
              className="w-full h-12"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold gradient-text">Panel de Administrador</h1>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
          >
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
                <Button type="submit" className="bg-gradient-to-r from-primary to-accent">
                  Agregar
                </Button>
              </form>
            </div>

            {/* Users list */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">Usuarios Autorizados ({users.length})</h2>
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {user.status === 'active' ? 'Activo' : 'Suspendido'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSuspendDialog({ 
                          open: true, 
                          user, 
                          action: user.status === 'active' ? 'suspend' : 'reactivate' 
                        })}
                      >
                        {user.status === 'active' ? (
                          <Pause className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Play className="w-4 h-4 text-green-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteDialog({ open: true, user })}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No hay usuarios registrados</p>
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
              <form onSubmit={handleAddNotification} className="space-y-3">
                <Input
                  type="text"
                  placeholder="Título (opcional)"
                  value={newNotificationTitle}
                  onChange={(e) => setNewNotificationTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Mensaje de la notificación"
                  value={newNotificationMessage}
                  onChange={(e) => setNewNotificationMessage(e.target.value)}
                  rows={3}
                />
                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent">
                  Enviar Notificación
                </Button>
              </form>
            </div>

            {/* Notifications list */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">Notificaciones Enviadas ({notifications.length})</h2>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      {notification.title && (
                        <p className="font-medium">{notification.title}</p>
                      )}
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.created_at).toLocaleString('es-ES')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="ml-2"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No hay notificaciones</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'special' && (
          <div className="space-y-6">
            {/* Add special notification form */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">Nueva Notificación Especial Global</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Esta notificación aparecerá como un modal a todos los usuarios hasta que la descarten.
              </p>
              <form onSubmit={handleAddSpecialNotification} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Título"
                  value={newSpecialTitle}
                  onChange={(e) => setNewSpecialTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Descripción del mensaje"
                  value={newSpecialDescription}
                  onChange={(e) => setNewSpecialDescription(e.target.value)}
                  rows={3}
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Botón 1</Label>
                    <Input
                      type="text"
                      placeholder="Texto del botón 1"
                      value={newSpecialButton1}
                      onChange={(e) => setNewSpecialButton1(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Botón 2</Label>
                    <Input
                      type="text"
                      placeholder="Texto del botón 2"
                      value={newSpecialButton2}
                      onChange={(e) => setNewSpecialButton2(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">¿Qué botón descarta la notificación?</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="dismissButton"
                        value={1}
                        checked={newSpecialDismissButton === 1}
                        onChange={() => setNewSpecialDismissButton(1)}
                      />
                      <span className="text-sm">Botón 1</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="dismissButton"
                        value={2}
                        checked={newSpecialDismissButton === 2}
                        onChange={() => setNewSpecialDismissButton(2)}
                      />
                      <span className="text-sm">Botón 2</span>
                    </label>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent">
                  Crear Notificación Especial
                </Button>
              </form>
            </div>

            {/* Special notifications list */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">Notificaciones Especiales ({specialNotifications.length})</h2>
              <div className="space-y-3">
                {specialNotifications.map((notification) => (
                  <div key={notification.id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Switch
                          checked={notification.is_active}
                          onCheckedChange={() => handleToggleSpecialNotification(notification.id, notification.is_active)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSpecialNotification(notification.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span className={`px-2 py-0.5 rounded-full ${notification.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {notification.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                      <span>Botones: {notification.button1_text} / {notification.button2_text}</span>
                    </div>
                  </div>
                ))}
                {specialNotifications.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No hay notificaciones especiales</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'personalized' && (
          <div className="space-y-6">
            {/* Add personalized notification form */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">Nueva Notificación Personalizada</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Esta notificación aparecerá solo al usuario específico que selecciones.
              </p>
              <form onSubmit={handleAddPersonalizedNotification} className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Usuario destino</Label>
                  <Input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={newPersonalizedEmail}
                    onChange={(e) => setNewPersonalizedEmail(e.target.value)}
                  />
                </div>
                <Input
                  type="text"
                  placeholder="Título"
                  value={newPersonalizedTitle}
                  onChange={(e) => setNewPersonalizedTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Descripción del mensaje"
                  value={newPersonalizedDescription}
                  onChange={(e) => setNewPersonalizedDescription(e.target.value)}
                  rows={3}
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Botón 1</Label>
                    <Input
                      type="text"
                      placeholder="Texto del botón 1"
                      value={newPersonalizedButton1}
                      onChange={(e) => setNewPersonalizedButton1(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Botón 2</Label>
                    <Input
                      type="text"
                      placeholder="Texto del botón 2"
                      value={newPersonalizedButton2}
                      onChange={(e) => setNewPersonalizedButton2(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">¿Qué botón descarta la notificación?</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="personalizedDismissButton"
                        value={1}
                        checked={newPersonalizedDismissButton === 1}
                        onChange={() => setNewPersonalizedDismissButton(1)}
                      />
                      <span className="text-sm">Botón 1</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="personalizedDismissButton"
                        value={2}
                        checked={newPersonalizedDismissButton === 2}
                        onChange={() => setNewPersonalizedDismissButton(2)}
                      />
                      <span className="text-sm">Botón 2</span>
                    </label>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent">
                  Crear Notificación Personalizada
                </Button>
              </form>
            </div>

            {/* Personalized notifications list */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">Notificaciones Personalizadas ({personalizedNotifications.length})</h2>
              <div className="space-y-3">
                {personalizedNotifications.map((notification) => (
                  <div key={notification.id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-xs text-primary font-medium mb-1">Para: {notification.user_email}</p>
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Switch
                          checked={notification.is_active}
                          onCheckedChange={() => handleTogglePersonalizedNotification(notification.id, notification.is_active)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePersonalizedNotification(notification.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className={`px-2 py-0.5 rounded-full ${notification.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {notification.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full ${notification.is_dismissed ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                        {notification.is_dismissed ? 'Descartada' : 'Pendiente'}
                      </span>
                      {notification.is_dismissed && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 text-xs px-2"
                          onClick={() => handleResetPersonalizedDismissal(notification.id)}
                        >
                          Reiniciar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {personalizedNotifications.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No hay notificaciones personalizadas</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete User Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, user: null })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El usuario {deleteDialog.user?.email} será eliminado permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Suspend/Reactivate User Dialog */}
        <AlertDialog open={suspendDialog.open} onOpenChange={(open) => setSuspendDialog({ open, user: null, action: 'suspend' })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {suspendDialog.action === 'suspend' ? '¿Suspender usuario?' : '¿Reactivar usuario?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {suspendDialog.action === 'suspend' 
                  ? `El usuario ${suspendDialog.user?.email} no podrá acceder a la aplicación hasta que sea reactivado.`
                  : `El usuario ${suspendDialog.user?.email} podrá volver a acceder a la aplicación.`
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
