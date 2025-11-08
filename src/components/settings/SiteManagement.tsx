
import React, { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Building, RefreshCw } from "lucide-react";
import { Site } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import SiteForm from "./SiteForm";
import CashRegisterManagement from "./CashRegisterManagement";
import { useSites } from "@/hooks/useSites";

interface SiteManagementProps {
  initialSites: Site[];
}

const SiteManagement: React.FC<SiteManagementProps> = ({ initialSites }) => {
  const { sites: fetchedSites, loading, refetch } = useSites();
  const [sites, setSites] = useState<Site[]>(initialSites);
  const [isAddingSite, setIsAddingSite] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (fetchedSites.length > 0) {
      setSites(fetchedSites);
    }
  }, [fetchedSites]);

  const handleAddSite = async (newSite: Site) => {
    try {
      const { data, error } = await supabase
        .from('sites')
        .insert([{
          name: newSite.name,
          address: newSite.address,
          phone: newSite.phone,
          email: newSite.email,
          use_headquarters_info: newSite.useHeadquartersInfo ?? true,
          tax_id: newSite.taxId,
          bank_account: newSite.bankAccount,
          bank_name: newSite.bankName,
          bank_iban: newSite.bankIBAN,
          bank_swift: newSite.bankSwift,
        }])
        .select()
        .single();

      if (error) throw error;

      await refetch();
      setIsAddingSite(false);
      toast({
        title: "Site ajouté",
        description: `Le site "${newSite.name}" a été ajouté avec succès.`
      });
    } catch (error) {
      console.error('Error adding site:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le site.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateSite = async (updatedSite: Site) => {
    try {
      const { error } = await supabase
        .from('sites')
        .update({
          name: updatedSite.name,
          address: updatedSite.address,
          phone: updatedSite.phone,
          email: updatedSite.email,
          use_headquarters_info: updatedSite.useHeadquartersInfo ?? true,
          tax_id: updatedSite.taxId,
          bank_account: updatedSite.bankAccount,
          bank_name: updatedSite.bankName,
          bank_iban: updatedSite.bankIBAN,
          bank_swift: updatedSite.bankSwift,
        })
        .eq('id', updatedSite.id);

      if (error) throw error;

      await refetch();
      setEditingSite(null);
      toast({
        title: "Site mis à jour",
        description: `Le site "${updatedSite.name}" a été mis à jour avec succès.`
      });
    } catch (error) {
      console.error('Error updating site:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le site.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSite = async (siteId: string) => {
    const siteToDelete = sites.find(site => site.id === siteId);
    
    if (siteToDelete?.isMainSite) {
      toast({
        title: "Action impossible",
        description: "Vous ne pouvez pas supprimer le site principal.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', siteId);

      if (error) throw error;

      await refetch();
      if (selectedSite?.id === siteId) {
        setSelectedSite(null);
      }
      toast({
        title: "Site supprimé",
        description: "Le site a été supprimé avec succès."
      });
    } catch (error) {
      console.error('Error deleting site:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le site.",
        variant: "destructive"
      });
    }
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
            Gérez les différents sites de votre entreprise et leur synchronisation avec le siège
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button onClick={() => setIsAddingSite(true)}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter un site
          </Button>
        </div>
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
              <TableHead>Synchronisation</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sites.map(site => (
              <TableRow key={site.id}>
                <TableCell className="font-medium">{site.name}</TableCell>
                <TableCell>{site.address}</TableCell>
                <TableCell>{site.phone}</TableCell>
                <TableCell>{site.email}</TableCell>
                <TableCell>
                  {site.isMainSite ? "Site principal" : "Succursale"}
                </TableCell>
                <TableCell>
                  {site.useHeadquartersInfo ? (
                    <Badge variant="secondary" className="gap-1">
                      <RefreshCw className="h-3 w-3" />
                      Synchronisé
                    </Badge>
                  ) : (
                    <Badge variant="outline">Indépendant</Badge>
                  )}
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
                    <Trash2 className="h-4 w-4 text-destructive" />
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
