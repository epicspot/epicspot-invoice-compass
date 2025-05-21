
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
  // État pour contrôler l'ouverture de la sidebar mobile
  const [openMobile, setOpenMobile] = useState(false);

  useEffect(() => {
    if (isInitialized) {
      const loadSites = async () => {
        try {
          const allSites = await db.sites.getAll();
          if (allSites && allSites.length > 0) {
            setSites(allSites.map(site => ({
              id: site.id,
              name: site.name
            })));
            
            // Si sites loaded but no current site is selected, set the first one
            if (allSites.length > 0 && currentSite === "site-1") {
              setCurrentSite(allSites[0].id);
            }
          } else {
            console.log("No sites found or sites array is empty");
            // Ajouter des sites par défaut si aucun n'est trouvé
            setSites([
              { id: "site-default", name: "Site par défaut" }
            ]);
          }
        } catch (error) {
          console.error("Error loading sites:", error);
          // Sites par défaut en cas d'erreur
          setSites([
            { id: "site-default", name: "Site par défaut" }
          ]);
        }
      };
      
      loadSites();
    }
  }, [isInitialized, db, currentSite]);

  const handleMenuClick = (path: string) => {
    console.log("Navigation requested to:", path);
    try {
      navigate(path);
      // Fermer la sidebar mobile après la navigation
      setOpenMobile(false);
    } catch (error) {
      console.error("Navigation error:", error);
    }
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
              onClick={() => setOpenMobile(!openMobile)}
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
