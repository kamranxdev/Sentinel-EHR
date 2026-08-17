export interface Facility {
  id: string;
  organizationId: string;
  name: string;
  facilityCode?: string;
  facilityType?: 'HOSPITAL' | 'CLINIC' | 'OUTPATIENT_CENTER' | 'DIAGNOSTIC_LAB';
  status: 'ACTIVE' | 'INACTIVE';
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phone?: string;
  departments?: Department[];
}

export interface Department {
  id: string;
  facilityId: string;
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
  facilityId: string;
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
