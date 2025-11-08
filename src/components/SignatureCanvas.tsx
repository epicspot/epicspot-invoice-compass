import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X } from 'lucide-react';

interface SignatureCanvasProps {
  onComplete: (signatureData: string) => void;
}

export function SignatureCanvas({ onComplete }: SignatureCanvasProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleComplete = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const signatureData = canvas.toDataURL('image/png');
    onComplete(signatureData);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <canvas
            ref={canvasRef}
            width={400}
            height={200}
            className="w-full border rounded cursor-crosshair bg-white"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </CardContent>
      </Card>

      <div className="flex justify-between gap-2">
        <Button
          variant="outline"
          onClick={clearSignature}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Effacer
        </Button>

        <Button
          onClick={handleComplete}
          className="gap-2"
        >
          <Check className="h-4 w-4" />
          Signer
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        En signant ce document, vous certifiez avoir lu et accepté son contenu.
        Cette signature électronique a valeur légale.
      </p>
    </div>
  );
}
