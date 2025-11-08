
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
import EmailTemplatesManagement from "@/components/settings/EmailTemplatesManagement";
import { Site } from "@/lib/types";

// Mock data for sites
const initialSites: Site[] = [];

const Settings = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Paramètres</h1>
      
      <Tabs defaultValue="company">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="company">Entreprise</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="vat">TVA</TabsTrigger>
          <TabsTrigger value="roles">Rôles & Permissions</TabsTrigger>
          <TabsTrigger value="sites">Sites</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
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
          <RolePermissionsTable />
        </TabsContent>

        <TabsContent value="sites" className="mt-6">
          <SiteManagement initialSites={initialSites} />
        </TabsContent>

        <TabsContent value="emails" className="mt-6">
          <EmailTemplatesManagement />
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;