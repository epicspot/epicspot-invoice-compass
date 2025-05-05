
import React, { useState } from "react";
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
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Building } from "lucide-react";
import { Site } from "@/lib/types";
import SiteForm from "./SiteForm";
import CashRegisterManagement from "./CashRegisterManagement";

interface SiteManagementProps {
  initialSites: Site[];
}

const SiteManagement: React.FC<SiteManagementProps> = ({ initialSites }) => {
  const [sites, setSites] = useState<Site[]>(initialSites);
  const [isAddingSite, setIsAddingSite] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const { toast } = useToast();

  const handleAddSite = (newSite: Site) => {
    setSites([...sites, newSite]);
    setIsAddingSite(false);
    toast({
      title: "Site ajouté",
      description: `Le site "${newSite.name}" a été ajouté avec succès.`
    });
  };

  const handleUpdateSite = (updatedSite: Site) => {
    setSites(sites.map(site => site.id === updatedSite.id ? updatedSite : site));
    setEditingSite(null);
    toast({
      title: "Site mis à jour",
      description: `Le site "${updatedSite.name}" a été mis à jour avec succès.`
    });
  };

  const handleDeleteSite = (siteId: string) => {
    const siteToDelete = sites.find(site => site.id === siteId);
    
    if (siteToDelete?.isMainSite) {
      toast({
        title: "Action impossible",
        description: "Vous ne pouvez pas supprimer le site principal.",
        variant: "destructive"
      });
      return;
    }

    setSites(sites.filter(site => site.id !== siteId));
    if (selectedSite?.id === siteId) {
      setSelectedSite(null);
    }
    toast({
      title: "Site supprimé",
      description: "Le site a été supprimé avec succès."
    });
  };

  const handleSelectSite = (site: Site) => {
    setSelectedSite(site);
  };

  if (selectedSite) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setSelectedSite(null)}
            >
              Retour aux sites
            </Button>
            <h2 className="text-2xl font-semibold">{selectedSite.name}</h2>
          </div>
        </div>
        
        <CashRegisterManagement siteId={selectedSite.id} />
      </div>
    );
  }

  if (isAddingSite) {
    return (
      <SiteForm 
        onSave={handleAddSite} 
        onCancel={() => setIsAddingSite(false)} 
      />
    );
  }

  if (editingSite) {
    return (
      <SiteForm 
        site={editingSite} 
        onSave={handleUpdateSite} 
        onCancel={() => setEditingSite(null)} 
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Sites</CardTitle>
          <CardDescription>
            Gérez les différents sites de votre entreprise
          </CardDescription>
        </div>
        <Button onClick={() => setIsAddingSite(true)}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter un site
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sites.map(site => (
              <TableRow key={site.id}>
                <TableCell>{site.name}</TableCell>
                <TableCell>{site.address}</TableCell>
                <TableCell>{site.phone}</TableCell>
                <TableCell>{site.email}</TableCell>
                <TableCell>
                  {site.isMainSite ? "Site principal" : "Succursale"}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSelectSite(site)}
                  >
                    <Building className="h-4 w-4 mr-1" /> Caisses
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setEditingSite(site)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    disabled={site.isMainSite}
                    onClick={() => handleDeleteSite(site.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SiteManagement;
