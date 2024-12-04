export enum MeasurementUnit {
  GRAM = "GRAM",
  KILOGRAM = "KILOGRAM",
  METER = "METER",
  YARD = "YARD",
}

// Base material definition
export interface Material {
  id: string;
  type: string;
  color: string;
  colorCode: string;
  brand: string;
  defaultUnit: MeasurementUnit;
  defaultCostPerUnit: number;
  currency: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Inventory entry for a material
export interface MaterialInventory {
  id: string;
  materialId: string;
  material: Material; // For joined queries
  quantity: number;
  unit: MeasurementUnit;
  location: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// For material movement tracking (optional but recommended)
export enum MovementType {
  RECEIVED = 'RECEIVED',    // From orders
  CONSUMED = 'CONSUMED',    // Used in production
  ADJUSTED = 'ADJUSTED',    // Manual adjustment
  RETURNED = 'RETURNED',    // Returned to supplier
  SCRAPPED = 'SCRAPPED',    // Damaged/unusable
}

export interface MaterialMovement {
  id: string;
  materialId: string;
  material: Material;
  quantity: number;
  unit: MeasurementUnit;
  type: MovementType;
  reference?: string;      // Order number, production batch, etc.
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}