
import React, { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CompanyInfo, Role, RolePermissions } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Shield } from "lucide-react";

// Mock data for role permissions
const initialRolePermissions: Record<Role, RolePermissions> = {
  admin: {
    invoices: { create: true, read: true, update: true, delete: true },
    quotes: { create: true, read: true, update: true, delete: true },
    clients: { create: true, read: true, update: true, delete: true },
    products: { create: true, read: true, update: true, delete: true },
    users: { create: true, read: true, update: true, delete: true },
    settings: { create: true, read: true, update: true, delete: true }
  },
  manager: {
    invoices: { create: true, read: true, update: true, delete: false },
    quotes: { create: true, read: true, update: true, delete: false },
    clients: { create: true, read: true, update: true, delete: false },
    products: { create: true, read: true, update: true, delete: false },
    users: { create: false, read: true, update: false, delete: false },
    settings: { create: false, read: true, update: false, delete: false }
  },
  accountant: {
    invoices: { create: true, read: true, update: true, delete: false },
    quotes: { create: false, read: true, update: false, delete: false },
    clients: { create: false, read: true, update: true, delete: false },
    products: { create: false, read: true, update: false, delete: false },
    users: { create: false, read: false, update: false, delete: false },
    settings: { create: false, read: false, update: false, delete: false }
  },
  viewer: {
    invoices: { create: false, read: true, update: false, delete: false },
    quotes: { create: false, read: true, update: false, delete: false },
    clients: { create: false, read: true, update: false, delete: false },
    products: { create: false, read: true, update: false, delete: false },
    users: { create: false, read: false, update: false, delete: false },
    settings: { create: false, read: false, update: false, delete: false }
  }
};

// Mock data for company info
const initialCompanyInfo: CompanyInfo = {
  name: "EPICSPOT_CONSULTING",
  address: "123 Business Avenue, Paris 75001",
  phone: "+33 1 23 45 67 89",
  email: "contact@epicspot.com",
  website: "www.epicspot.com",
  taxId: "FR 12345678901"
};

const Settings = () => {
  const [rolePermissions, setRolePermissions] = useState<Record<Role, RolePermissions>>(initialRolePermissions);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(initialCompanyInfo);
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

  const handleCompanyInfoChange = (field: keyof CompanyInfo, value: string) => {
    setCompanyInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveCompanyInfo = () => {
    // Here you would save to backend
    toast({
      title: "Informations sauvegardées",
      description: "Les informations de l'entreprise ont été mises à jour avec succès."
    });
  };

  const moduleLabels: Record<keyof RolePermissions, string> = {
    invoices: "Factures",
    quotes: "Devis",
    clients: "Clients",
    products: "Produits",
    users: "Utilisateurs",
    settings: "Paramètres"
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
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Paramètres</h1>
      
      <Tabs defaultValue="company">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="company">Entreprise</TabsTrigger>
          <TabsTrigger value="roles">Rôles & Permissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="company" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de l'entreprise</CardTitle>
              <CardDescription>
                Ces informations apparaîtront sur vos devis et factures.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom de l'entreprise</label>
                  <Input 
                    value={companyInfo.name} 
                    onChange={(e) => handleCompanyInfoChange('name', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Adresse</label>
                  <Input 
                    value={companyInfo.address} 
                    onChange={(e) => handleCompanyInfoChange('address', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Téléphone</label>
                  <Input 
                    value={companyInfo.phone || ''} 
                    onChange={(e) => handleCompanyInfoChange('phone', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input 
                    value={companyInfo.email || ''} 
                    onChange={(e) => handleCompanyInfoChange('email', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Site web</label>
                  <Input 
                    value={companyInfo.website || ''} 
                    onChange={(e) => handleCompanyInfoChange('website', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Numéro de TVA</label>
                  <Input 
                    value={companyInfo.taxId || ''} 
                    onChange={(e) => handleCompanyInfoChange('taxId', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Coordonnées bancaires</label>
                  <Input 
                    value={companyInfo.bankAccount || ''} 
                    onChange={(e) => handleCompanyInfoChange('bankAccount', e.target.value)} 
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveCompanyInfo}>Enregistrer</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="roles" className="mt-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
