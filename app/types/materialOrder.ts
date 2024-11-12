// types/materialOrder.ts

export enum MeasurementUnit {
  GRAM = 'GRAM',
  KILOGRAM = 'KILOGRAM',
  METER = 'METER',
  YARD = 'YARD',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface MaterialOrderItem {
  id: string;
  orderId: string;
  materialId: string;
  quantity: number;
  unit: MeasurementUnit;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaterialOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  orderItems: MaterialOrderItem[];
  totalPrice: number;
  currency: string;
  orderDate: Date;
  expectedDelivery: Date;
  actualDelivery?: Date;
  status: OrderStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}