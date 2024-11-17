"use client";

import { ProductEditForm } from "@/components/forms/product-edit-form";
import { DataTableRowActions } from "@/components/ui/data-table-row-actions";
import { DialogComponent } from "@/components/ui/dialog";
import { Product } from "@/types/product";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProductsTableProps {
  products: Product[];
  onDelete?: (productId: string) => void;
  onUpdate?: (updatedProduct: Product) => void;
}

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
      <span
        className={`px-2 py-1 rounded-full text-sm ${getPhaseColor(
          product.phase
        )}`}
      >
        {product.phase}
      </span>
    ),
  },
];

function getPhaseColor(phase: string) {
  switch (phase) {
    case "SWATCH":
      return "bg-blue-100 text-blue-800";
    case "INITIAL_SAMPLE":
      return "bg-yellow-100 text-yellow-800";
    case "FIT_SAMPLE":
      return "bg-purple-100 text-purple-800";
    case "PRODUCTION_SAMPLE":
      return "bg-orange-100 text-orange-800";
    case "PRODUCTION":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function ProductsTable({
  products,
  onDelete,
  onUpdate,
}: ProductsTableProps) {
  const router = useRouter();
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
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProduct),
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      const updated = await response.json();

      if (onUpdate) {
        onUpdate(updated);
      }

      setIsEditDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
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
            onSaveSuccess={handleSave}
            onDeleteSuccess={onDelete}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setSelectedProduct(null);
            }}
            mode="edit"
          />
        </DialogComponent>
      )}
    </>
  );
}
