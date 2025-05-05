
import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  FileCheck,
  Users, 
  Package, 
  Settings,
  Menu,
  X,
  UserCog
} from 'lucide-react';
import Logo from './Logo';

import {
  Sidebar as SidebarRoot,
  SidebarProvider,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Factures', path: '/invoices', icon: FileText },
    { name: 'Devis', path: '/quotes', icon: FileCheck },
    { name: 'Clients', path: '/clients', icon: Users },
    { name: 'Produits', path: '/products', icon: Package },
    { name: 'Utilisateurs', path: '/users', icon: UserCog },
    { name: 'Paramètres', path: '/settings', icon: Settings },
  ];

  return (
    <SidebarProvider defaultOpen={true}>
      <SidebarRoot>
        <SidebarHeader className="border-b border-sidebar-border flex items-center justify-between p-4">
          <Logo />
          <button
            className="sidebar-trigger block md:hidden"
            aria-label="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>
        </SidebarHeader>
        
        <SidebarContent className="p-2">
          <SidebarMenu>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive}
                    tooltip={item.name}
                  >
                    <a href={item.path} className="flex items-center gap-3">
                      <item.icon size={20} />
                      <span>{item.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        
        <SidebarFooter className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-foreground/70">
            EPICSPOT_CONSULTING
          </div>
        </SidebarFooter>
      </SidebarRoot>
    </SidebarProvider>
  );
};

export default Sidebar;
