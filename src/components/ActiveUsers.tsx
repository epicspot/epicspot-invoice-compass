import React from 'react';
import { Users, Circle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { usePresence } from '@/hooks/usePresence';

export function ActiveUsers() {
  const { activeUsers } = usePresence();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Utilisateurs Actifs
          <span className="text-sm text-muted-foreground ml-2">({activeUsers.length})</span>
        </CardTitle>
        <CardDescription>
          Qui travaille actuellement sur l'application
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activeUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun utilisateur actif pour le moment
          </p>
        ) : (
          <div className="space-y-3">
            {activeUsers.map((user) => (
              <div key={user.user_id} className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {user.user_id.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Circle className="absolute -bottom-1 -right-1 h-3 w-3 fill-green-500 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    Utilisateur {user.user_id.substring(0, 8)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.current_page || 'Page inconnue'}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(user.last_seen).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
