import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentTemplate, TemplateSection } from '@/hooks/useDocumentTemplates';
import { GripVertical, Eye } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TemplateEditorProps {
  template: DocumentTemplate;
  onChange: (template: Partial<DocumentTemplate>) => void;
  onSave: () => void;
  onCancel: () => void;
}

function SortableSection({ section, onToggle }: { section: TemplateSection; onToggle: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <Switch checked={section.enabled} onCheckedChange={() => onToggle(section.id)} />
      <span className={section.enabled ? 'font-medium' : 'text-muted-foreground'}>{section.name}</span>
    </div>
  );
}

export function TemplateEditor({ template, onChange, onSave, onCancel }: TemplateEditorProps) {
  const [sections, setSections] = useState<TemplateSection[]>(template.sections);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update order
        const updatedItems = newItems.map((item, index) => ({ ...item, order: index + 1 }));
        onChange({ sections: updatedItems });
        return updatedItems;
      });
    }
  };

  const toggleSection = (id: string) => {
    const updatedSections = sections.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    setSections(updatedSections);
    onChange({ sections: updatedSections });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="template-name">Nom du template</Label>
          <Input
            id="template-name"
            value={template.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Nom du template"
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={template.is_default}
            onCheckedChange={(checked) => onChange({ is_default: checked })}
          />
          <Label>Template par défaut</Label>
        </div>
      </div>

      <Tabs defaultValue="sections" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="layout">Mise en page</TabsTrigger>
          <TabsTrigger value="styles">Styles</TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sections du document</CardTitle>
              <CardDescription>Activez/désactivez et réorganisez les sections</CardDescription>
            </CardHeader>
            <CardContent>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {sections.map((section) => (
                      <SortableSection key={section.id} section={section} onToggle={toggleSection} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration de la page</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Format de page</Label>
                  <Select
                    value={template.layout.pageSize}
                    onValueChange={(value: 'A4' | 'Letter') => onChange({ 
                      layout: { ...template.layout, pageSize: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="Letter">Letter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Orientation</Label>
                  <Select
                    value={template.layout.orientation}
                    onValueChange={(value: 'portrait' | 'landscape') => onChange({ 
                      layout: { ...template.layout, orientation: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Paysage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Marges (mm)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Haut</Label>
                    <Input
                      type="number"
                      value={template.layout.margins.top}
                      onChange={(e) => onChange({ 
                        layout: { 
                          ...template.layout, 
                          margins: { ...template.layout.margins, top: Number(e.target.value) }
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Bas</Label>
                    <Input
                      type="number"
                      value={template.layout.margins.bottom}
                      onChange={(e) => onChange({ 
                        layout: { 
                          ...template.layout, 
                          margins: { ...template.layout.margins, bottom: Number(e.target.value) }
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Gauche</Label>
                    <Input
                      type="number"
                      value={template.layout.margins.left}
                      onChange={(e) => onChange({ 
                        layout: { 
                          ...template.layout, 
                          margins: { ...template.layout.margins, left: Number(e.target.value) }
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Droite</Label>
                    <Input
                      type="number"
                      value={template.layout.margins.right}
                      onChange={(e) => onChange({ 
                        layout: { 
                          ...template.layout, 
                          margins: { ...template.layout.margins, right: Number(e.target.value) }
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">URL du logo</Label>
                <Input
                  id="logo"
                  value={template.logo_url || ''}
                  onChange={(e) => onChange({ logo_url: e.target.value })}
                  placeholder="https://exemple.com/logo.png"
                />
                <p className="text-xs text-muted-foreground">URL publique de votre logo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="styles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Styles du document</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Couleur principale</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={template.styles.primaryColor}
                      onChange={(e) => onChange({ 
                        styles: { ...template.styles, primaryColor: e.target.value }
                      })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={template.styles.primaryColor}
                      onChange={(e) => onChange({ 
                        styles: { ...template.styles, primaryColor: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Couleur secondaire</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={template.styles.secondaryColor}
                      onChange={(e) => onChange({ 
                        styles: { ...template.styles, secondaryColor: e.target.value }
                      })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={template.styles.secondaryColor}
                      onChange={(e) => onChange({ 
                        styles: { ...template.styles, secondaryColor: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Police de caractères</Label>
                <Select
                  value={template.styles.fontFamily}
                  onValueChange={(value) => onChange({ 
                    styles: { ...template.styles, fontFamily: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="helvetica">Helvetica</SelectItem>
                    <SelectItem value="times">Times New Roman</SelectItem>
                    <SelectItem value="courier">Courier</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Taille titre</Label>
                  <Input
                    type="number"
                    value={template.styles.titleFontSize}
                    onChange={(e) => onChange({ 
                      styles: { ...template.styles, titleFontSize: Number(e.target.value) }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Taille en-tête</Label>
                  <Input
                    type="number"
                    value={template.styles.headingFontSize}
                    onChange={(e) => onChange({ 
                      styles: { ...template.styles, headingFontSize: Number(e.target.value) }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Taille texte</Label>
                  <Input
                    type="number"
                    value={template.styles.bodyFontSize}
                    onChange={(e) => onChange({ 
                      styles: { ...template.styles, bodyFontSize: Number(e.target.value) }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={onSave}>
          Enregistrer le template
        </Button>
      </div>
    </div>
  );
}
