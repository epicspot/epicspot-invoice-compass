
import React from 'react';
import { Building } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SiteSelectorProps {
  currentSite: string;
  setCurrentSite: (siteId: string) => void;
  sites: { id: string, name: string }[];
}

const SiteSelector = ({ currentSite, setCurrentSite, sites }: SiteSelectorProps) => {
  return (
    <div className="w-full">
      <Select value={currentSite} onValueChange={setCurrentSite}>
        <SelectTrigger className="w-full bg-white/10 text-white border-white/20 focus:ring-white/30">
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
  );
};

export default SiteSelector;
