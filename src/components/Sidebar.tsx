import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  CreditCard,
  Users2,
  PackageSearch,
  Bell,
  BarChart3,
  ShoppingCart,
  Truck,
  ShoppingBag,
  LineChart,
  LogOut,
  Wallet,
  Shield,
  Plug,
  Sparkles,
  Wifi,
  Receipt,
  Briefcase,
  Layout,
  Activity,
  FileText as LogsIcon,
  TrendingUp,
  Lock
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { NotificationCenter } from '@/components/NotificationCenter';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ThemeCustomizer } from '@/components/ThemeCustomizer';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

type UserRole = 'admin' | 'manager' | 'user' | 'viewer';

interface MenuItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
  requiredRoles?: UserRole[];
  hidden?: boolean;
}

// Définir quels rôles peuvent accéder à chaque route
const getMenuItems = (t: (key: string) => string): MenuItem[] => [
  { name: t('nav.dashboard'), path: '/dashboard', icon: LayoutDashboard },
  { name: t('nav.pos'), path: '/pos', icon: ShoppingCart },
  { name: t('nav.invoices'), path: '/invoices', icon: FileText },
  { name: t('nav.quotes'), path: '/quotes', icon: FileCheck },
  { name: t('nav.clients'), path: '/clients', icon: Users },
  { name: 'Abonnements Internet', path: '/subscriptions', icon: Wifi },
  { name: 'Factures Abonnements', path: '/subscriptions/invoices', icon: Receipt },
  { name: t('nav.leads'), path: '/leads', icon: Users2 },
  { name: t('nav.products'), path: '/products', icon: Package },
  { name: t('nav.inventory'), path: '/inventory', icon: PackageSearch },
  { name: t('nav.suppliers'), path: '/suppliers', icon: Truck },
  { name: t('nav.purchaseOrders'), path: '/purchase-orders', icon: ShoppingBag },
  { name: 'Marchés', path: '/markets', icon: Briefcase },
  { name: 'Templates Documents', path: '/document-templates', icon: Layout },
  { name: 'Monitoring', path: '/monitoring', icon: Activity, requiredRoles: ['admin'] },
  { name: 'Journal Système', path: '/logs', icon: LogsIcon, requiredRoles: ['admin'] },
  { name: 'Supervision Globale', path: '/supervision', icon: TrendingUp, requiredRoles: ['admin'] },
  { name: t('nav.analytics'), path: '/analytics', icon: LineChart },
  { name: 'Analytics Avancé', path: '/advanced-analytics', icon: BarChart3 },
  { name: t('nav.cashRegisters'), path: '/cash-registers', icon: CreditCard },
  { name: t('nav.vendors'), path: '/vendors', icon: UserCog },
  { name: t('nav.collections'), path: '/collections', icon: Wallet },
  { name: t('nav.collectionsDashboard'), path: '/collections/dashboard', icon: BarChart3 },
  { name: 'Sécurité & Audit', path: '/security', icon: Shield, requiredRoles: ['admin'] },
  { name: 'Intégrations', path: '/integrations', icon: Plug },
  { name: 'Fonctionnalités Avancées', path: '/advanced-features', icon: Sparkles },
  { name: t('nav.reminders'), path: '/reminders', icon: Bell },
  { name: t('nav.reports'), path: '/reports', icon: BarChart3 },
  { name: 'Déclarations TVA', path: '/tax-declarations', icon: Receipt },
  { name: 'Dashboard TVA', path: '/tax-analytics', icon: BarChart3 },
  { name: t('nav.users'), path: '/users', icon: UserCog, requiredRoles: ['admin'] },
  { name: 'Gestion des Rôles', path: '/roles', icon: Shield, requiredRoles: ['admin'] },
  { name: t('nav.settings'), path: '/settings', icon: Settings, requiredRoles: ['admin', 'manager'] },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [currentSite, setCurrentSite] = useState("site-1");

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Mock sites pour le menu déroulant
  const sites = [
    { id: "site-1", name: "Siège Paris" },
    { id: "site-2", name: "Succursale Lyon" }
  ];

  const menuItems = getMenuItems(t);
  const userRole = (user?.role as UserRole) || 'viewer';

  // Vérifier si l'utilisateur a accès à un élément de menu
  const hasAccess = (item: MenuItem): boolean => {
    if (!item.requiredRoles || item.requiredRoles.length === 0) {
      return true;
    }
    return item.requiredRoles.includes(userRole);
  };

  // Obtenir le badge de rôle
  const getRoleBadge = () => {
    const roleLabels: Record<UserRole, { label: string; color: string }> = {
      admin: { label: 'Admin', color: 'bg-red-100 text-red-700 border-red-200' },
      manager: { label: 'Manager', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      user: { label: 'Utilisateur', color: 'bg-green-100 text-green-700 border-green-200' },
      viewer: { label: 'Lecteur', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    };
    return roleLabels[userRole] || roleLabels.viewer;
  };

  const roleBadge = getRoleBadge();

  return (
    <SidebarRoot>
      <SidebarHeader className="border-b border-sidebar-border flex flex-col items-start justify-between p-4 gap-4">
        <div className="flex w-full items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <LanguageSelector />
            <ThemeCustomizer />
            <button
              className="sidebar-trigger block md:hidden"
              aria-label="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>
          </div>
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
            const canAccess = hasAccess(item);
            
            if (item.hidden) return null;

            // Si l'utilisateur n'a pas accès, afficher en grisé avec indication
            if (!canAccess) {
              return (
                <SidebarMenuItem key={item.path}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground/50 cursor-not-allowed select-none">
                        <item.icon size={20} className="opacity-50" />
                        <span className="flex-1 opacity-50">{item.name}</span>
                        <Lock size={14} className="opacity-50" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Accès réservé aux : {item.requiredRoles?.join(', ')}</p>
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              );
            }
            
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
      
      <SidebarFooter className="p-4 border-t border-sidebar-border space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.name}</div>
            <div className="text-xs text-sidebar-foreground/70 truncate">{user?.email}</div>
          </div>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full border font-medium ml-2 shrink-0",
            roleBadge.color
          )}>
            {roleBadge.label}
          </span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start" 
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t('common.logout')}
        </Button>
      </SidebarFooter>
    </SidebarRoot>
  );
};

export default Sidebar;
