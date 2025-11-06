
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/DataTable';
import { Product } from '@/lib/types';
import { Plus, Package, Edit, Trash } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import ProductForm from '@/components/ProductForm';
import { toast } from "@/hooks/use-toast";
import { useProducts } from '@/hooks/useProducts';

const columns = [
  { key: 'reference', header: 'Référence' },
  { key: 'description', header: 'Description' },
  { 
    key: 'price', 
    header: 'Prix unitaire',
    cell: (item: Product) => `${item.price.toLocaleString()} FCFA`
  },
];

const Products = () => {
  const { products, createProduct, updateProduct, deleteProduct } = useProducts();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  
  const handleCreateProduct = async (productData: Partial<Product>) => {
    const newProduct = await createProduct(productData as Omit<Product, 'id' | 'reference'>);
    setIsCreating(false);
    
    toast({
      title: "Produit créé",
      description: `Le produit ${newProduct.reference} a été créé avec succès.`,
    });
  };
  
  const handleEditProduct = (productData: Partial<Product>) => {
    if (productData.id) {
      updateProduct(productData.id, productData);
      setIsEditing(null);
      
      toast({
        title: "Produit modifié",
        description: `Le produit ${productData.reference} a été modifié avec succès.`,
      });
    }
  };
  
  const handleDeleteProduct = (id: string) => {
    const productToDelete = products.find(p => p.id === id);
    deleteProduct(id);
    
    toast({
      title: "Produit supprimé",
      description: `Le produit ${productToDelete?.reference} a été supprimé.`,
      variant: "destructive",
    });
  };
  
  const actions = (product: Product) => (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <span className="sr-only">Actions</span>
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
            >
              <path
                d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                fill="currentColor"
              />
            </svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setIsEditing(product.id)}
          >
            <Edit className="h-4 w-4" /> Modifier
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 text-red-600 cursor-pointer"
            onClick={() => handleDeleteProduct(product.id)}
          >
            <Trash className="h-4 w-4" /> Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
  
  if (isCreating) {
    return (
      <div className="p-6">
        <ProductForm onSubmit={handleCreateProduct} />
      </div>
    );
  }
  
  if (isEditing) {
    const productToEdit = products.find(p => p.id === isEditing);
    
    return (
      <div className="p-6">
        <ProductForm 
          initialProduct={productToEdit} 
          onSubmit={handleEditProduct} 
        />
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-5 w-5" />
          Produits et Services
        </h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nouveau produit
        </Button>
      </div>
      
      <DataTable 
        data={products} 
        columns={columns} 
        actions={actions}
      />
    </div>
  );
};

export default Products;
