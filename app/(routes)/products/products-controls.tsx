"use client";

import { ProductsTable } from "@/components/data-tables/products-table";
import { AddProductDialog } from "@/components/forms/add-product-dialog";
import { Product } from "@/types/product";
import { useState } from "react";

interface ProductsControlsProps {
  initialProducts: Product[];
}

export function ProductsControls({ initialProducts }: ProductsControlsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [products, setProducts] = useState(initialProducts);

  const handleAddSuccess = (newProduct: Product) => {
    setProducts((prevProducts) => [newProduct, ...prevProducts]);
    setIsAddDialogOpen(false);
  };

  const handleDelete = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log(errorData);
        throw new Error(errorData.error || "Failed to delete product");
      }

      setProducts((prevProducts) =>
        prevProducts.filter((p) => p.id !== productId)
      );
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Add Product
        </button>
      </div>
 
      <ProductsTable
        products={products}
        onDelete={handleDelete}
        onUpdate={(updatedProduct) => {
          setProducts((prevProducts) =>
            prevProducts.map((p) =>
              p.id === updatedProduct.id ? updatedProduct : p
            )
          );
        }}
      />

      <AddProductDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={handleAddSuccess}
      />
    </>
  );
}
