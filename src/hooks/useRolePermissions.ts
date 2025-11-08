import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

export type PermissionResource = 
  | 'invoices' 
  | 'quotes' 
  | 'clients' 
  | 'products' 
  | 'suppliers' 
  | 'users' 
  | 'reports' 
  | 'settings' 
  | 'cash_registers' 
  | 'collections' 
  | 'markets' 
  | 'vendors';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete';
export type AppRole = 'admin' | 'manager' | 'user' | 'viewer' | 'cashier';

export interface RolePermission {
  id: string;
  role: AppRole;
  resource: PermissionResource;
  action: PermissionAction;
}

// Default permissions for each role
const defaultPermissions: RolePermission[] = [
  // Admin has all permissions (will be handled in hasPermission)
  
  // Manager permissions
  { id: '1', role: 'manager', resource: 'invoices', action: 'create' },
  { id: '2', role: 'manager', resource: 'invoices', action: 'read' },
  { id: '3', role: 'manager', resource: 'invoices', action: 'update' },
  { id: '4', role: 'manager', resource: 'quotes', action: 'create' },
  { id: '5', role: 'manager', resource: 'quotes', action: 'read' },
  { id: '6', role: 'manager', resource: 'quotes', action: 'update' },
  { id: '7', role: 'manager', resource: 'clients', action: 'create' },
  { id: '8', role: 'manager', resource: 'clients', action: 'read' },
  { id: '9', role: 'manager', resource: 'clients', action: 'update' },
  { id: '10', role: 'manager', resource: 'products', action: 'create' },
  { id: '11', role: 'manager', resource: 'products', action: 'read' },
  { id: '12', role: 'manager', resource: 'products', action: 'update' },
  { id: '13', role: 'manager', resource: 'cash_registers', action: 'read' },
  { id: '14', role: 'manager', resource: 'cash_registers', action: 'update' },
  { id: '15', role: 'manager', resource: 'reports', action: 'read' },
  
  // Cashier permissions
  { id: '26', role: 'cashier', resource: 'invoices', action: 'create' },
  { id: '27', role: 'cashier', resource: 'invoices', action: 'read' },
  { id: '28', role: 'cashier', resource: 'clients', action: 'create' },
  { id: '29', role: 'cashier', resource: 'clients', action: 'read' },
  { id: '30', role: 'cashier', resource: 'clients', action: 'update' },
  { id: '31', role: 'cashier', resource: 'products', action: 'read' },
  { id: '32', role: 'cashier', resource: 'cash_registers', action: 'create' },
  { id: '33', role: 'cashier', resource: 'cash_registers', action: 'read' },
  { id: '34', role: 'cashier', resource: 'cash_registers', action: 'update' },
  { id: '35', role: 'cashier', resource: 'collections', action: 'create' },
  { id: '36', role: 'cashier', resource: 'collections', action: 'read' },
  
  // User permissions
  { id: '16', role: 'user', resource: 'invoices', action: 'create' },
  { id: '17', role: 'user', resource: 'invoices', action: 'read' },
  { id: '18', role: 'user', resource: 'quotes', action: 'create' },
  { id: '19', role: 'user', resource: 'quotes', action: 'read' },
  { id: '20', role: 'user', resource: 'clients', action: 'read' },
  { id: '21', role: 'user', resource: 'products', action: 'read' },
  
  // Viewer permissions
  { id: '22', role: 'viewer', resource: 'invoices', action: 'read' },
  { id: '23', role: 'viewer', resource: 'quotes', action: 'read' },
  { id: '24', role: 'viewer', resource: 'clients', action: 'read' },
  { id: '25', role: 'viewer', resource: 'products', action: 'read' },
];

export function useRolePermissions() {
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Load from localStorage or use defaults
    const stored = localStorage.getItem('rolePermissions');
    if (stored) {
      setPermissions(JSON.parse(stored));
    } else {
      setPermissions(defaultPermissions);
    }
    setLoading(false);
  }, []);

  const updatePermission = async (
    role: AppRole,
    resource: PermissionResource,
    action: PermissionAction,
    enabled: boolean
  ) => {
    try {
      let newPermissions: RolePermission[];
      
      if (enabled) {
        // Add permission
        const newPerm: RolePermission = {
          id: Date.now().toString(),
          role,
          resource,
          action,
        };
        newPermissions = [...permissions, newPerm];
      } else {
        // Remove permission
        newPermissions = permissions.filter(
          p => !(p.role === role && p.resource === resource && p.action === action)
        );
      }

      setPermissions(newPermissions);
      localStorage.setItem('rolePermissions', JSON.stringify(newPermissions));
      
      toast({
        title: 'Permission mise à jour',
        description: 'La permission a été modifiée avec succès.',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la permission.',
        variant: 'destructive',
      });
    }
  };

  const hasPermission = (
    role: AppRole,
    resource: PermissionResource,
    action: PermissionAction
  ): boolean => {
    // Admin always has all permissions
    if (role === 'admin') return true;
    
    return permissions.some(
      p => p.role === role && p.resource === resource && p.action === action
    );
  };

  return {
    permissions,
    loading,
    hasPermission,
    updatePermission,
    refetch: () => {
      const stored = localStorage.getItem('rolePermissions');
      if (stored) {
        setPermissions(JSON.parse(stored));
      }
    },
  };
}
