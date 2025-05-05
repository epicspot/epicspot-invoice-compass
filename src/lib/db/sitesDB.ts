
import { dbPromise } from './index';
import { Site } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const sitesDB = {
  getAll: async (): Promise<Site[]> => {
    const db = await dbPromise;
    return db.getAll('sites');
  },
  
  get: async (id: string): Promise<Site | undefined> => {
    const db = await dbPromise;
    return db.get('sites', id);
  },
  
  getMainSite: async (): Promise<Site | undefined> => {
    const db = await dbPromise;
    const sites = await db.getAll('sites');
    return sites.find(site => site.isMainSite);
  },
  
  add: async (site: Omit<Site, 'id'>): Promise<Site> => {
    const db = await dbPromise;
    
    // If this is marked as main site, update other sites
    if (site.isMainSite) {
      const tx = db.transaction('sites', 'readwrite');
      const existingSites = await tx.store.getAll();
      
      for (const existingSite of existingSites) {
        if (existingSite.isMainSite) {
          existingSite.isMainSite = false;
          await tx.store.put(existingSite);
        }
      }
      
      await tx.done;
    }
    
    const newSite: Site = {
      ...site,
      id: uuidv4()
    };
    
    await db.add('sites', newSite);
    return newSite;
  },
  
  update: async (site: Site): Promise<Site> => {
    const db = await dbPromise;
    
    // If this is marked as main site, update other sites
    if (site.isMainSite) {
      const tx = db.transaction('sites', 'readwrite');
      const existingSites = await tx.store.getAll();
      
      for (const existingSite of existingSites) {
        if (existingSite.id !== site.id && existingSite.isMainSite) {
          existingSite.isMainSite = false;
          await tx.store.put(existingSite);
        }
      }
      
      await tx.done;
    }
    
    await db.put('sites', site);
    return site;
  },
  
  delete: async (id: string): Promise<void> => {
    const db = await dbPromise;
    
    // Check if it's the main site
    const site = await db.get('sites', id);
    if (site?.isMainSite) {
      throw new Error("Vous ne pouvez pas supprimer le site principal.");
    }
    
    // TODO: Check if site has associated data (clients, invoices, etc.)
    
    await db.delete('sites', id);
  }
};
