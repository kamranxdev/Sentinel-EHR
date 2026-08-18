export interface User {
  id: string;
  personId?: string;
  username: string;
  fullName: string;
  email?: string;
  specialization?: string;
  department?: string;
  licenseNumber?: string;
  qualifications?: string;
  yearsOfExperience?: number;
  medicalBoardState?: string;
  verificationStatus?: string;
  status?: string;
  mfaEnabled?: boolean;
  roles: string[];
}

export interface JwtAuthResponse {
  accessToken: string;
  tokenType: string;
  username: string;
  fullName: string;
  email?: string;
  roles: string[];
  permissions?: string[];
  userId?: string;
  id?: string;
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
