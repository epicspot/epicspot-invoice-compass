import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, LayoutGrid } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface Widget {
  id: string;
  type: string;
  title: string;
  enabled: boolean;
}

const availableWidgets: Widget[] = [
  { id: 'revenue', type: 'chart', title: 'Chiffre d\'affaires', enabled: true },
  { id: 'expenses', type: 'chart', title: 'Dépenses', enabled: true },
  { id: 'profit', type: 'stat', title: 'Bénéfice net', enabled: true },
  { id: 'cash-flow', type: 'chart', title: 'Flux de trésorerie', enabled: true },
  { id: 'top-clients', type: 'list', title: 'Meilleurs clients', enabled: false },
  { id: 'pending-invoices', type: 'list', title: 'Factures en attente', enabled: false },
  { id: 'overdue', type: 'stat', title: 'Retards de paiement', enabled: false },
  { id: 'forecast', type: 'chart', title: 'Prévisions IA', enabled: false },
];

function SortableWidget({ widget, onRemove }: { widget: Widget; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{widget.title}</p>
            <p className="text-xs text-muted-foreground capitalize">{widget.type}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(widget.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function DashboardBuilder() {
  const [widgets, setWidgets] = useState<Widget[]>(
    availableWidgets.filter(w => w.enabled)
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddWidget = (widget: Widget) => {
    if (!widgets.find(w => w.id === widget.id)) {
      setWidgets([...widgets, widget]);
    }
  };

  const handleRemoveWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const handleSaveLayout = () => {
    localStorage.setItem('dashboard-layout', JSON.stringify(widgets));
    alert('Configuration sauvegardée !');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5" />
              Personnaliser le dashboard
            </CardTitle>
            <CardDescription>
              Glissez-déposez pour réorganiser les widgets
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter des widgets</DialogTitle>
                  <DialogDescription>
                    Sélectionnez les widgets à afficher sur votre dashboard
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  {availableWidgets.map((widget) => {
                    const isActive = widgets.some(w => w.id === widget.id);
                    return (
                      <div key={widget.id} className="flex items-center gap-3 p-3 rounded-lg border">
                        <Checkbox
                          id={widget.id}
                          checked={isActive}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleAddWidget(widget);
                            } else {
                              handleRemoveWidget(widget.id);
                            }
                          }}
                        />
                        <Label htmlFor={widget.id} className="flex-1 cursor-pointer">
                          <div>
                            <p className="font-medium">{widget.title}</p>
                            <p className="text-xs text-muted-foreground capitalize">{widget.type}</p>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={handleSaveLayout}>
              Sauvegarder
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {widgets.map((widget) => (
                <SortableWidget
                  key={widget.id}
                  widget={widget}
                  onRemove={handleRemoveWidget}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {widgets.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <LayoutGrid className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun widget configuré</p>
            <p className="text-sm mt-1">Cliquez sur "Ajouter" pour commencer</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
