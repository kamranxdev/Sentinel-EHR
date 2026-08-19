export interface DepartmentContextDTO {
  id: string;
  code: string;
  name: string;
  departmentType?: string;
}

export interface FacilityContextDTO {
  id: string;
  code: string;
  name: string;
  facilityType?: string;
  departments: DepartmentContextDTO[];
}

export interface OrganizationContextDTO {
  id: string;
  code: string;
  name: string;
  legalName?: string;
  organizationType?: string;
  employeeCode?: string;
  employmentType?: string;
  facilities: FacilityContextDTO[];
}

export interface SelectedContext {
  organizationId: string;
  organizationName: string;
  organizationCode?: string;
  facilityId?: string;
  facilityName?: string;
  departmentId?: string;
  departmentName?: string;
  roleName?: string;
}

export interface User {
  id: string;
  personId?: string;
  email?: string;
  fullName?: string;
  username?: string;
  specialization?: string;
  specialty?: string;
  department?: string;
  licenseNumber?: string;
  qualifications?: string;
  yearsOfExperience?: number;
  medicalBoardState?: string;
  verificationStatus?: string;
  status?: string;
  mfaEnabled?: boolean;
  roles: string[];
  patientId?: string;
  organizations?: OrganizationContextDTO[];
}

export interface JwtAuthResponse {
  accessToken: string;
  tokenType: string;
  email: string;
  fullName: string;
  username?: string;
  roles: string[];
  permissions?: string[];
  userId?: string;
  id?: string;
  patientId?: string;
  organizations?: OrganizationContextDTO[];
  assignedPatientIds?: string[];
  specialty?: string;
  specialization?: string;
  department?: string;
  facilityId?: string;
  licenseNumber?: string;
}

export interface UserUpdateRequestDTO {
  fullName?: string;
  email?: string;
  specialization?: string;
  department?: string;
  licenseNumber?: string;
  roles?: string[];
}

export interface UserStatusUpdateRequestDTO {
  status: string;
}

export interface UserPasswordResetRequestDTO {
  newPassword?: string;
}
