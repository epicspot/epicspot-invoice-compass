
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  FileCheck,
  Users, 
  Package, 
  Settings,
  Menu,
  UserCog,
  Building,
  CreditCard
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Sidebar = () => {
  const location = useLocation();
  const [currentSite, setCurrentSite] = useState("site-1");

  // Mock sites pour le menu déroulant
  const sites = [
    { id: "site-1", name: "Siège Paris" },
    { id: "site-2", name: "Succursale Lyon" }
  ];

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

  return (
    <SidebarRoot>
      <SidebarHeader className="border-b border-sidebar-border flex flex-col items-start justify-between p-4 gap-4">
        <div className="flex w-full items-center justify-between">
          <Logo />
          <button
            className="sidebar-trigger block md:hidden"
            aria-label="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>
        </div>
        
        <div className="w-full">
          <Select value={currentSite} onValueChange={setCurrentSite}>
            <SelectTrigger className="w-full bg-sidebar text-sidebar-foreground border-sidebar-border">
              <div className="flex items-center">
                <Building className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sélectionnez un site" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {sites.map((site) => (
                <SelectItem key={site.id} value={site.id}>
                  {site.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
                  <Link to={item.path} className="flex items-center gap-3">
                    <item.icon size={20} />
                    <span>{item.name}</span>
                  </Link>
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
  );
};

export default Sidebar;
