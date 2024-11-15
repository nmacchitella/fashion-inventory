// app/inventory/inventory-controls.tsx
"use client";

import { MaterialsTable } from "@/components/data-tables/materials-table";
import { AddMaterialDialog } from "@/components/forms/add-material-dialog";
import { Material } from "@/types/material";
import { useState } from "react";

interface InventoryControlsProps {
  initialMaterials: Material[];
}

export function InventoryControls({
  initialMaterials,
}: InventoryControlsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [materials, setMaterials] = useState(initialMaterials);

  const handleAddSuccess = (newMaterial: Material) => {
    setMaterials((prevMaterials) => [newMaterial, ...prevMaterials]);
    setIsAddDialogOpen(false);
  };

  const handleDelete = async (materialId: string) => {
    try {
      const response = await fetch(`/api/materials/${materialId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // Get the error message from the API if available
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete material");
      }

      setMaterials((prevMaterials) =>
        prevMaterials.filter((m) => m.id !== materialId)
      );
    } catch (error) {
      console.error("Error deleting material:", error);
      throw error; // Propagate error to MaterialEditForm
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Add Material
        </button>
      </div>

      <MaterialsTable
        materials={materials}
        onDelete={handleDelete}
        onUpdate={(updatedMaterial) => {
          setMaterials((prevMaterials) =>
            prevMaterials.map((m) =>
              m.id === updatedMaterial.id ? updatedMaterial : m
            )
          );
        }}
      />

      <AddMaterialDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={handleAddSuccess}
      />
    </>
  );
}
