// Common fields that all entities share
type BaseEntity = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string | null;
};

// Enums
export enum InventoryType {
  MATERIAL = "MATERIAL",
  PRODUCT = "PRODUCT",
}

export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
  PRODUCTION_MANAGER = "PRODUCTION_MANAGER",
  INVENTORY_MANAGER = "INVENTORY_MANAGER",
}

export enum MeasurementUnit {
  GRAM = "GRAM",
  KILOGRAM = "KILOGRAM",
  METER = "METER",
  YARD = "YARD",
}

export enum TransactionType {
  INCOMING = "INCOMING",
  OUTGOING = "OUTGOING",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum MovementType {
  RECEIVED = "RECEIVED",
  CONSUMED = "CONSUMED",
  ADJUSTED = "ADJUSTED",
  RETURNED = "RETURNED",
  SCRAPPED = "SCRAPPED",
}

export enum ContactType {
  SUPPLIER = "SUPPLIER",
  MANUFACTURER = "MANUFACTURER",
  CUSTOMER = "CUSTOMER",
  OTHER = "OTHER",
}

export enum Phase {
  SWATCH = "SWATCH",
  INITIAL_SAMPLE = "INITIAL_SAMPLE",
  FIT_SAMPLE = "FIT_SAMPLE",
  PRODUCTION_SAMPLE = "PRODUCTION_SAMPLE",
  PRODUCTION = "PRODUCTION",
}

// Domain Models
export type User = BaseEntity & {
  email: string;
  name?: string | null;
  role: Role;
};

export type Inventory = BaseEntity & {
  type: InventoryType;
  quantity: number;
  unit: MeasurementUnit;
  location: string;

  // Polymorphic relationship fields
  materialId?: string | null;
  material?: Material | null;
  productId?: string | null;
  product?: Product | null;

  // Relations
  movements: TransactionItem[];
};

export type Transaction = BaseEntity & {
  type: InventoryType;
  transactionType: TransactionType;
  referenceNumber?: string | null;
  supplier?: string | null;
  recipient?: string | null;
  totalPrice?: number | null;
  currency?: string | null;
  orderDate: Date;
  expectedDelivery?: Date | null;
  actualDelivery?: Date | null;
  status: TransactionStatus;

  // Relations
  items: TransactionItem[];
};

export type TransactionItem = BaseEntity & {
  transactionId: string;
  transaction: Transaction;
  inventoryId: string;
  inventory: Inventory;
  quantity: number;
  unit: MeasurementUnit;
  unitPrice?: number | null;
  totalPrice?: number | null;
};

export type Material = BaseEntity & {
  type: string;
  color: string;
  colorCode: string;
  brand: string;
  defaultUnit: MeasurementUnit;
  defaultCostPerUnit: number;
  currency: string;
  properties: Record<string, any> | null; // More specific type for JSON

  // Relations
  inventory: Inventory[];
  products: ProductMaterial[];
};

export type Product = BaseEntity & {
  sku: string;
  piece: string;
  name: string;
  season: string;
  phase: Phase;
  photos: string[];

  // Relations
  materials: ProductMaterial[];
  inventory: Inventory[];
};

export type ProductMaterial = BaseEntity & {
  productId: string;
  product: Product;
  materialId: string;
  material: Material;
  quantity: number;
  unit: MeasurementUnit;
};

export type Contact = BaseEntity & {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  role?: string | null;
  type: ContactType;
};

// Utility types for create/update operations
export type CreateInventoryInput = Omit<
  Inventory,
  "id" | "createdAt" | "updatedAt" | "movements"
>;
export type UpdateInventoryInput = Partial<CreateInventoryInput>;

export type CreateTransactionInput = Omit<
  Transaction,
  "id" | "createdAt" | "updatedAt" | "items"
> & {
  items: Omit<
    TransactionItem,
    "id" | "createdAt" | "updatedAt" | "transaction"
  >[];
};
export type UpdateTransactionInput = Partial<CreateTransactionInput>;

export type CreateMaterialInput = Omit<
  Material,
  "id" | "createdAt" | "updatedAt" | "inventory" | "products"
>;
export type UpdateMaterialInput = Partial<CreateMaterialInput>;

export type CreateProductInput = Omit<
  Product,
  "id" | "createdAt" | "updatedAt" | "materials" | "inventory"
>;
export type UpdateProductInput = Partial<CreateProductInput>;

// Response types for API endpoints
export type InventoryWithRelations = Inventory & {
  material?: Material;
  product?: Product;
  movements: TransactionItem[];
};

export type TransactionWithRelations = Transaction & {
  items: (TransactionItem & {
    inventory: InventoryWithRelations;
  })[];
};

export type MaterialWithRelations = Material & {
  inventory: InventoryWithRelations[];
  products: (ProductMaterial & {
    product: Product;
  })[];
};

export type ProductWithRelations = Product & {
  inventory: InventoryWithRelations[];
  materials: (ProductMaterial & {
    material: Material;
  })[];
};

export type FormFieldType = "text" | "number" | "select" | "textarea";

export type FormField<T> = {
  key: keyof T | keyof BaseEntity;
  label: string;
  type: FormFieldType;
  required?: boolean;
  options?: string[];
};
