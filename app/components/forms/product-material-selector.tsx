import { UpsertDialog } from "@/components/forms/upsert-dialog";
import { DialogComponent } from "@/components/ui/dialog";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

const MaterialSelector = ({
  productId,
  onSelect,
  open,
  onOpenChange,
  fields,
}) => {
  const [materials, setMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("METER");
  const [showNewMaterialDialog, setShowNewMaterialDialog] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/materials")
        .then((res) => res.json())
        .then(setMaterials);
    }
  }, [open]);

  const filteredMaterials = materials.filter(
    (m) =>
      m.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.colorCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.values(m.properties || {}).some((prop) =>
        prop.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleAddNewMaterial = async (materialData) => {
    const response = await fetch("/api/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(materialData),
    });
    const newMaterial = await response.json();
    setMaterials([...materials, newMaterial]);
    setShowNewMaterialDialog(false);
  };

  const handleConfirm = () => {
    onSelect({
      materialId: selectedMaterial.id,
      quantity: parseFloat(quantity),
      unit,
    });
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setSelectedMaterial(null);
    setQuantity("");
    setUnit("METER");
    setSearchTerm("");
  };

  return (
    <>
      <DialogComponent
        open={open}
        onOpenChange={onOpenChange}
        title="Select Material"
      >
        <div className="space-y-4">
          {!selectedMaterial ? (
            <>
              <div className="flex justify-between items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <input
                    placeholder="Search materials..."
                    className="w-full pl-8 p-2 border rounded"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  className="ml-2 px-4 py-2 border rounded hover:bg-gray-50"
                  onClick={() => setShowNewMaterialDialog(true)}
                >
                  Add New
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                {filteredMaterials.map((material) => (
                  <button
                    key={material.id}
                    className="text-left p-4 border rounded hover:bg-gray-50"
                    onClick={() => setSelectedMaterial(material)}
                  >
                    <div className="font-medium">
                      {material.brand} - {material.type}
                    </div>
                    <div className="text-sm text-gray-600">
                      {material.color} ({material.colorCode})
                      {material.properties &&
                        Object.entries(material.properties).map(
                          ([key, value]) => (
                            <span key={value.label} className="ml-2">
                              {value.label}: {value.value}
                            </span>
                          )
                        )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <button
                className="flex items-center gap-2 px-3 py-1 border rounded hover:bg-gray-50"
                onClick={() => setSelectedMaterial(null)}
              >
                <X className="h-4 w-4" />
                {selectedMaterial.brand} - {selectedMaterial.color}
              </button>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  >
                    <option value="METER">Meter</option>
                    <option value="YARD">Yard</option>
                    <option value="UNIT">Unit</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleConfirm}
                disabled={!quantity}
                className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add to Product
              </button>
            </div>
          )}
        </div>
      </DialogComponent>

      {showNewMaterialDialog && (
        <UpsertDialog
          mode="create"
          open={showNewMaterialDialog}
          onOpenChange={setShowNewMaterialDialog}
          fields={fields}
          defaultData={{}}
          apiEndpoint="/api/materials"
          itemName="Material"
          onSuccess={handleAddNewMaterial}
        />
      )}
    </>
  );
};

export default MaterialSelector;
