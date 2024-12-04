// app/inventory/inventory-controls.tsx
"use client";

import { MaterialsTable } from "@/components/data-tables/materials-table";
import { AddMaterialDialog } from "@/components/forms/add-material-dialog";
import { Material } from "@/types/material";
import { useState } from "react";

interface InventoryMaterialControlsProps {
  initialMaterials: Material[];
}

export function InventoryMaterialControls({
  initialMaterials,
}: InventoryMaterialControlsProps) {
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete material");
      }

      // Only update the UI if deletion was successful
      setMaterials((prevMaterials) =>
        prevMaterials.filter((m) => m.id !== materialId)
      );

      return data;
    } catch (error) {
      console.error("Error deleting material:", error);
      throw error;
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Material Inventory</h1>
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
