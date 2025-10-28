import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/DataTable';
import { Lead } from '@/lib/types';
import { Plus, Users2, Edit, Trash, UserPlus, Phone, Mail } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from "@/hooks/use-toast";
import { useLeads } from '@/hooks/useLeads';
import { useClients } from '@/hooks/useClients';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const statusConfig = {
  new: { label: 'Nouveau', color: 'bg-blue-100 text-blue-800' },
  contacted: { label: 'Contacté', color: 'bg-purple-100 text-purple-800' },
  qualified: { label: 'Qualifié', color: 'bg-yellow-100 text-yellow-800' },
  proposal: { label: 'Proposition', color: 'bg-orange-100 text-orange-800' },
  won: { label: 'Gagné', color: 'bg-green-100 text-green-800' },
  lost: { label: 'Perdu', color: 'bg-red-100 text-red-800' },
};

const Leads = () => {
  const { leads, createLead, updateLead, deleteLead, convertLeadToClient } = useLeads();
  const { createClient } = useClients();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Lead>>({});

  const columns = [
    { key: 'name', header: 'Nom' },
    { key: 'company', header: 'Entreprise' },
    { 
      key: 'phone', 
      header: 'Téléphone',
      cell: (item: Lead) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          {item.phone}
        </div>
      )
    },
    { 
      key: 'email', 
      header: 'Email',
      cell: (item: Lead) => item.email ? (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          {item.email}
        </div>
      ) : '-'
    },
    { 
      key: 'status', 
      header: 'Statut',
      cell: (item: Lead) => (
        <Badge className={statusConfig[item.status].color}>
          {statusConfig[item.status].label}
        </Badge>
      )
    },
    { 
      key: 'estimatedValue', 
      header: 'Valeur estimée',
      cell: (item: Lead) => item.estimatedValue ? 
        `${item.estimatedValue.toLocaleString()} FCFA` : '-'
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing) {
      updateLead(isEditing, formData);
      toast({
        title: "Lead modifié",
        description: "Le lead a été modifié avec succès.",
      });
      setIsEditing(null);
    } else {
      createLead(formData as Omit<Lead, 'id' | 'createdAt'>);
      toast({
        title: "Lead créé",
        description: "Le lead a été créé avec succès.",
      });
      setIsCreating(false);
    }
    
    setFormData({});
  };

  const handleConvertToClient = (leadId: string) => {
    const clientData = convertLeadToClient(leadId);
    if (clientData) {
      createClient(clientData);
      updateLead(leadId, { status: 'won' });
      toast({
        title: "Converti en client",
        description: "Le lead a été converti en client avec succès.",
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteLead(id);
    toast({
      title: "Lead supprimé",
      description: "Le lead a été supprimé.",
      variant: "destructive",
    });
  };

  const actions = (lead: Lead) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <span className="sr-only">Actions</span>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
            <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => {
          setFormData(lead);
          setIsEditing(lead.id);
        }}>
          <Edit className="h-4 w-4 mr-2" /> Modifier
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleConvertToClient(lead.id)}>
          <UserPlus className="h-4 w-4 mr-2" /> Convertir en client
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDelete(lead.id)} className="text-red-600">
          <Trash className="h-4 w-4 mr-2" /> Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users2 className="h-5 w-5" />
          Prospection / Leads
        </h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nouveau lead
        </Button>
      </div>
      
      <DataTable 
        data={leads} 
        columns={columns} 
        actions={actions}
      />

      <Dialog open={isCreating || !!isEditing} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setIsEditing(null);
          setFormData({});
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Modifier le lead' : 'Nouveau lead'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="company">Entreprise</Label>
                <Input
                  id="company"
                  value={formData.company || ''}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={formData.status || 'new'}
                  onValueChange={(value) => setFormData({ ...formData, status: value as Lead['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="estimatedValue">Valeur estimée (FCFA)</Label>
                <Input
                  id="estimatedValue"
                  type="number"
                  value={formData.estimatedValue || ''}
                  onChange={(e) => setFormData({ ...formData, estimatedValue: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => {
                setIsCreating(false);
                setIsEditing(null);
                setFormData({});
              }}>
                Annuler
              </Button>
              <Button type="submit">
                {isEditing ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Leads;
