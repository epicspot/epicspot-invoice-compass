import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2 } from "lucide-react";
import { useRolePermissions, AppRole, PermissionResource, PermissionAction } from "@/hooks/useRolePermissions";

const RolePermissionsTable: React.FC = () => {
  const { permissions, loading, hasPermission, updatePermission } = useRolePermissions();

  const handlePermissionChange = async (
    role: AppRole,
    resource: PermissionResource,
    action: PermissionAction
  ) => {
    const currentValue = hasPermission(role, resource, action);
    await updatePermission(role, resource, action, !currentValue);
  };

  const resourceLabels: Record<PermissionResource, string> = {
    invoices: "Factures",
    quotes: "Devis",
    clients: "Clients",
    products: "Produits",
    suppliers: "Fournisseurs",
    users: "Utilisateurs",
    reports: "Rapports",
    settings: "Paramètres",
    cash_registers: "Caisses",
    collections: "Encaissements",
    markets: "Marchés",
    vendors: "Vendeurs"
  };

  const actionLabels: Record<PermissionAction, string> = {
    create: "Créer",
    read: "Voir",
    update: "Modifier",
    delete: "Supprimer"
  };

  const roleLabels: Record<AppRole, { label: string, color: string }> = {
    admin: { 
      label: "Administrateur", 
      color: "bg-destructive/10 text-destructive" 
    },
    manager: { 
      label: "Gestionnaire", 
      color: "bg-primary/10 text-primary" 
    },
    cashier: { 
      label: "Caissier", 
      color: "bg-accent/50 text-accent-foreground" 
    },
    user: { 
      label: "Utilisateur", 
      color: "bg-secondary/50 text-secondary-foreground" 
    },
    viewer: { 
      label: "Consultant", 
      color: "bg-muted text-muted-foreground" 
    }
  };

  const resources = Object.keys(resourceLabels) as PermissionResource[];
  const actions = Object.keys(actionLabels) as PermissionAction[];
  const roles = Object.keys(roleLabels) as AppRole[];

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Rôles & Permissions
        </CardTitle>
        <CardDescription>
          Configurez les permissions pour chaque rôle dans l'application.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {roles.map((role) => (
            <Badge 
              key={role}
              variant="outline" 
              className={`flex gap-1 font-normal items-center ${roleLabels[role].color}`}
            >
              <Avatar className="h-4 w-4 mr-1">
                <AvatarFallback className="text-[8px] bg-transparent">
                  {role.substring(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {roleLabels[role].label}
            </Badge>
          ))}
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Ressource</TableHead>
                <TableHead className="w-[100px]">Action</TableHead>
                {roles.map(role => (
                  <TableHead key={role} className="text-center">
                    {roleLabels[role].label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((resource) => (
                <>
                  {actions.map((action, actionIndex) => (
                    <TableRow key={`${resource}-${action}`}>
                      {actionIndex === 0 && (
                        <TableCell rowSpan={4} className="align-middle font-medium">
                          {resourceLabels[resource]}
                        </TableCell>
                      )}
                      <TableCell className="text-sm text-muted-foreground">
                        {actionLabels[action]}
                      </TableCell>
                      {roles.map(role => (
                        <TableCell key={role} className="text-center">
                          <div className="flex justify-center">
                            <Checkbox 
                              checked={hasPermission(role, resource, action)}
                              onCheckedChange={() => handlePermissionChange(role, resource, action)}
                              disabled={role === 'admin'}
                            />
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RolePermissionsTable;
