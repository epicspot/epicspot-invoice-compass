
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Role } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  email: z.string().email({
    message: "Format d'email invalide.",
  }),
  role: z.enum(["admin", "manager", "accountant", "cashier", "viewer"] as const),
  active: z.boolean().default(true),
});

interface UserFormProps {
  user?: User;
  onSubmit: (data: User) => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "viewer",
      active: user?.active ?? true,
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit({
      id: user?.id || "",
      name: data.name,
      email: data.email,
      role: data.role,
      active: data.active,
      createdAt: user?.createdAt || new Date().toISOString(),
      lastLogin: user?.lastLogin,
    });
  };

  const roleLabels: Record<Role, string> = {
    admin: "Administrateur",
    manager: "Gestionnaire",
    accountant: "Comptable",
    cashier: "Caissier",
    viewer: "Consultant"
  };

  const roleDescriptions: Record<Role, string> = {
    admin: "Accès complet à toutes les fonctionnalités",
    manager: "Gestion des devis, factures et clients",
    accountant: "Accès aux factures et aux rapports financiers",
    cashier: "Gestion des caisses et ventes au comptoir",
    viewer: "Consultation uniquement"
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom complet</FormLabel>
              <FormControl>
                <Input placeholder="Nom de l'utilisateur" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rôle</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(Object.keys(roleLabels) as Role[]).map((role) => (
                    <SelectItem key={role} value={role} className="flex flex-col items-start">
                      <div>{roleLabels[role]}</div>
                      <div className="text-xs text-muted-foreground">{roleDescriptions[role]}</div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Utilisateur actif</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Les utilisateurs inactifs ne peuvent pas se connecter à l'application.
                </p>
              </div>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit">
            {user ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UserForm;
