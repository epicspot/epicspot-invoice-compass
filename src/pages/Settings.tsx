
import React from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import CompanyInfoForm from "@/components/settings/CompanyInfoForm";
import RolePermissionsTable from "@/components/settings/RolePermissionsTable";
import SiteManagement from "@/components/settings/SiteManagement";
import { Role, RolePermissions, CompanyInfo, Site } from "@/lib/types";

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

// Mock data for company info
const initialCompanyInfo: CompanyInfo = {
  name: "EPICSPOT_CONSULTING",
  address: "123 Business Avenue, Paris 75001",
  phone: "+33 1 23 45 67 89",
  email: "contact@epicspot.com",
  website: "www.epicspot.com",
  taxId: "FR 12345678901"
};

// Mock data for sites
const initialSites: Site[] = [
  {
    id: "site-1",
    name: "Siège Paris",
    address: "123 Business Avenue, Paris 75001",
    phone: "+33 1 23 45 67 89",
    email: "paris@epicspot.com",
    isMainSite: true
  },
  {
    id: "site-2",
    name: "Succursale Lyon",
    address: "45 Rue du Commerce, Lyon 69002",
    phone: "+33 4 56 78 90 12",
    email: "lyon@epicspot.com",
    isMainSite: false
  }
];

const Settings = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Paramètres</h1>
      
      <Tabs defaultValue="company">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="company">Entreprise</TabsTrigger>
          <TabsTrigger value="roles">Rôles & Permissions</TabsTrigger>
          <TabsTrigger value="sites">Sites</TabsTrigger>
        </TabsList>
        
        <TabsContent value="company" className="mt-6">
          <CompanyInfoForm initialCompanyInfo={initialCompanyInfo} />
        </TabsContent>
        
        <TabsContent value="roles" className="mt-6">
          <RolePermissionsTable initialRolePermissions={initialRolePermissions} />
        </TabsContent>

        <TabsContent value="sites" className="mt-6">
          <SiteManagement initialSites={initialSites} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
