"use client";

import { DataTable, type DataTableColumn } from "@/components/data-table";
import { UpsertDialog } from "@/components/forms/upsert-dialog";
import { Notes } from "@/components/notes";
import { BackButton } from "@/components/ui/back-button";
import { DetailsView } from "@/components/ui/details-view";
import { DialogComponent } from "@/components/ui/dialog";
import { Inventory, Material } from "@/types/types";
import { Plus } from "lucide-react";
import { notFound, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

async function fetchMaterial(materialId: string) {
  try {
    const response = await fetch(`/api/materials/${materialId}`);
    if (response.status === 404) {
      notFound();
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching material:", error);
    throw error;
  }
}

export default function MaterialPage({
  params,
}: {
  params: Promise<{ materialId: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [material, setMaterial] = useState<Material | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(
    null
  );
  useEffect(() => {
    fetchMaterial(resolvedParams.materialId).then(setMaterial);
  }, [resolvedParams.materialId]);

  if (!material) {
    return <div>Loading...</div>;
  }

  const detailItems = [
    {
      label: "Color",
      value: material.color,
      key: "color",
      editable: true,
    },
    {
      label: "Color Code",
      value: material.colorCode,
      key: "colorCode",
      editable: true,
    },
    {
      label: "Brand",
      value: material.brand,
      key: "brand",
      editable: true,
    },
    {
      label: "Type",
      value: material.type,
      key: "type",
      editable: true,
    },
    {
      label: "Cost Per Unit",
      value: material.defaultCostPerUnit,
      key: "defaultCostPerUnit",
      type: "number",
      editable: true,
    },
    {
      label: "Unit",
      value: material.defaultUnit,
      key: "defaultUnit",
      type: "number",
      editable: true,
    },
    {
      label: "Currency",
      value: material.currency,
      key: "currency",
      type: "number",
      editable: true,
    },
  ];

  const inventoryFields = [
    { key: "quantity", label: "Quantity", type: "number", required: true },
    {
      key: "unit",
      label: "Unit",
      type: "select",
      required: true,
      options: [
        { label: "Gram", value: "GRAM" },
        { label: "Kilogram", value: "KILOGRAM" },
        { label: "Meter", value: "METER" },
        { label: "Yard", value: "YARD" },
        { label: "Unit", value: "UNIT" },
      ],
    },
    { key: "location", label: "Location", type: "text", required: true },
    { key: "notes", label: "Notes", type: "textarea" },
  ];

  const inventoryDefaultData = {
    quantity: 0.0,
    unit: "GRAM",
    location: "",
    notes: "",
    type: "MATERIAL",
    // materialId specified below
  };

  if (material.properties) {
    Object.entries(material.properties).forEach(([key, propertyData]) => {
      detailItems.push({
        label: propertyData.label,
        value: propertyData.value,
        key: `properties.${key}`,
        type: propertyData.type || "string",
        editable: true,
      });
    });
  }

  const inventoryColumns: DataTableColumn<Inventory>[] = [
    {
      id: "quantity",
      header: "Quantity",
      accessorKey: "quantity",
      cell: (inventory) => `${inventory.quantity} ${inventory.unit}`,
    },
    {
      id: "location",
      header: "Location",
      accessorKey: "location",
    },
  ];

  const productsColumns: DataTableColumn<Inventory>[] = [
    {
      id: "model",
      header: "Model",
      accessorKey: "name",
      cell: (inventory) => inventory.product?.name ?? "",
    },
    {
      id: "season",
      header: "Season",
      accessorKey: "season",
      cell: (inventory) => inventory.product?.season ?? "",
    },
  ];

  const handleSaveSuccess = (updatedMaterial: Material) => {
    console.log("saved success");
    setMaterial(updatedMaterial);
    setIsEditDialogOpen(false);
  };

  const handleSaveInventorySuccess = (newInventory: Inventory) => {
    if (!material) return;
    setMaterial({
      ...material,
      inventory: [...material.inventory, newInventory],
    });
    setIsEditDialogOpen(false);
  };

  const handleEditInventory = (inventory: Inventory) => {
    console.log("entering", inventory);
    setIsEditDialogOpen(true);
    setSelectedInventory(inventory);
    return;
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/materials/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete material");
      }
      router.push("/inventory/materials");
      router.refresh();
    } catch (error) {
      console.error("Error deleting material:", error);
    }
  };

  const handleAddInventory = () => {
    setSelectedInventory(null);
    setIsEditDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {material.color} - {material.colorCode}
          </h1>
          <div className="flex gap-2">
            <BackButton />
          </div>
        </div>

        <DetailsView
          onSave={handleSaveSuccess}
          items={detailItems}
          apiEndpoint="/api/materials"
          itemId={material.id}
          allowCustomFields={true} // Enable custom fields for materials
        />
      </div>

      <div className="mt-2">
        <Notes
          initialNotes={material.notes}
          onSuccess={handleSaveSuccess}
          apiEndpoint="/api/materials"
          itemId={material.id}
        />
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <div className="">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-1xl font-bold">Inventory</h2>
            <button
              className="p-1 hover:bg-gray-100 rounded-full"
              title="Add new inventory item"
              onClick={handleAddInventory}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <DataTable
            data={material.inventory}
            columns={inventoryColumns}
            viewPath="/inventory"
            onUpdate={handleEditInventory}
          />
        </div>
        <div className="">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-1xl font-bold">Used in Products</h2>
            {/* <button
              className="p-1 hover:bg-gray-100 rounded-full"
              title="Add new inventory item"
              onClick={() => console.log("Add new inventory clicked")}
            >
              <Plus className="w-5 h-5" />
            </button> */}
          </div>

          <DataTable
            data={material.products}
            columns={productsColumns}
            viewPath="/inventory"
          />
        </div>
      </div>
      {isEditDialogOpen && (
        <DialogComponent
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          title="Add Inventory"
        >
          <UpsertDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSuccess={handleSaveInventorySuccess}
            apiEndpoint="/api/inventory"
            fields={inventoryFields}
            defaultData={{
              ...inventoryDefaultData,
              ...selectedInventory,
              materialId: material.id,
            }}
            mode="create"
            itemName="inventory"
          />
        </DialogComponent>
      )}
    </>
  );
}
