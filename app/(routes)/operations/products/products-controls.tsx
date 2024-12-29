"use client";

import { DataTable, type DataTableColumn } from "@/components/data-table";
import { useState } from "react";
// Import your new upsert (create/edit) dialog:
import { UpsertDialog } from "@/components/forms/upsert-dialog";
import { Product } from "@/types/types";

// -- Column definitions --
const productColumns: DataTableColumn<Product>[] = [
  { header: "SKU", accessorKey: "sku" },
  { header: "Piece", accessorKey: "piece" },
  { header: "Name", accessorKey: "name" },
  { header: "Season", accessorKey: "season" },
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

// -- Fields for the product form --
const productFields = [
  { key: "sku", label: "SKU", type: "text", required: true },
  { key: "piece", label: "Piece", type: "text", required: true },
  { key: "name", label: "Name", type: "text", required: true },
  { key: "season", label: "Season", type: "text" },
  {
    key: "phase",
    label: "Phase",
    type: "select",
    options: [
      "SWATCH",
      "INITIAL_SAMPLE",
      "FIT_SAMPLE",
      "PRODUCTION_SAMPLE",
      "PRODUCTION",
    ],
    required: true,
  },
  { key: "notes", label: "Notes", type: "textarea" },
];

// -- Default product data (for new items) --
const defaultProduct = {
  sku: "",
  piece: "",
  name: "",
  season: "",
  phase: "SWATCH",
  notes: "",
};

interface ProductsControlsProps {
  initialProducts: Product[];
}

export function ProductsControls({ initialProducts }: ProductsControlsProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  // Dialog state: are we open, which mode, and which product (if editing)?
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // -- Deleting a product --
  const handleDelete = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete product");
      }
      // Remove the product from local state:
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  };

  // -- Editing an existing product --
  const handleUpdate = (product: Product) => {
    setDialogMode("edit");
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  // -- Creating a new product --
  const handleCreate = () => {
    setDialogMode("create");
    setSelectedProduct(null);
    setIsDialogOpen(true);
  };

  // -- After dialog saves successfully (either new or updated) --
  const handleSaveSuccess = (savedProduct: Product) => {
    setProducts((prev) => {
      const existingIndex = prev.findIndex((p) => p.id === savedProduct.id);
      if (existingIndex !== -1) {
        // If it's an edit, replace existing
        const updatedProducts = [...prev];
        updatedProducts[existingIndex] = savedProduct;
        return updatedProducts;
      }
      // Otherwise, it's new. Add it to the top:
      return [savedProduct, ...prev];
    });
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Add Product
        </button>
      </div>

      <DataTable
        data={products}
        columns={productColumns}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        viewPath="/inventory/products"
      />

      {/* Dialog for upserting a product (create / edit) */}
      {isDialogOpen && (
        <UpsertDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSuccess={handleSaveSuccess}
          defaultData={selectedProduct || defaultProduct}
          fields={productFields}
          apiEndpoint="/api/products"
          itemName="Product"
          mode={dialogMode} // <-- Pass "create" or "edit"
        />
      )}
    </>
  );
}
