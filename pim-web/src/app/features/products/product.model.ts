export interface Product {
  id: number;
  name: string;
  code?: string | null;
  description?: string | null;
  isActive: boolean;
  productTypeId?: number | null;
  attributesJson?: string | null;
  createdAt: string;
  updatedAt?: string | null;
} 