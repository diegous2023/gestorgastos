import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Trash2, Pause, Play, Bell, Users, Lock } from 'lucide-react';
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

interface AuthorizedUser {
  id: string;
  email: string;
  name: string;
  status: string;
  created_at: string;
}

interface Notification {
  id: string;
  message: string;
  created_at: string;
}

const ADMIN_PASSWORD = 'exitoso19397796';

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'notifications'>('users');
  
  // Users state
  const [users, setUsers] = useState<AuthorizedUser[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  
  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newNotification, setNewNotification] = useState('');
  
  // Dialog state
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: AuthorizedUser | null }>({ open: false, user: null });
  const [suspendDialog, setSuspendDialog] = useState<{ open: boolean; user: AuthorizedUser | null; action: 'suspend' | 'reactivate' }>({ open: false, user: null, action: 'suspend' });

  useEffect(() => {
    const adminAuth = sessionStorage.getItem('admin_authenticated');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
      fetchNotifications();
    }
  }, [isAuthenticated]);

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      toast({ title: "Acceso concedido", description: "Bienvenido al panel de administrador" });
    } else {
      toast({ title: "Error", description: "Contraseña incorrecta", variant: "destructive" });
    }
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
    if (!newNotification.trim()) {
      toast({ title: "Error", description: "Escribe un mensaje", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from('notifications')
      .insert({ message: newNotification.trim() });

    if (error) {
      toast({ title: "Error", description: "No se pudo crear la notificación", variant: "destructive" });
      return;
    }

    setNewNotification('');
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="glass-card rounded-2xl p-8 w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold">Panel de Administrador</h1>
            <p className="text-muted-foreground text-sm">Ingresa la contraseña para continuar</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12"
            />
            <Button type="submit" className="w-full h-12">
              Ingresar
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-2xl font-bold gradient-text">Panel de Administrador</h1>
          <Button 
            variant="outline" 
            onClick={() => {
              sessionStorage.removeItem('admin_authenticated');
              setIsAuthenticated(false);
            }}
          >
            Cerrar Sesión
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'users' ? 'default' : 'secondary'}
            onClick={() => setActiveTab('users')}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Usuarios
          </Button>
          <Button
            variant={activeTab === 'notifications' ? 'default' : 'secondary'}
            onClick={() => setActiveTab('notifications')}
            className="flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            Notificaciones
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
                <Button type="submit">Agregar</Button>
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
                      user.status === 'suspended' ? 'bg-destructive/10 border-destructive/30' : 'bg-secondary/50 border-border/50'
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
              <form onSubmit={handleAddNotification} className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Mensaje de la notificación..."
                  value={newNotification}
                  onChange={(e) => setNewNotification(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">Enviar</Button>
              </form>
            </div>

            {/* Notifications list */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">Notificaciones Enviadas</h2>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border/50"
                  >
                    <div>
                      <p>{notification.message}</p>
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
