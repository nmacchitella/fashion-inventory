"use client";

import { DataTable, type DataTableColumn } from "@/components/data-table";
import { UpsertDialog } from "@/components/forms/upsert-dialog";
import { Material } from "@/types/types";
import { useState } from "react";

// Define the columns for the material table
const materialColumns: DataTableColumn<Material>[] = [
  { header: "Type", accessorKey: "type" },
  {
    header: "Color",
    accessorKey: "color",
    cell: (material) => (
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-full border"
          style={{ backgroundColor: material.colorCode }}
        />
        {material.color}
      </div>
    ),
  },
  {
    header: "Quantity",
    accessorKey: "defaultUnit",
    cell: (material) => {
      const inventory = material.inventory?.[0];
      return inventory
        ? `${inventory.quantity} ${inventory.unit}`
        : "No inventory";
    },
  },
  { header: "Brand", accessorKey: "brand" },
  {
    header: "Cost",
    accessorKey: "defaultCostPerUnit",
    cell: (material) => `${material.defaultCostPerUnit} ${material.currency}`,
  },
];

// Define the fields for the "edit form" inside your UpsertDialog
// Adjust as needed for your material schema
const materialFields = [
  { key: "type", label: "Type", type: "text", required: true },
  { key: "color", label: "Color", type: "text" },
  { key: "colorCode", label: "Color Code", type: "text" },
  { key: "brand", label: "Brand", type: "text" },
  { key: "quantity", label: "Quantity", type: "number" },
  { key: "unit", label: "Unit", type: "text" },
  { key: "costPerUnit", label: "Cost Per Unit", type: "number" },
  { key: "currency", label: "Currency", type: "text" },
  { key: "location", label: "Location", type: "text" },
  { key: "notes", label: "Notes", type: "textarea" },
];

// Default data for creating a brand-new material
const defaultMaterial: Partial<Material> = {
  type: "",
  color: "",
  colorCode: "",
  brand: "",
  defaultCostPerUnit: 0,
  currency: "USD",
};

interface MaterialControlsProps {
  initialMaterials: Material[];
}

export function MaterialControls({ initialMaterials }: MaterialControlsProps) {
  // We keep track of all materials in state
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  );

  //Create
  const handleCreate = () => {
    setDialogMode("create");
    setSelectedMaterial(null);
    setIsDialogOpen(true);
  };

  //After a successful save (create or edit)
  const handleSaveSuccess = (upserted: Material) => {
    setMaterials((prev) => {
      // If we're updating an existing material, replace it
      const existingIndex = prev.findIndex((m) => m.id === upserted.id);
      if (existingIndex !== -1) {
        const updatedMaterials = [...prev];
        updatedMaterials[existingIndex] = upserted;
        return updatedMaterials;
      }
      // Otherwise, it's new
      return [upserted, ...prev];
    });
    setIsDialogOpen(false);
  };

  // Delete
  const handleDelete = async (materialId: string) => {
    try {
      const response = await fetch(`/api/materials/${materialId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete material");
      }
      // Remove from state
      setMaterials((prev) => prev.filter((m) => m.id !== materialId));
    } catch (error) {
      console.error("Error deleting material:", error);
    }
  };

  //Edit
  const handleUpdate = (material: Material) => {
    // We'll open the dialog in edit mode with the selected material
    setDialogMode("edit");
    setSelectedMaterial(material);
    setIsDialogOpen(true);
  };

  // --- Render ---
  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Material Inventory</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Add Material
        </button>
      </div>

      <DataTable
        data={materials}
        columns={materialColumns}
        onDelete={handleDelete} // Called when user clicks "Delete" in a row
        onUpdate={handleUpdate} // Called when user clicks "Edit" in a row
        viewPath="/inventory/materials"
      />

      {isDialogOpen && (
        <UpsertDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          mode={dialogMode} // "create" or "edit"
          apiEndpoint="/api/materials" // Our base endpoint
          itemName="Material"
          fields={materialFields}
          defaultData={selectedMaterial || defaultMaterial}
          onSuccess={handleSaveSuccess}
          // For showing the Delete button in the form (if you like),
          // we could pass a function. Usually we do it from the row actions,
          // but if you want the form to allow deletion:
          onDeleteSuccess={(item) => handleDelete(item.id!)}
        />
      )}
    </>
  );
}
