"use client";

import { DataTable, DataTableColumn } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Material, Product, ProductMaterial } from "@prisma/client";
import { ChevronDown, ChevronRight, Download, Search } from "lucide-react";
import React, { useEffect, useState } from "react";

type ProductWithMaterials = Product & {
  materials: (ProductMaterial & {
    material: Material;
  })[];
};

type ProductWithQuantity = {
  product: ProductWithMaterials;
  quantity: number;
};

type MaterialRequirement = {
  material: Material;
  totalQuantity: number;
  unit: string;
};

type GroupedProducts = {
  [key: string]: ProductWithMaterials[];
};

export default function MaterialOrderPage() {
  const [products, setProducts] = useState<ProductWithMaterials[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<
    ProductWithQuantity[]
  >([]);
  const [materialRequirements, setMaterialRequirements] = useState<
    MaterialRequirement[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again later.");
      }
    };

    fetchProducts();
  }, []);

  const groupedProducts = products.reduce((acc: GroupedProducts, product) => {
    if (!acc[product.name]) acc[product.name] = [];
    acc[product.name].push(product);
    return acc;
  }, {});

  const filteredGroupedProducts = Object.entries(groupedProducts).filter(
    ([name, products]) =>
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      products.some(
        (product) =>
          product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.materials.some(
            (pm) =>
              pm.material.type
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              pm.material.color
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
          )
      )
  );

  const toggleGroup = (name: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(name)) newExpanded.delete(name);
    else newExpanded.add(name);
    setExpandedGroups(newExpanded);
  };

  const handleAddProduct = (product: ProductWithMaterials) => {
    if (!selectedProducts.some((sp) => sp.product.id === product.id)) {
      setSelectedProducts((prev) => [...prev, { product, quantity: 0 }]);
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    setSelectedProducts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity };
      return updated;
    });
  };

  const calculateMaterials = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tools/calculate-materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: selectedProducts.map(({ product, quantity }) => ({
            productId: product.id,
            quantity,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to calculate materials");
      const requirements = await response.json();
      setMaterialRequirements(requirements);
    } catch (error) {
      console.error("Error calculating materials:", error);
      setError("Failed to calculate materials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const materialColumns: DataTableColumn<MaterialRequirement>[] = [
    {
      header: "Type",
      accessorKey: "material.type",
      cell: (item: MaterialRequirement) => item.material.type,
    },
    {
      header: "Color",
      accessorKey: "material.color",
      cell: (item: MaterialRequirement) => (
        <div className="flex items-center gap-2">
          <span>{item.material.color}</span>
          <span className="text-sm text-gray-500">
            ({item.material.colorCode})
          </span>
        </div>
      ),
    },
    {
      header: "Brand",
      accessorKey: "material.brand",
      cell: (item: MaterialRequirement) => item.material.brand,
    },
    {
      header: "Properties",
      accessorKey: "material.properties",
      cell: (item: MaterialRequirement) => {
        if (!item.material.properties) return null;
        const properties = item.material.properties as Record<string, any>;
        return (
          <div className="space-y-1">
            {Object.entries(properties).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500 capitalize">
                  {key}:
                </span>
                <span className="text-sm">{value.value.toString()}</span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      header: "Required Quantity",
      accessorKey: "totalQuantity",
      cell: (item: MaterialRequirement) => (
        <div className="text-right">
          {item.totalQuantity.toFixed(2)} {item.unit.toLowerCase()}
        </div>
      ),
    },
  ];

  const handleDownloadCSV = () => {
    const headers = [
      "Type",
      "Color",
      "Color Code",
      "Brand",
      "Required Quantity",
      "Unit",
    ];
    const rows = materialRequirements.map((req) => [
      req.material.type,
      req.material.color,
      req.material.colorCode,
      req.material.brand,
      req.totalQuantity.toFixed(2),
      req.unit,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "required_materials.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Material Order Planning</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6 max-w-5xl">
        {/* Search Products Section */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Search Products</h2>

          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 w-full border rounded-lg p-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="border rounded-lg">
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-left">Materials</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGroupedProducts.map(([name, products]) => (
                    <React.Fragment key={name}>
                      <tr
                        className="border-t hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleGroup(name)}
                      >
                        <td className="px-4 py-2 flex items-center gap-2">
                          {expandedGroups.has(name) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <span className="font-medium">{name}</span>
                          <span className="text-sm text-gray-500">
                            ({products.length} variants)
                          </span>
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                      {expandedGroups.has(name) &&
                        products.map((product) => (
                          <tr key={product.id} className="border-t bg-gray-50">
                            <td className="px-4 py-2 pl-10">
                              <div className="text-sm text-gray-600">
                                SKU: {product.sku}
                              </div>
                              <div className="text-sm text-gray-600">
                                Season: {product.season}
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex flex-wrap gap-1">
                                {product.materials.map((pm) => (
                                  <span
                                    key={pm.id}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white border"
                                  >
                                    {pm.material.type} - {pm.material.colorCode}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddProduct(product);
                                }}
                                disabled={selectedProducts.some(
                                  (sp) => sp.product.id === product.id
                                )}
                                className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 disabled:bg-gray-300"
                              >
                                {selectedProducts.some(
                                  (sp) => sp.product.id === product.id
                                )
                                  ? "Added"
                                  : "Add"}
                              </button>
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Selected Products Section */}
        {selectedProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Selected Products</h2>
              <span className="text-sm text-gray-500">
                {selectedProducts.length} items
              </span>
            </div>

            <div className="border rounded-lg mb-4">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-left">Materials</th>
                    <th className="px-4 py-2 text-right">Quantity</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProducts.map((item, index) => (
                    <tr key={item.product.id} className="border-t">
                      <td className="px-4 py-2">{item.product.name}</td>
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap gap-1">
                          {item.product.materials.map((pm) => (
                            <span
                              key={pm.id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white border"
                            >
                              {pm.material.type} - {pm.material.colorCode}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              index,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="border rounded w-24 p-1 text-right"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() =>
                            setSelectedProducts((prev) =>
                              prev.filter((_, i) => i !== index)
                            )
                          }
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={calculateMaterials}
              disabled={
                isLoading || selectedProducts.every((p) => p.quantity === 0)
              }
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? "Calculating..." : "Calculate Required Materials"}
            </button>
          </div>
        )}

        {/* Required Materials Section */}
        {materialRequirements.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Required Materials</h2>
              <Button
                onClick={handleDownloadCSV}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download CSV
              </Button>
            </div>

            <DataTable
              data={materialRequirements}
              columns={materialColumns}
              viewPath=""
              hideActions
            />
          </div>
        )}
      </div>
    </div>
  );
}
