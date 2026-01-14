import React, { useState, useEffect } from 'react';
import { Shield, UserPlus, Trash2, Users, Crown, Eye, Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

type AppRole = 'admin' | 'manager' | 'user' | 'viewer';

interface UserWithRoles {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  roles: { id: string; role: AppRole }[];
}

const roleConfig: Record<AppRole, { label: string; color: string; icon: React.ReactNode; description: string }> = {
  admin: {
    label: 'Administrateur',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: <Crown className="w-3 h-3" />,
    description: 'Accès complet à toutes les fonctionnalités'
  },
  manager: {
    label: 'Manager',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: <Briefcase className="w-3 h-3" />,
    description: 'Gestion des équipes et paramètres'
  },
  user: {
    label: 'Utilisateur',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: <Users className="w-3 h-3" />,
    description: 'Accès aux fonctionnalités standard'
  },
  viewer: {
    label: 'Lecteur',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: <Eye className="w-3 h-3" />,
    description: 'Consultation uniquement'
  }
};

const RoleManagement = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<AppRole>('user');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [roleToRemove, setRoleToRemove] = useState<{ userId: string; roleId: string; roleName: string } | null>(null);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsersWithRoles();
  }, []);

  const fetchUsersWithRoles = async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, name, avatar')
        .order('name');

      if (profilesError) throw profilesError;

      // Fetch all roles
      const { data: allRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('id, user_id, role');

      if (rolesError) throw rolesError;

      // Combine profiles with their roles
      const usersWithRoles: UserWithRoles[] = (profiles || []).map(profile => ({
        id: profile.id,
        email: profile.email || '',
        name: profile.name,
        avatar: profile.avatar,
        roles: (allRoles || [])
          .filter(r => r.user_id === profile.id)
          .map(r => ({ id: r.id, role: r.role as AppRole }))
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les utilisateurs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      // Check if user already has this role
      if (user.roles.some(r => r.role === selectedRole)) {
        toast({
          title: 'Rôle déjà attribué',
          description: `Cet utilisateur a déjà le rôle ${roleConfig[selectedRole].label}`,
          variant: 'destructive'
        });
        return;
      }

      const { error } = await supabase.from('user_roles').insert({
        user_id: userId,
        role: selectedRole,
        created_by: currentUser?.id
      });

      if (error) throw error;

      toast({
        title: 'Rôle attribué',
        description: `Le rôle ${roleConfig[selectedRole].label} a été attribué avec succès`
      });

      await fetchUsersWithRoles();
      setSelectedUserId(null);
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'attribuer le rôle',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveRole = async () => {
    if (!roleToRemove) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleToRemove.roleId);

      if (error) throw error;

      toast({
        title: 'Rôle retiré',
        description: `Le rôle ${roleToRemove.roleName} a été retiré avec succès`
      });

      await fetchUsersWithRoles();
    } catch (error) {
      console.error('Error removing role:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de retirer le rôle',
        variant: 'destructive'
      });
    } finally {
      setRoleToRemove(null);
    }
  };

  const getRoleBadge = (role: AppRole, roleId: string, userId: string) => {
    const config = roleConfig[role];
    const isCurrentUser = userId === currentUser?.id && role === 'admin';

    return (
      <Badge
        key={roleId}
        variant="outline"
        className={`flex gap-1 items-center ${config.color} group relative`}
      >
        {config.icon}
        {config.label}
        {!isCurrentUser && (
          <button
            onClick={() => setRoleToRemove({ 
              userId, 
              roleId, 
              roleName: config.label 
            })}
            className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-64" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Gestion des Rôles
          </h1>
          <p className="text-muted-foreground mt-1">
            Attribuez et gérez les rôles des utilisateurs
          </p>
        </div>
      </div>

      {/* Role legend */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(Object.entries(roleConfig) as [AppRole, typeof roleConfig[AppRole]][]).map(([role, config]) => (
          <Card key={role} className="border-l-4" style={{ borderLeftColor: role === 'admin' ? '#dc2626' : role === 'manager' ? '#2563eb' : role === 'user' ? '#16a34a' : '#6b7280' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                {config.icon}
                <span className="font-semibold">{config.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">{config.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users list */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs ({users.length})</CardTitle>
          <CardDescription>
            Cliquez sur un utilisateur pour lui attribuer un nouveau rôle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map(user => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback>
                      {(user.name || user.email).substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {user.name || 'Sans nom'}
                      {user.id === currentUser?.id && (
                        <Badge variant="outline" className="ml-2 text-xs">Vous</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Current roles */}
                  <div className="flex gap-2 flex-wrap justify-end">
                    {user.roles.length > 0 ? (
                      user.roles.map(r => getRoleBadge(r.role, r.id, user.id))
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Aucun rôle
                      </Badge>
                    )}
                  </div>

                  {/* Add role button */}
                  {selectedUserId === user.id ? (
                    <div className="flex items-center gap-2">
                      <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.entries(roleConfig) as [AppRole, typeof roleConfig[AppRole]][]).map(([role, config]) => (
                            <SelectItem key={role} value={role}>
                              <div className="flex items-center gap-2">
                                {config.icon}
                                {config.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="sm" onClick={() => handleAssignRole(user.id)}>
                        Attribuer
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setSelectedUserId(null)}>
                        Annuler
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedUserId(user.id)}
                      className="gap-1"
                    >
                      <UserPlus className="h-4 w-4" />
                      Ajouter un rôle
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Aucun utilisateur trouvé
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation dialog for role removal */}
      <AlertDialog open={!!roleToRemove} onOpenChange={() => setRoleToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer le rôle</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir retirer le rôle "{roleToRemove?.roleName}" de cet utilisateur ?
              Cette action peut affecter ses permissions d'accès.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveRole} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Retirer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RoleManagement;
