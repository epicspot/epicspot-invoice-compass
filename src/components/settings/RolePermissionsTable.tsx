import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Role, RolePermissions, Permission } from "@/lib/types";

interface RolePermissionsTableProps {
  initialRolePermissions: Record<Role, RolePermissions>;
}

const RolePermissionsTable: React.FC<RolePermissionsTableProps> = ({ initialRolePermissions }) => {
  const [rolePermissions, setRolePermissions] = useState<Record<Role, RolePermissions>>(initialRolePermissions);
  const { toast } = useToast();

  const handlePermissionChange = (role: Role, module: keyof RolePermissions, action: keyof Permission) => {
    setRolePermissions(prev => {
      const newPermissions = { ...prev };
      newPermissions[role][module][action] = !newPermissions[role][module][action];
      return newPermissions;
    });
  };

  const handleSavePermissions = () => {
    // Here you would save to backend
    toast({
      title: "Permissions sauvegardées",
      description: "Les permissions des rôles ont été mises à jour avec succès."
    });
  };

  const moduleLabels: Record<keyof RolePermissions, string> = {
    invoices: "Factures",
    quotes: "Devis",
    clients: "Clients",
    products: "Produits",
    users: "Utilisateurs",
    settings: "Paramètres",
    cashRegister: "Caisse", // Added missing property
    sites: "Sites" // Added missing property
  };

  const actionLabels: Record<keyof Permission, string> = {
    create: "Créer",
    read: "Voir",
    update: "Modifier",
    delete: "Supprimer"
  };

  const roleLabels: Record<Role, { label: string, color: string }> = {
    admin: { 
      label: "Administrateur", 
      color: "bg-red-100 text-red-800 hover:bg-red-100" 
    },
    manager: { 
      label: "Gestionnaire", 
      color: "bg-blue-100 text-blue-800 hover:bg-blue-100" 
    },
    accountant: { 
      label: "Comptable", 
      color: "bg-green-100 text-green-800 hover:bg-green-100" 
    },
    viewer: { 
      label: "Consultant", 
      color: "bg-gray-100 text-gray-800 hover:bg-gray-100" 
    }
  };

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
          {Object.entries(roleLabels).map(([roleKey, { label, color }]) => (
            <Badge 
              key={roleKey}
              variant="outline" 
              className={`flex gap-1 font-normal items-center capitalize ${color}`}
            >
              <Avatar className="h-4 w-4 mr-1">
                <AvatarFallback className="text-[8px]">
                  {roleKey.substring(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {label}
            </Badge>
          ))}
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Module</TableHead>
              <TableHead>Actions</TableHead>
              {(Object.keys(roleLabels) as Role[]).map(role => (
                <TableHead key={role}>
                  {roleLabels[role].label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(moduleLabels).map(([moduleKey, moduleLabel]) => (
              <>
                {Object.entries(actionLabels).map(([actionKey, actionLabel], actionIndex) => (
                  <TableRow key={`${moduleKey}-${actionKey}`}>
                    {actionIndex === 0 && (
                      <TableCell rowSpan={4} className="align-middle font-medium">
                        {moduleLabel}
                      </TableCell>
                    )}
                    <TableCell>{actionLabel}</TableCell>
                    {(Object.keys(roleLabels) as Role[]).map(role => (
                      <TableCell key={role}>
                        <Checkbox 
                          checked={rolePermissions[role][moduleKey as keyof RolePermissions][actionKey as keyof Permission]}
                          onCheckedChange={() => handlePermissionChange(
                            role, 
                            moduleKey as keyof RolePermissions, 
                            actionKey as keyof Permission
                          )}
                          disabled={role === 'admin'} // Admin has all permissions by default
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            ))}
          </TableBody>
        </Table>
        
        <div className="flex justify-end">
          <Button onClick={handleSavePermissions}>Enregistrer les permissions</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RolePermissionsTable;
