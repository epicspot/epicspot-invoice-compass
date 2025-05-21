
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Logo from './Logo';
import { useDatabase } from '@/lib/contexts/DatabaseContext';

import {
  Sidebar as SidebarRoot,
  SidebarProvider,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';

import SiteSelector from './sidebar/SiteSelector';
import NavigationMenu from './sidebar/NavigationMenu';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentSite, setCurrentSite] = useState("site-1");
  const [sites, setSites] = useState<{id: string, name: string}[]>([]);
  const { db, isInitialized } = useDatabase();

  useEffect(() => {
    if (isInitialized) {
      const loadSites = async () => {
        try {
          const allSites = await db.sites.getAll();
          setSites(allSites.map(site => ({
            id: site.id,
            name: site.name
          })));
          
          // If sites loaded but no current site is selected, set the first one
          if (allSites.length > 0 && currentSite === "site-1") {
            setCurrentSite(allSites[0].id);
          }
        } catch (error) {
          console.error("Error loading sites:", error);
        }
      };
      
      loadSites();
    }
  }, [isInitialized, db, currentSite]);

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <SidebarRoot>
        <SidebarHeader className="border-b border-sidebar-border bg-epic-blue flex flex-col items-start justify-between p-4 gap-4">
          <div className="flex w-full items-center justify-between">
            <Logo />
            <button
              className="sidebar-trigger block md:hidden"
              aria-label="Toggle Sidebar"
            >
              <Menu size={20} className="text-white" />
            </button>
          </div>
          
          <SiteSelector
            currentSite={currentSite}
            setCurrentSite={setCurrentSite}
            sites={sites}
          />
        </SidebarHeader>
        
        <SidebarContent className="p-2 bg-sidebar">
          <NavigationMenu 
            onItemClick={handleMenuClick}
            currentPath={location.pathname}
          />
        </SidebarContent>
        
        <SidebarFooter className="p-4 border-t border-sidebar-border bg-sidebar">
          <div className="text-xs text-sidebar-foreground/70 text-center">
            EPICSPOT_CONSULTING
          </div>
        </SidebarFooter>
      </SidebarRoot>
    </SidebarProvider>
  );
};

export default Sidebar;
