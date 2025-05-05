
import React, { useState } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  MoreVertical,
  Shield,
  UserCheck,
  UserX
} from "lucide-react";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import UserForm from "@/components/UserForm";
import { User, Role } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const mockUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@epicspot.com",
    role: "admin",
    active: true,
    createdAt: "2023-01-01",
    lastLogin: "2023-05-01"
  },
  {
    id: "2",
    name: "Manager User",
    email: "manager@epicspot.com",
    role: "manager",
    active: true,
    createdAt: "2023-02-15",
    lastLogin: "2023-05-02"
  },
  {
    id: "3",
    name: "Accountant User",
    email: "accountant@epicspot.com",
    role: "accountant",
    active: true,
    createdAt: "2023-03-20",
    lastLogin: "2023-05-03"
  },
  {
    id: "4",
    name: "Viewer User",
    email: "viewer@epicspot.com",
    role: "viewer",
    active: false,
    createdAt: "2023-04-10"
  }
];

const getRoleBadge = (role: Role) => {
  const variants: Record<Role, { color: string, icon: React.ReactNode }> = {
    admin: { 
      color: "bg-red-100 text-red-800 hover:bg-red-100", 
      icon: <Shield className="w-3 h-3" /> 
    },
    manager: { 
      color: "bg-blue-100 text-blue-800 hover:bg-blue-100", 
      icon: <Shield className="w-3 h-3" /> 
    },
    accountant: { 
      color: "bg-green-100 text-green-800 hover:bg-green-100", 
      icon: null 
    },
    viewer: { 
      color: "bg-gray-100 text-gray-800 hover:bg-gray-100", 
      icon: null 
    },
  };

  return (
    <Badge 
      variant="outline" 
      className={`flex gap-1 font-normal items-center capitalize ${variants[role].color}`}
    >
      {variants[role].icon}
      {role}
    </Badge>
  );
};

const Users = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [editing, setEditing] = useState<User | null>(null);
  const [openUserForm, setOpenUserForm] = useState(false);
  const { toast } = useToast();

  const handleAddUser = (newUser: User) => {
    setUsers([...users, { ...newUser, id: Date.now().toString() }]);
    toast({
      title: "Utilisateur créé",
      description: `${newUser.name} a été ajouté avec succès.`
    });
    setOpenUserForm(false);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
    toast({
      title: "Utilisateur mis à jour",
      description: `${updatedUser.name} a été mis à jour avec succès.`
    });
    setEditing(null);
    setOpenUserForm(false);
  };

  const handleDeleteUser = (id: string) => {
    const userToDelete = users.find(u => u.id === id);
    setUsers(users.filter(user => user.id !== id));
    toast({
      title: "Utilisateur supprimé",
      description: `${userToDelete?.name} a été supprimé.`,
      variant: "destructive"
    });
  };

  const handleToggleActive = (id: string) => {
    setUsers(users.map(user => {
      if (user.id === id) {
        const updatedUser = { ...user, active: !user.active };
        toast({
          title: updatedUser.active ? "Utilisateur activé" : "Utilisateur désactivé",
          description: `${user.name} a été ${updatedUser.active ? "activé" : "désactivé"}.`
        });
        return updatedUser;
      }
      return user;
    }));
  };

  const columns = [
    {
      key: "name",
      header: "Utilisateur",
      cell: (user: User) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Rôle",
      cell: (user: User) => getRoleBadge(user.role),
    },
    {
      key: "active",
      header: "Statut",
      cell: (user: User) => (
        <Badge variant={user.active ? "default" : "outline"} className="font-normal">
          {user.active ? "Actif" : "Inactif"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Date de création",
      cell: (user: User) => new Date(user.createdAt).toLocaleDateString("fr-FR"),
    },
    {
      key: "lastLogin",
      header: "Dernière connexion",
      cell: (user: User) => user.lastLogin 
        ? new Date(user.lastLogin).toLocaleDateString("fr-FR") 
        : "Jamais"
    },
  ];

  const actions = (user: User) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => {
          setEditing(user);
          setOpenUserForm(true);
        }}>
          <Edit className="mr-2 h-4 w-4" />
          Modifier
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleToggleActive(user.id)}>
          {user.active ? (
            <>
              <UserX className="mr-2 h-4 w-4" />
              Désactiver
            </>
          ) : (
            <>
              <UserCheck className="mr-2 h-4 w-4" />
              Activer
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleDeleteUser(user.id)}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Utilisateurs</h1>
        <Dialog open={openUserForm} onOpenChange={setOpenUserForm}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editing ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'}</DialogTitle>
            </DialogHeader>
            <UserForm 
              user={editing || undefined}
              onSubmit={editing ? handleUpdateUser : handleAddUser}
              onCancel={() => {
                setEditing(null);
                setOpenUserForm(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable data={users} columns={columns} actions={actions} />
    </div>
  );
};

export default Users;
