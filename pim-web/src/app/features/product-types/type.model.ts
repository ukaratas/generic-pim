export interface ProductType {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export type DataType = 'Enum' | 'Number' | 'Text' | 'Boolean' | 'Date';

export interface PropertyDefinition {
  id: number;
  productTypeId: number;
  name: string;
  key: string;
  dataType: DataType;
  isRequired: boolean;
  optionsJson?: string | null;
  min?: number | null;
  max?: number | null;
  regex?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
} 