
export interface DealStatus {
  id: string;
  name: string;
  color: string;
}

export interface Deal {
  id: string;
  title: string;
  clientName: string;
  value: number;
  status: string; // DealStatus ID
}

export type PricingType = 'per_m2' | 'per_unit';

export interface Material {
  id: string;
  name: string;
  price: number; 
  pricingType: PricingType;
}

export interface QuoteItem {
  itemId: string;
  materialId: string;
  quantity: number;
  unitPrice: number;
  width?: number; 
  height?: number; 
  pricingType: PricingType;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  profitMultiplier: number;
  createdAt: string;
}

export interface AppData {
  deals: Deal[];
  materials: Material[];
  quotes: Quote[];
  dealStatuses: DealStatus[];
  companyLogo?: string;
}
