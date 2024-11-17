import { ProductEditForm } from "@/components/forms/product-edit-form";
import { DialogComponent } from "@/components/ui/dialog";
import { Product } from "@/types/product";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (product: Product) => void;
}

const defaultProduct: Omit<Product, "id" | "createdAt" | "updatedAt"> = {
  sku: "",
  piece: "",
  name: "",
  season: "",
  phase: "SWATCH",
  notes: "",
  photos: [],
};

export function AddProductDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddProductDialogProps) {
  const handleSave = async (productData: Partial<Product>) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create product");
      }

      const newProduct = await response.json();
      onSuccess(newProduct);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  };

  return (
    <DialogComponent
      open={open}
      onOpenChange={onOpenChange}
      title="Add New Product"
    >
      <ProductEditForm
        product={defaultProduct as Product}
        onSaveSuccess={handleSave}
        onCancel={() => onOpenChange(false)}
        mode="create"
      />
    </DialogComponent>
  );
}
