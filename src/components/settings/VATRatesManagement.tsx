import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Save, X, Plus } from 'lucide-react';
import { toast } from 'sonner';

export function VATRatesManagement() {
  const { categories, loading, refetch } = useCategories();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRate, setEditRate] = useState<number>(0);
  const [newCategory, setNewCategory] = useState({ name: '', tax_rate: 18 });
  const [isAdding, setIsAdding] = useState(false);

  const handleEdit = (id: string, currentRate: number) => {
    setEditingId(id);
    setEditRate(currentRate);
  };

  const handleSave = async (id: string) => {
    try {
      const { error } = await supabase
        .from('product_categories')
        .update({ tax_rate: editRate })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Taux de TVA mis à jour');
      setEditingId(null);
      await refetch();
    } catch (error) {
      console.error('Error updating tax rate:', error);
      toast.error('Erreur lors de la mise à jour du taux');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditRate(0);
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Le nom de la catégorie est requis');
      return;
    }

    try {
      const { error } = await supabase
        .from('product_categories')
        .insert({
          name: newCategory.name,
          tax_rate: newCategory.tax_rate
        });

      if (error) throw error;
      
      toast.success('Catégorie ajoutée avec succès');
      setNewCategory({ name: '', tax_rate: 18 });
      setIsAdding(false);
      await refetch();
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Erreur lors de l\'ajout de la catégorie');
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Taux de TVA</CardTitle>
        <CardDescription>
          Configurez les taux de TVA par catégorie de produits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => setIsAdding(!isAdding)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle catégorie
            </Button>
          </div>

          {isAdding && (
            <Card className="p-4 bg-muted/50">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="categoryName">Nom de la catégorie</Label>
                  <Input
                    id="categoryName"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Ex: Alimentation, Services, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="categoryRate">Taux de TVA (%)</Label>
                  <Input
                    id="categoryRate"
                    type="number"
                    value={newCategory.tax_rate}
                    onChange={(e) => setNewCategory({ ...newCategory, tax_rate: parseFloat(e.target.value) })}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddCategory} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                  <Button onClick={() => setIsAdding(false)} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Catégorie</TableHead>
                <TableHead>Taux de TVA (%)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category: any) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    {editingId === category.id ? (
                      <Input
                        type="number"
                        value={editRate}
                        onChange={(e) => setEditRate(parseFloat(e.target.value))}
                        className="w-24"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    ) : (
                      <span>{category.tax_rate || 18}%</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === category.id ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSave(category.id)}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(category.id, category.tax_rate || 18)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}