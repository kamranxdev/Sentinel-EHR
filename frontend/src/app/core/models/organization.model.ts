export interface Organization {
  id: number;
  orgCode: string;
  name: string;
  licenseNumber: string;
  email?: string;
  phone?: string;
  address?: string;
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'SUSPENDED';
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
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'SUSPENDED';
  notes?: string;
}
