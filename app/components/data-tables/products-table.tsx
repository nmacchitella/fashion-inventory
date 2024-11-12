"use client"

import { useState } from "react";
import { DataTableRowActions } from "@/components/ui/data-table-row-actions"
import { Product } from "@/types/product"
import { useRouter } from "next/navigation"
import { DialogComponent } from "@/components/ui/dialog"
import { ProductEditForm } from "@/components/forms/product-edit-form"

interface Column {
  header: string;
  accessorKey: string;
  cell?: (item: Product) => React.ReactNode;
}

const columns: Column[] = [
  {
    header: "SKU",
    accessorKey: "sku",
  },
  {
    header: "Piece",
    accessorKey: "piece",
  },
  {
    header: "Name",
    accessorKey: "name",
  },
  {
    header: "Season",
    accessorKey: "season",
  },
  {
    header: "Phase",
    accessorKey: "phase",
    cell: (product) => (
      <span className={`px-2 py-1 rounded-full text-sm ${
        getPhaseColor(product.phase)
      }`}>
        {product.phase}
      </span>
    ),
  }
];

function getPhaseColor(phase: string) {
  switch (phase) {
    case 'SWATCH':
      return 'bg-blue-100 text-blue-800';
    case 'INITIAL_SAMPLE':
      return 'bg-yellow-100 text-yellow-800';
    case 'FIT_SAMPLE':
      return 'bg-purple-100 text-purple-800';
    case 'PRODUCTION_SAMPLE':
      return 'bg-orange-100 text-orange-800';
    case 'PRODUCTION':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function ProductsTable({ products: initialProducts }: { products: Product[] }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleSave = async (updatedProduct: Partial<Product>) => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      const updated = await response.json();
      
      // Update the local state with the new data
      setProducts(products.map(p => 
        p.id === updated.id ? updated : p
      ));
      
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      // Update local state by removing the deleted product
      setProducts(products.filter(p => p.id !== selectedProduct.id));
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      router.refresh(); // Refresh the page data
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              {columns.map((column) => (
                <th 
                  key={column.accessorKey} 
                  className="px-4 py-2 text-left text-sm font-medium text-gray-500"
                >
                  {column.header}
                </th>
              ))}
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                {columns.map((column) => (
                  <td 
                    key={`${product.id}-${column.accessorKey}`}
                    className="px-4 py-2 text-sm"
                  >
                    {column.cell 
                      ? column.cell(product)
                      : String(product[column.accessorKey as keyof Product])}
                  </td>
                ))}
                <td className="px-4 py-2 text-sm">
                  <DataTableRowActions
                    onView={() => router.push(`/products/${product.id}`)}
                    onEdit={() => handleEdit(product)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedProduct && (
        <DialogComponent
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) setSelectedProduct(null);
          }}
          title="Edit Product"
        >
          <ProductEditForm
            product={selectedProduct}
            onSave={handleSave}
            onDelete={handleDelete}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setSelectedProduct(null);
            }}
          />
        </DialogComponent>
      )}
    </>
  );
}