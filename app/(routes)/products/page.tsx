import { prisma } from "@/lib/prisma";
import { ProductsTable } from "@/components/data-tables/products-table";
import { Product } from "@/types/product";

async function getProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Convert Prisma types to our custom types
  return products.map(product => ({
    ...product,
    notes: product.notes || undefined, // Convert null to undefined
    createdAt: new Date(product.createdAt),
    updatedAt: new Date(product.updatedAt)
  }));
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <button 
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Add Product
        </button>
      </div>
      
      <ProductsTable products={products} />
    </div>
  );
}
