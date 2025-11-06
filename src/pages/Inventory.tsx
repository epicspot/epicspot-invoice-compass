import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DataTable from '@/components/DataTable';
import StockMovementForm from '@/components/StockMovementForm';
import { useProducts } from '@/hooks/useProducts';
import { useStockMovements } from '@/hooks/useStockMovements';
import { useSites } from '@/hooks/useSites';
import { useProductStock } from '@/hooks/useProductStock';
import { Package, AlertTriangle, TrendingUp, Building2, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { StockMovement } from '@/lib/types';

const Inventory = () => {
  const { products } = useProducts();
  const { sites } = useSites();
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const { stockData, getStock, getLowStockProducts, refetch: refetchStock } = useProductStock(selectedSiteId);
  const { createMovement } = useStockMovements();
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Set default site when sites are loaded
  React.useEffect(() => {
    if (sites.length > 0 && !selectedSiteId) {
      setSelectedSiteId(sites[0].id);
    }
  }, [sites, selectedSiteId]);

  const handleCreateMovement = async (movement: Omit<StockMovement, 'id' | 'date'>) => {
    try {
      const result = await createMovement(movement);
      if (!result.success) {
        toast({
          title: "Erreur",
          description: result.error || "Impossible d'enregistrer le mouvement",
          variant: "destructive"
        });
        return;
      }
      toast({
        title: "Mouvement enregistré",
        description: `Le mouvement de stock a été enregistré avec succès.`
      });
      await refetchStock();
      setIsFormOpen(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    }
  };

  const columns = [
    { key: 'reference', header: 'Référence' },
    { key: 'description', header: 'Description' },
    { 
      key: 'price', 
      header: 'Prix unitaire',
      cell: (item: any) => `${item.price.toLocaleString()} FCFA`
    },
    { 
      key: 'stock', 
      header: 'Stock actuel',
      cell: (item: any) => {
        const stock = selectedSiteId ? getStock(item.id, selectedSiteId) : 0;
        const minStock = item.minStock || 0;
        const isLow = stock <= minStock && minStock > 0;
        
        return (
          <div className="flex items-center gap-2">
            <span className={isLow ? 'text-red-600 font-semibold' : ''}>{stock}</span>
            {isLow && <AlertTriangle className="h-4 w-4 text-red-600" />}
          </div>
        );
      }
    },
    { 
      key: 'minStock', 
      header: 'Seuil alerte',
      cell: (item: any) => item.minStock || '-'
    },
    { 
      key: 'value', 
      header: 'Valeur stock',
      cell: (item: any) => {
        const stock = selectedSiteId ? getStock(item.id, selectedSiteId) : 0;
        const value = stock * item.price;
        return `${value.toLocaleString()} FCFA`;
      }
    },
  ];

  const lowStockProducts = selectedSiteId ? getLowStockProducts(selectedSiteId) : [];

  const totalStockValue = selectedSiteId ? stockData
    .filter(s => s.siteId === selectedSiteId)
    .reduce((total, s) => {
      const price = s.product?.price || 0;
      return total + (s.quantity * price);
    }, 0) : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-5 w-5" />
          Inventaire
        </h1>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sélectionner un site" />
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
          <Button onClick={() => setIsFormOpen(true)} disabled={!selectedSiteId}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau mouvement
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits en stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Références</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur totale</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStockValue.toLocaleString()} FCFA</div>
            <p className="text-xs text-muted-foreground">Valeur du stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">Produits en alerte</p>
          </CardContent>
        </Card>
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertes de stock faible
            </CardTitle>
            <CardDescription>
              Les produits suivants ont atteint ou sont en dessous du seuil d'alerte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map(item => (
                <div key={item.productId} className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <div>
                    <span className="font-medium">{item.product?.reference}</span> - {item.product?.description}
                  </div>
                  <Badge variant="destructive">
                    Stock: {item.quantity} / Min: {item.product?.minStock}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Liste des produits</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            data={products} 
            columns={columns}
            searchable={true}
          />
        </CardContent>
      </Card>

      <StockMovementForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        products={products}
        onSubmit={handleCreateMovement}
        selectedSiteId={selectedSiteId}
      />
    </div>
  );
};

export default Inventory;
