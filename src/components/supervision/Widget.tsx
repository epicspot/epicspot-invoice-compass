import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WidgetProps {
  id: string;
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  editMode: boolean;
  children: React.ReactNode;
}

const sizeClasses = {
  small: 'col-span-1 row-span-1',
  medium: 'col-span-1 md:col-span-2 row-span-1',
  large: 'col-span-1 md:col-span-2 lg:col-span-2 row-span-2',
  full: 'col-span-1 md:col-span-2 lg:col-span-4 row-span-1',
};

export function Widget({ id, title, size, editMode, children }: WidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !editMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        sizeClasses[size],
        isDragging && 'opacity-50 z-50',
        editMode && 'cursor-move ring-2 ring-primary/20 animate-pulse'
      )}
    >
      <Card className={cn(
        "h-full transition-all duration-200",
        editMode && "hover:shadow-lg hover:scale-[1.02]"
      )}>
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "flex items-center gap-2 p-4 border-b",
            editMode ? "cursor-move" : "cursor-default"
          )}
        >
          {editMode && (
            <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          )}
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        <div className="p-4">
          {children}
        </div>
      </Card>
    </div>
  );
}
