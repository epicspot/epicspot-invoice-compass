import { useState } from 'react';
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';

const colorPresets = [
  { name: 'Bleu (Défaut)', primary: '214 100% 50%', accent: '45 100% 62%' },
  { name: 'Violet', primary: '262 83% 58%', accent: '280 100% 70%' },
  { name: 'Vert', primary: '142 76% 36%', accent: '142 71% 45%' },
  { name: 'Orange', primary: '24 100% 50%', accent: '38 100% 50%' },
  { name: 'Rose', primary: '330 81% 60%', accent: '350 100% 71%' }
];

export function ThemeCustomizer() {
  const { t } = useTranslation();
  const [selectedPreset, setSelectedPreset] = useState(0);

  const applyTheme = (primary: string, accent: string) => {
    document.documentElement.style.setProperty('--primary', primary);
    document.documentElement.style.setProperty('--accent', accent);
    document.documentElement.style.setProperty('--sidebar-primary', primary);
    
    localStorage.setItem('theme-primary', primary);
    localStorage.setItem('theme-accent', accent);
  };

  const resetTheme = () => {
    document.documentElement.style.removeProperty('--primary');
    document.documentElement.style.removeProperty('--accent');
    document.documentElement.style.removeProperty('--sidebar-primary');
    
    localStorage.removeItem('theme-primary');
    localStorage.removeItem('theme-accent');
    setSelectedPreset(0);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Palette className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('theme.customize')}</DialogTitle>
          <DialogDescription>
            Choisissez un thème de couleur pour personnaliser l'interface
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {colorPresets.map((preset, index) => (
            <div
              key={preset.name}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedPreset === index ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
              onClick={() => {
                setSelectedPreset(index);
                applyTheme(preset.primary, preset.accent);
              }}
            >
              <div className="flex gap-2">
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: `hsl(${preset.primary})` }}
                />
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: `hsl(${preset.accent})` }}
                />
              </div>
              <Label className="cursor-pointer">{preset.name}</Label>
            </div>
          ))}
        </div>

        <Button onClick={resetTheme} variant="outline" className="w-full">
          Réinitialiser au thème par défaut
        </Button>
      </DialogContent>
    </Dialog>
  );
}
