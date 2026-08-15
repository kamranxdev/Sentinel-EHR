export interface User {
  id: number;
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
  roles: string[];
}

export interface JwtAuthResponse {
  accessToken: string;
  tokenType: string;
  username: string;
  fullName: string;
  roles: string[];
  userId: number;
  id?: number;
  assignedPatientIds?: number[];
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
