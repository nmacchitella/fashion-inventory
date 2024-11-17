"use client";

import { ProductEditForm } from "@/components/forms/product-edit-form";
import { BackButton } from "@/components/ui/back-button";
import { DetailsView } from "@/components/ui/details-view";
import { DialogComponent } from "@/components/ui/dialog";
import { Product } from "@/types/product";
import { notFound, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

async function getProduct(productId: string) {
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
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    getProduct(resolvedParams.productId).then(setProduct);
  }, [resolvedParams.productId]);

  if (!product) {
    return <div>Loading...</div>;
  }

  const handleSave = async (updatedProduct: Partial<Product>) => {
    try {
      const response = await fetch(`/api/products/${product.id}`, {
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
      setProduct(updated);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      router.push("/products");
      router.refresh();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

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

      {isEditDialogOpen && (
        <DialogComponent
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          title="Edit Product"
        >
          <ProductEditForm
            product={product}
            onSaveSuccess={handleSave}
            onDeleteSuccess={handleDelete}
            onCancel={() => setIsEditDialogOpen(false)}
            mode="edit"
          />
        </DialogComponent>
      )}
    </>
  );
}

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
