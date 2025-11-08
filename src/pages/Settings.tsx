
import React from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import CompanyInfoForm from "@/components/settings/CompanyInfoForm";
import DocumentSettingsForm from "@/components/settings/DocumentSettingsForm";
import RolePermissionsTable from "@/components/settings/RolePermissionsTable";
import SiteManagement from "@/components/settings/SiteManagement";
import { VATRatesManagement } from "@/components/settings/VATRatesManagement";
import { SystemSettings } from "@/components/settings/SystemSettings";
import { Role, RolePermissions, Site } from "@/lib/types";

// Mock data for role permissions
const initialRolePermissions: Record<Role, RolePermissions> = {
  admin: {
    invoices: { create: true, read: true, update: true, delete: true },
    quotes: { create: true, read: true, update: true, delete: true },
    clients: { create: true, read: true, update: true, delete: true },
    products: { create: true, read: true, update: true, delete: true },
    users: { create: true, read: true, update: true, delete: true },
    settings: { create: true, read: true, update: true, delete: true },
    cashRegister: { create: true, read: true, update: true, delete: true },
    sites: { create: true, read: true, update: true, delete: true }
  },
  manager: {
    invoices: { create: true, read: true, update: true, delete: false },
    quotes: { create: true, read: true, update: true, delete: false },
    clients: { create: true, read: true, update: true, delete: false },
    products: { create: true, read: true, update: true, delete: false },
    users: { create: false, read: true, update: false, delete: false },
    settings: { create: false, read: true, update: false, delete: false },
    cashRegister: { create: true, read: true, update: true, delete: false },
    sites: { create: false, read: true, update: false, delete: false }
  },
  accountant: {
    invoices: { create: true, read: true, update: true, delete: false },
    quotes: { create: false, read: true, update: false, delete: false },
    clients: { create: false, read: true, update: true, delete: false },
    products: { create: false, read: true, update: false, delete: false },
    users: { create: false, read: false, update: false, delete: false },
    settings: { create: false, read: false, update: false, delete: false },
    cashRegister: { create: false, read: true, update: true, delete: false },
    sites: { create: false, read: true, update: false, delete: false }
  },
  cashier: {
    invoices: { create: true, read: true, update: false, delete: false },
    quotes: { create: false, read: true, update: false, delete: false },
    clients: { create: true, read: true, update: true, delete: false },
    products: { create: false, read: true, update: false, delete: false },
    users: { create: false, read: false, update: false, delete: false },
    settings: { create: false, read: false, update: false, delete: false },
    cashRegister: { create: true, read: true, update: true, delete: false },
    sites: { create: false, read: true, update: false, delete: false }
  },
  viewer: {
    invoices: { create: false, read: true, update: false, delete: false },
    quotes: { create: false, read: true, update: false, delete: false },
    clients: { create: false, read: true, update: false, delete: false },
    products: { create: false, read: true, update: false, delete: false },
    users: { create: false, read: false, update: false, delete: false },
    settings: { create: false, read: false, update: false, delete: false },
    cashRegister: { create: false, read: true, update: false, delete: false },
    sites: { create: false, read: true, update: false, delete: false }
  }
};

// Mock data for sites
const initialSites: Site[] = [];

const Settings = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Paramètres</h1>
      
      <Tabs defaultValue="company">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="company">Entreprise</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="vat">TVA</TabsTrigger>
          <TabsTrigger value="roles">Rôles & Permissions</TabsTrigger>
          <TabsTrigger value="sites">Sites</TabsTrigger>
          <TabsTrigger value="system">Système</TabsTrigger>
        </TabsList>
        
        <TabsContent value="company" className="mt-6">
          <CompanyInfoForm />
        </TabsContent>
        
        <TabsContent value="documents" className="mt-6">
          <DocumentSettingsForm />
        </TabsContent>
        
        <TabsContent value="vat" className="mt-6">
          <VATRatesManagement />
        </TabsContent>
        
        <TabsContent value="roles" className="mt-6">
          <RolePermissionsTable initialRolePermissions={initialRolePermissions} />
        </TabsContent>

        <TabsContent value="sites" className="mt-6">
          <SiteManagement initialSites={initialSites} />
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
