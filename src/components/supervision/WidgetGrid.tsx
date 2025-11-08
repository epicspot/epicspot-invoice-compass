import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Widget } from './Widget';
import { Button } from '@/components/ui/button';
import { Settings, Eye, EyeOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export interface WidgetConfig {
  id: string;
  title: string;
  type: 'logs-summary' | 'retry-summary' | 'performance-summary' | 'error-rate' | 'recent-logs' | 'retry-chart' | 'alerts' | 'operations';
  visible: boolean;
  size: 'small' | 'medium' | 'large' | 'full';
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'logs-summary', title: 'Résumé Logs', type: 'logs-summary', visible: true, size: 'small' },
  { id: 'retry-summary', title: 'Statistiques Retry', type: 'retry-summary', visible: true, size: 'small' },
  { id: 'performance-summary', title: 'Performance', type: 'performance-summary', visible: true, size: 'small' },
  { id: 'error-rate', title: 'Taux d\'Erreur', type: 'error-rate', visible: true, size: 'small' },
  { id: 'recent-logs', title: 'Logs Récents', type: 'recent-logs', visible: true, size: 'large' },
  { id: 'retry-chart', title: 'Graphique Retry', type: 'retry-chart', visible: true, size: 'large' },
  { id: 'alerts', title: 'Alertes Actives', type: 'alerts', visible: true, size: 'medium' },
  { id: 'operations', title: 'Top Opérations', type: 'operations', visible: true, size: 'medium' },
];

interface WidgetGridProps {
  children: (widgets: WidgetConfig[]) => React.ReactNode;
}

export function WidgetGrid({ children }: WidgetGridProps) {
  const [widgets, setWidgets] = useLocalStorage<WidgetConfig[]>('supervision-widgets', DEFAULT_WIDGETS);
  const [editMode, setEditMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
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

  const toggleWidget = (id: string) => {
    setWidgets((items) =>
      items.map((item) =>
        item.id === id ? { ...item, visible: !item.visible } : item
      )
    );
  };

  const resetLayout = () => {
    setWidgets(DEFAULT_WIDGETS);
  };

  const visibleWidgets = widgets.filter((w) => w.visible);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={editMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setEditMode(!editMode)}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            {editMode ? 'Terminer' : 'Personnaliser'}
          </Button>

          {editMode && (
            <Button variant="outline" size="sm" onClick={resetLayout}>
              Réinitialiser
            </Button>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="h-4 w-4" />
              Widgets
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Afficher/Masquer</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {widgets.map((widget) => (
              <DropdownMenuCheckboxItem
                key={widget.id}
                checked={widget.visible}
                onCheckedChange={() => toggleWidget(widget.id)}
              >
                {widget.visible ? (
                  <Eye className="h-4 w-4 mr-2" />
                ) : (
                  <EyeOff className="h-4 w-4 mr-2" />
                )}
                {widget.title}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={visibleWidgets.map((w) => w.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-auto">
            {visibleWidgets.map((widget) => (
              <Widget
                key={widget.id}
                id={widget.id}
                title={widget.title}
                size={widget.size}
                editMode={editMode}
              >
                {children(visibleWidgets)}
              </Widget>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
