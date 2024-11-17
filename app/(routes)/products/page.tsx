import { prisma } from "@/lib/prisma";
import { ProductsControls } from "./products-controls";

async function getProducts() {
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return products;
}

export default async function ProductsPage() {
  const initialProducts = await getProducts();

  return (
    <div className="space-y-4">
      <ProductsControls initialProducts={initialProducts} />
    </div>
  );
}
