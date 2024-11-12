#!/bin/bash

# First, create a confirm dialog component for delete confirmation
mkdir -p app/components/ui
cat > app/components/ui/confirm-dialog.tsx << 'EOL'
"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  isLoading
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <Dialog.Title className="text-xl font-semibold text-center">
              {title}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-500 text-center">
              {description}
            </Dialog.Description>
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
EOL

# Update Material Edit Form with delete functionality
cat > app/components/forms/material-edit-form.tsx << 'EOL'
"use client";

import { Material, MeasurementUnit } from "@/types/material";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface MaterialEditFormProps {
  material: Material;
  onSave: (updatedMaterial: Partial<Material>) => Promise<void>;
  onDelete: () => Promise<void>;
  onCancel: () => void;
}

export function MaterialEditForm({ material, onSave, onDelete, onCancel }: MaterialEditFormProps) {
  const [formData, setFormData] = useState({
    type: material.type,
    color: material.color,
    colorCode: material.colorCode,
    brand: material.brand,
    quantity: material.quantity,
    unit: material.unit,
    costPerUnit: material.costPerUnit,
    currency: material.currency,
    location: material.location,
    notes: material.notes || "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving material:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error('Error deleting material:', error);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Existing form fields remain the same */}
        {/* ... */}

        <div className="flex justify-between border-t pt-6 mt-6">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
          >
            Delete Material
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Material"
        description="Are you sure you want to delete this material? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isLoading={isDeleting}
      />
    </>
  );
}
EOL

# Update Product Edit Form with delete functionality
cat > app/components/forms/product-edit-form.tsx << 'EOL'
"use client";

import { Product } from "@/types/product";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface ProductEditFormProps {
  product: Product;
  onSave: (updatedProduct: Partial<Product>) => Promise<void>;
  onDelete: () => Promise<void>;
  onCancel: () => void;
}

export function ProductEditForm({ product, onSave, onDelete, onCancel }: ProductEditFormProps) {
  const [formData, setFormData] = useState({
    name: product.name,
    piece: product.piece,
    season: product.season,
    phase: product.phase,
    notes: product.notes || "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error('Error deleting product:', error);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Existing form fields remain the same */}
        {/* ... */}

        <div className="flex justify-between border-t pt-6 mt-6">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
          >
            Delete Product
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isLoading={isDeleting}
      />
    </>
  );
}
EOL

# Add DELETE method to material API route
cat > app/api/materials/\[materialId\]/route.ts << 'EOL'
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ... keep existing GET and PATCH methods ...

export async function DELETE(
  _request: Request,
  { params }: { params: { materialId: string } }
) {
  try {
    await prisma.material.delete({
      where: {
        id: params.materialId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error deleting material" },
      { status: 500 }
    );
  }
}
EOL

# Add DELETE method to product API route
cat > app/api/products/\[productId\]/route.ts << 'EOL'
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ... keep existing GET and PATCH methods ...

export async function DELETE(
  _request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    await prisma.product.delete({
      where: {
        id: params.productId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error deleting product" },
      { status: 500 }
    );
  }
}
EOL

# Add delete handler to materials table
sed -i '' 's/onDelete={() => console.log(/onDelete={async () => {\
      if (!confirm("Are you sure you want to delete this material?")) return;\
      try {\
        const response = await fetch(`\/api\/materials\/${/g' app/components/data-tables/materials-table.tsx
sed -i '' 's/material.id)}/material.id}`, { method: "DELETE" });\
        if (!response.ok) throw new Error("Failed to delete material");\
        setMaterials(materials.filter(m => m.id !== material.id));\
      } catch (error) {\
        console.error("Error deleting material:", error);\
      }\
    }}/g' app/components/data-tables/materials-table.tsx

# Add delete handler to products table
sed -i '' 's/onDelete={() => console.log(/onDelete={async () => {\
      if (!confirm("Are you sure you want to delete this product?")) return;\
      try {\
        const response = await fetch(`\/api\/products\/${/g' app/components/data-tables/products-table.tsx
sed -i '' 's/product.id)}/product.id}`, { method: "DELETE" });\
        if (!response.ok) throw new Error("Failed to delete product");\
        setProducts(products.filter(p => p.id !== product.id));\
      } catch (error) {\
        console.error("Error deleting product:", error);\
      }\
    }}/g' app/components/data-tables/products-table.tsx

echo "Setup complete! The following files have been created/updated:"
echo "1. app/components/ui/confirm-dialog.tsx"
echo "2. app/components/forms/material-edit-form.tsx"
echo "3. app/components/forms/product-edit-form.tsx"
echo "4. app/api/materials/[materialId]/route.ts"
echo "5. app/api/products/[productId]/route.ts"
echo "6. app/components/data-tables/materials-table.tsx"
echo "7. app/components/data-tables/products-table.tsx"
echo "Make sure to update the parent components to handle the new onDelete prop"
