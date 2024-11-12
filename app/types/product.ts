export interface Product {
  id: string;
  sku: string;
  piece: string;
  name: string;
  season: string;
  phase: 'SWATCH' | 'INITIAL_SAMPLE' | 'FIT_SAMPLE' | 'PRODUCTION_SAMPLE' | 'PRODUCTION';
  notes?: string;
  photos: string[];
  createdAt: Date;
  updatedAt: Date;
}