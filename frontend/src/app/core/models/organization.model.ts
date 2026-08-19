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
  addressLine1?: string;
  addressLine2?: string;
  landmark?: string;
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  website?: string;
  timezone?: string;
  countryCode?: string;
  status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'SUSPENDED' | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizationRegistrationRequest {
  name?: string;
  orgName: string;
  orgCode?: string;
  code?: string;
  legalName?: string;
  organizationType?: string;
  licenseNumber: string;
  email?: string;
  phone?: string;
  address?: string;
  addressLine1?: string;
  addressLine2?: string;
  landmark?: string;
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  website?: string;
  countryCode?: string;
  timezone?: string;
  adminUsername: string;
  adminPassword: string;
  adminEmail: string;
  adminFullName: string;
}

export interface OrganizationStatusUpdate {
  status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'SUSPENDED' | string;
  notes?: string;
}

export interface SysAdminStatsDTO {
  totalOrganizations: number;
  activeOrganizations: number;
  totalUsers: number;
  totalAuditEvents: number;
  systemUptimeSeconds?: number;
}

export interface OrgAdminDashboardStatsDTO {
  totalStaff: number;
  activePractitioners: number;
  totalDepartments: number;
  totalWards: number;
  occupancyRate?: number;
  activeEncounters?: number;
}

export interface StaffOnboardingRequestDTO {
  username: string;
  fullName: string;
  email: string;
  password?: string;
  role?: string;
  roles?: string[];
  department?: string;
  specialization?: string;
  specialty?: string;
  licenseNumber?: string;
  qualifications?: string;
  yearsOfExperience?: number;
  medicalBoardState?: string;
}

export interface StaffUpdateRequestDTO {
  fullName?: string;
  email?: string;
  roles?: string[];
  department?: string;
  specialization?: string;
  licenseNumber?: string;
  status?: string;
}
