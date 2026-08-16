export interface Organization {
  id: string;
  code?: string;
  orgCode?: string;
  name: string;
  legalName?: string;
  organizationType?: string;
  licenseNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  timezone?: string;
  countryCode?: string;
  status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'SUSPENDED' | string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrganizationRegistrationRequest {
  orgName: string;
  licenseNumber: string;
  email?: string;
  phone?: string;
  address?: string;
  adminUsername: string;
  adminPassword: string;
  adminEmail: string;
  adminFullName: string;
}

export interface OrganizationStatusUpdate {
  status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'SUSPENDED' | string;
  notes?: string;
}
