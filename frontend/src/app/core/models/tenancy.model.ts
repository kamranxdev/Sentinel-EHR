export interface Organization {
  id: string;
  code?: string;
  name: string;
  legalName?: string;
  organizationType?: string;
  status: string;
  timezone?: string;
  countryCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  landmark?: string;
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
}

export interface Department {
  id: string;
  organizationId: string;
  name: string;
  departmentCode?: string;
  specialty?: string;
  status: 'ACTIVE' | 'INACTIVE';
  wards?: Ward[];
}

export interface Ward {
  id: string;
  departmentId: string;
  name: string;
  wardType?: 'ICU' | 'GENERAL' | 'SURGICAL' | 'PEDIATRIC' | 'MATERNITY' | 'EMERGENCY';
  floor?: string;
  status: 'ACTIVE' | 'INACTIVE';
  rooms?: Room[];
}

export interface Room {
  id: string;
  wardId: string;
  roomNumber: string;
  roomType?: 'SINGLE' | 'DOUBLE' | 'ISOLATION' | 'SEMI_PRIVATE';
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  beds?: BedDetail[];
}

export interface BedDetail {
  id: string;
  roomId: string;
  bedNumber: string;
  bedType?: 'STANDARD' | 'ICU' | 'BARIATRIC' | 'PEDIATRIC';
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED' | 'CLEANING';
  currentPatientId?: string;
  currentEncounterId?: string;
}

export interface PriceList {
  id: number | string;
  organizationId: string;
  name: string;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  items?: PriceListItem[];
}

export interface PriceListItem {
  id: number | string;
  priceListId: number | string;
  itemCode: string;
  itemDescription: string;
  category: 'CONSULTATION' | 'LAB_TEST' | 'IMAGING' | 'PROCEDURE' | 'BED_CHARGE' | 'MEDICATION';
  unitPrice: number;
  taxRate?: number;
}
