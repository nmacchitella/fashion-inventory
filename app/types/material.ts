export enum MeasurementUnit {
  GRAM = 'GRAM',
  KILOGRAM = 'KILOGRAM',
  METER = 'METER',
  YARD = 'YARD',
}

export interface Material {
  id: string;
  type: string;
  color: string;
  colorCode: string;
  brand: string;
  quantity: number;
  unit: MeasurementUnit;
  costPerUnit: number;
  currency: string;
  location: string;
  notes?: string;
  photos: string[];
  createdAt: Date;
  updatedAt: Date;
}
