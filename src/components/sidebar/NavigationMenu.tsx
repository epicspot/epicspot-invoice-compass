
import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  FileCheck,
  Users, 
  Package, 
  Settings,
  UserCog,
  CreditCard
} from 'lucide-react';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

interface NavigationMenuProps {
  onItemClick?: (path: string) => void;
  currentPath?: string;
}

const NavigationMenu = ({ onItemClick, currentPath = '' }: NavigationMenuProps) => {
  const menuItems = [
    { name: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Factures', path: '/invoices', icon: FileText },
    { name: 'Devis', path: '/quotes', icon: FileCheck },
    { name: 'Clients', path: '/clients', icon: Users },
    { name: 'Produits', path: '/products', icon: Package },
    { name: 'Caisses', path: '/cash-registers', icon: CreditCard },
    { name: 'Utilisateurs', path: '/users', icon: UserCog },
    { name: 'Paramètres', path: '/settings', icon: Settings },
  ];

  const handleMenuClick = (path: string) => {
    console.log("Navigation Menu: Clicking path:", path);
    if (onItemClick) {
      onItemClick(path);
    }
  };

  return (
    <SidebarMenu>
      {menuItems.map((item) => {
        // Simplifier la vérification pour une route active
        const isActive = currentPath === item.path;
        
        return (
          <SidebarMenuItem key={item.path}>
            <SidebarMenuButton 
              asChild 
              isActive={isActive}
              tooltip={item.name}
              onClick={() => handleMenuClick(item.path)}
            >
              <div className={`flex items-center gap-3 cursor-pointer p-2 rounded-md transition-colors ${isActive ? 'bg-sidebar-accent text-white font-medium' : 'hover:bg-sidebar-accent/50'}`}>
                <item.icon size={20} />
                <span>{item.name}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
};

export default NavigationMenu;
