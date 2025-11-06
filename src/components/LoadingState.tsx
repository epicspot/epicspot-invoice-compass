import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingStateProps {
  message?: string;
  variant?: 'default' | 'table' | 'dashboard' | 'minimal';
}

export const LoadingState = ({ 
  message = 'Chargement...', 
  variant = 'default' 
}: LoadingStateProps) => {
  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">{message}</span>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'dashboard') {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg font-medium">{message}</p>
      <p className="text-sm text-muted-foreground mt-2">
        Veuillez patienter...
      </p>
    </div>
  );
};

export const LoadingOverlay = ({ message = 'Chargement...' }: { message?: string }) => (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <Card className="p-6">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="font-medium">{message}</p>
      </div>
    </Card>
  </div>
);
