import { MaterialEditForm } from "@/components/forms/material-edit-form";
import { DialogComponent } from "@/components/ui/dialog";
import { Material, MeasurementUnit } from "@/types/material";

interface AddMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (material: Material) => void;
}

const defaultMaterial: Omit<Material, "id" | "createdAt" | "updatedAt"> = {
  type: "",
  color: "",
  colorCode: "",
  brand: "",
  quantity: 0,
  unit: MeasurementUnit.KILOGRAM,
  costPerUnit: 0,
  currency: "USD",
  location: "",
  notes: "",
  photos: [],
};

export function AddMaterialDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddMaterialDialogProps) {
  const handleSave = async (materialData: Partial<Material>) => {
    try {
      const response = await fetch("/api/materials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(materialData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create material");
      }

      const newMaterial = await response.json();
      onSuccess(newMaterial);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating material:", error);
      throw error;
    }
  };

  return (
    <DialogComponent
      open={open}
      onOpenChange={onOpenChange}
      title="Add New Material"
    >
      <MaterialEditForm
        material={defaultMaterial as Material} // Type assertion since we omit id/dates
        onSaveSuccess={handleSave}
        onCancel={() => onOpenChange(false)}
        mode="create"
      />
    </DialogComponent>
  );
}
