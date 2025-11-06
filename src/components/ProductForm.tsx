
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product } from '@/lib/types';
import { useCategories } from '@/hooks/useCategories';
import { Package, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface ProductFormProps {
  initialProduct?: Partial<Product>;
  onSubmit: (product: Partial<Product>) => void;
  isLoading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialProduct,
  onSubmit,
  isLoading = false
}) => {
  const { categories, createCategory } = useCategories();
  const [product, setProduct] = useState<Partial<Product>>(initialProduct || {
    description: '',
    price: 0
  });
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(product);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    const result = await createCategory(newCategoryName);
    if (result.success && result.data) {
      setProduct({ ...product, category: result.data.id });
      setNewCategoryName('');
      setShowNewCategory(false);
      toast({
        title: "Catégorie créée",
        description: "La nouvelle catégorie a été ajoutée avec succès.",
      });
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Impossible de créer la catégorie",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-5 w-5" />
          {initialProduct ? 'Modifier le produit / service' : 'Nouveau produit / service'}
        </h2>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Chargement...' : initialProduct ? 'Mettre à jour' : 'Enregistrer'}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          {initialProduct && (
            <div>
              <Label htmlFor="reference">Référence</Label>
              <Input
                id="reference"
                value={product.reference || ''}
                disabled
                className="mt-1 bg-muted"
              />
            </div>
          )}

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={product.description || ''}
              onChange={(e) => setProduct({ ...product, description: e.target.value })}
              className="mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Prix unitaire (FCFA) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={product.price || ''}
                onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) || 0 })}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="taxRate">Taux de taxe (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={product.taxRate || ''}
                onChange={(e) => setProduct({ ...product, taxRate: parseFloat(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minStock">Seuil d'alerte stock</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                value={product.minStock || ''}
                onChange={(e) => setProduct({ ...product, minStock: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="category">Catégorie</Label>
              <div className="flex gap-2 mt-1">
                <Select
                  value={product.category || ''}
                  onValueChange={(value) => setProduct({ ...product, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowNewCategory(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showNewCategory} onOpenChange={setShowNewCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle catégorie</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newCategory">Nom de la catégorie</Label>
              <Input
                id="newCategory"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ex: Services Internet"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowNewCategory(false);
                setNewCategoryName('');
              }}
            >
              Annuler
            </Button>
            <Button type="button" onClick={handleCreateCategory}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
};

export default ProductForm;
