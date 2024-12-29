"use client";

import { UpsertDialog } from "@/components/forms/upsert-dialog"; // or your renamed component
import { BackButton } from "@/components/ui/back-button";
import { DetailsView } from "@/components/ui/details-view";
import { DialogComponent } from "@/components/ui/dialog";
import { Product } from "@/types/types";
import { notFound, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

// Example of the same product form fields you used in ProductsControls:
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

async function fetchProduct(productId: string) {
  try {
    const response = await fetch(`/api/products/${productId}`);
    const data = await response.json();

    if (!data || response.status === 404) {
      notFound();
    }
    return data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const router = useRouter();
  // In Next 13+ (app router), we "resolve" the promise from `params`:
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);

  // Whether we show the edit dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Load the product data on mount or when productId changes
  useEffect(() => {
    fetchProduct(resolvedParams.productId).then(setProduct);
  }, [resolvedParams.productId]);

  // If we're still loading, show a placeholder
  if (!product) {
    return <div>Loading...</div>;
  }

  // PHASE color styling (same helper as before)
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

  // Items for our DetailsView
  const detailItems = [
    { label: "SKU", value: product.sku },
    { label: "Piece", value: product.piece },
    { label: "Name", value: product.name },
    { label: "Season", value: product.season },
    {
      label: "Phase",
      value: (
        <span
          className={`px-2 py-1 rounded-full text-sm ${getPhaseColor(
            product.phase
          )}`}
        >
          {product.phase}
        </span>
      ),
    },
    {
      label: "Materials",
      value: (
        <div className="space-y-2">
          {product.materials?.map((pm) => (
            <div key={pm.id} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: pm.material.colorCode }}
              />
              <span>
                {pm.material.type} - {pm.material.color}
              </span>
              <span className="text-gray-500">
                ({pm.quantity} {pm.unit})
              </span>
            </div>
          ))}
        </div>
      ),
    },
    { label: "Notes", value: product.notes || "No notes" },
    {
      label: "Created At",
      value: new Date(product.createdAt).toLocaleDateString(),
    },
    {
      label: "Updated At",
      value: new Date(product.updatedAt).toLocaleDateString(),
    },
  ];

  // -- Updating product via PATCH
  const handleSaveSuccess = async (updated: Product) => {
    // Merge new data into state
    setProduct(updated);
    // Close dialog
    setIsEditDialogOpen(false);
  };

  // -- Deleting the product
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }
      // If success, navigate away
      router.push("/inventory/products");
      router.refresh();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Product Details</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditDialogOpen(true)}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Edit
            </button>
            <BackButton />
          </div>
        </div>
        <DetailsView
          title={`${product.piece} - ${product.name}`}
          items={detailItems}
        />
      </div>

      {/* Edit dialog: reuse UpsertDialog (or your custom product dialog) */}
      {isEditDialogOpen && (
        <DialogComponent
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          title="Edit Product"
        >
          <UpsertDialog
            // Tell it we’re editing, not creating
            mode="edit"
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSuccess={handleSaveSuccess}
            // Provide the existing product as default data
            defaultData={product}
            fields={productFields}
            apiEndpoint="/api/products"
            itemName="Product"
            // We'll do PATCH instead of PUT inside UpsertDialog:
            // Make sure your UpsertDialog or EditForm uses method="PATCH" if mode="edit"
            // Or you can pass in a "method" prop if you like.
            //
            // For deleting inside the same form, we can pass an onDeleteSuccess too:
            onDeleteSuccess={handleDelete}
          />
        </DialogComponent>
      )}
    </>
  );
}
