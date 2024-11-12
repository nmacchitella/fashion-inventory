export enum ContactType {
  SUPPLIER = 'SUPPLIER',
  MANUFACTURER = 'MANUFACTURER',
  CUSTOMER = 'CUSTOMER',
  OTHER = 'OTHER'
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  role?: string | null;
  type: ContactType;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}