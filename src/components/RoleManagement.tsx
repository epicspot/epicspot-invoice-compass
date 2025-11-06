import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRoles, AppRole } from '@/hooks/useRoles';
import { Shield, UserCog, Eye, Users, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const roleIcons = {
  admin: Shield,
  manager: UserCog,
  user: Users,
  viewer: Eye
};

const roleColors = {
  admin: 'bg-red-500',
  manager: 'bg-blue-500',
  user: 'bg-green-500',
  viewer: 'bg-gray-500'
};

const roleDescriptions = {
  admin: 'Accès complet à toutes les fonctionnalités',
  manager: 'Gestion des utilisateurs et des données',
  user: 'Accès standard aux fonctionnalités',
  viewer: 'Consultation uniquement'
};

interface RoleManagementProps {
  userId: string;
  userEmail?: string;
}

export function RoleManagement({ userId, userEmail }: RoleManagementProps) {
  const { roles, loading, isAdmin, assignRole, removeRole } = useRoles(userId);
  const [selectedRole, setSelectedRole] = useState<AppRole>('user');

  const handleAssignRole = async () => {
    try {
      await assignRole(userId, selectedRole);
      toast.success(`Rôle ${selectedRole} attribué avec succès`);
    } catch (error) {
      toast.error('Erreur lors de l\'attribution du rôle');
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    try {
      await removeRole(roleId);
      toast.success('Rôle retiré avec succès');
    } catch (error) {
      toast.error('Erreur lors du retrait du rôle');
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Vous n'avez pas les permissions pour gérer les rôles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des rôles</CardTitle>
        <CardDescription>
          {userEmail || 'Gérer les rôles de cet utilisateur'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Attribuer un nouveau rôle */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Attribuer un nouveau rôle</h3>
          <div className="flex gap-2">
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as AppRole)}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(['admin', 'manager', 'user', 'viewer'] as AppRole[]).map((role) => {
                  const Icon = roleIcons[role];
                  return (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium capitalize">{role}</div>
                          <div className="text-xs text-muted-foreground">
                            {roleDescriptions[role]}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Button onClick={handleAssignRole}>
              Attribuer
            </Button>
          </div>
        </div>

        {/* Liste des rôles actuels */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Rôles actuels</h3>
          {loading ? (
            <div className="text-sm text-muted-foreground">Chargement...</div>
          ) : roles.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Aucun rôle attribué
            </div>
          ) : (
            <div className="space-y-2">
              {roles.map((role) => {
                const Icon = roleIcons[role.role];
                const colorClass = roleColors[role.role];
                
                return (
                  <div
                    key={role.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${colorClass} text-white p-2 rounded-lg`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium capitalize">{role.role}</div>
                        <div className="text-xs text-muted-foreground">
                          {roleDescriptions[role.role]}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveRole(role.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Légende des permissions */}
        <div className="space-y-2 p-4 bg-muted rounded-lg">
          <h3 className="text-sm font-medium">Légende des rôles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {(['admin', 'manager', 'user', 'viewer'] as AppRole[]).map((role) => {
              const Icon = roleIcons[role];
              const colorClass = roleColors[role];
              
              return (
                <div key={role} className="flex items-center gap-2">
                  <div className={`${colorClass} text-white p-1 rounded`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <span className="capitalize font-medium">{role}:</span>
                  <span className="text-muted-foreground">{roleDescriptions[role]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
