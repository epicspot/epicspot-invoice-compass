
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/DataTable';
import { Client } from '@/lib/types';
import { Plus, Users, Edit, Trash } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import ClientForm from '@/components/ClientForm';
import { toast } from "@/components/ui/use-toast";
import { useDatabase } from '@/lib/contexts/DatabaseContext';

const columns = [
  { key: 'name', header: 'Nom / Raison sociale' },
  { key: 'address', header: 'Adresse' },
  { key: 'phone', header: 'Téléphone' },
  { key: 'code', header: 'Code client' },
];

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const { db, isInitialized } = useDatabase();
  
  // Load clients from the database
  useEffect(() => {
    const loadClients = async () => {
      if (!isInitialized) return;
      
      try {
        setIsLoading(true);
        const clientsList = await db.clients.getAll();
        setClients(clientsList);
      } catch (error) {
        console.error("Error loading clients:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les clients",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadClients();
  }, [db, isInitialized]);
  
  const handleCreateClient = async (client: Partial<Client>) => {
    try {
      const newClient = await db.clients.add(client as Omit<Client, 'id'>);
      setClients([...clients, newClient]);
      setIsCreating(false);
      
      toast({
        title: "Client créé",
        description: `Le client ${newClient.name} a été créé avec succès.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error creating client:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le client",
        variant: "destructive",
      });
    }
  };
  
  const handleEditClient = async (client: Partial<Client>) => {
    if (!client.id) return;
    
    try {
      const updatedClient = await db.clients.update(client as Client);
      setClients(clients.map(c => c.id === client.id ? updatedClient : c));
      setIsEditing(null);
      
      toast({
        title: "Client modifié",
        description: `Le client ${client.name} a été modifié avec succès.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating client:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le client",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteClient = async (id: string) => {
    const clientToDelete = clients.find(c => c.id === id);
    
    try {
      await db.clients.delete(id);
      setClients(clients.filter(c => c.id !== id));
      
      toast({
        title: "Client supprimé",
        description: `Le client ${clientToDelete?.name} a été supprimé.`,
        variant: "destructive",
      });
    } catch (error) {
      console.error("Error deleting client:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le client",
        variant: "destructive",
      });
    }
  };
  
  const actions = (client: Client) => (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <span className="sr-only">Actions</span>
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
            >
              <path
                d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                fill="currentColor"
              />
            </svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setIsEditing(client.id)}
          >
            <Edit className="h-4 w-4" /> Modifier
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 text-red-600 cursor-pointer"
            onClick={() => handleDeleteClient(client.id)}
          >
            <Trash className="h-4 w-4" /> Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
  
  if (isCreating) {
    return (
      <div className="p-6">
        <ClientForm onSubmit={handleCreateClient} />
      </div>
    );
  }
  
  if (isEditing) {
    const clientToEdit = clients.find(c => c.id === isEditing);
    
    return (
      <div className="p-6">
        <ClientForm 
          initialClient={clientToEdit} 
          onSubmit={handleEditClient} 
        />
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Clients
        </h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nouveau client
        </Button>
      </div>
      
      <DataTable 
        data={clients} 
        columns={columns} 
        actions={actions}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Clients;
