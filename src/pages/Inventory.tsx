import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/DataTable';
import StockMovementForm from '@/components/StockMovementForm';
import { useProducts } from '@/hooks/useProducts';
import { useStockMovements } from '@/hooks/useStockMovements';
import { Package, AlertTriangle, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { StockMovement } from '@/lib/types';

const Inventory = () => {
  const { products } = useProducts();
  const { getCurrentStock, createMovement, movements } = useStockMovements();
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const siteId = 'default'; // Pour l'instant un seul site

  const handleCreateMovement = (movement: Omit<StockMovement, 'id' | 'date'>) => {
    createMovement(movement);
    toast({
      title: "Mouvement enregistré",
      description: `Le mouvement de stock a été enregistré avec succès.`
    });
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
        const stock = getCurrentStock(item.id, siteId);
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
        const stock = getCurrentStock(item.id, siteId);
        const value = stock * item.price;
        return `${value.toLocaleString()} FCFA`;
      }
    },
  ];

  const lowStockProducts = products.filter(p => {
    const stock = getCurrentStock(p.id, siteId);
    return p.minStock && stock <= p.minStock;
  });

  const totalStockValue = products.reduce((total, p) => {
    const stock = getCurrentStock(p.id, siteId);
    return total + (stock * p.price);
  }, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-5 w-5" />
          Inventaire
        </h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau mouvement
        </Button>
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
              {lowStockProducts.map(p => (
                <div key={p.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <div>
                    <span className="font-medium">{p.reference}</span> - {p.description}
                  </div>
                  <Badge variant="destructive">
                    Stock: {getCurrentStock(p.id, siteId)} / Min: {p.minStock}
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
      />
    </div>
  );
};

export default Inventory;
