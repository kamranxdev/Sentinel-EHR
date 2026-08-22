export interface CareTeam {
  id: number | string;
  encounterId: string;
  patientId?: string;
  name?: string;
  status: 'PROPOSED' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  members: CareTeamMember[];
  startDate?: string;
  endDate?: string;
}

export interface CareTeamMember {
  id: number | string;
  careTeamId?: number | string;
  practitionerId?: string;
  userId?: string;
  email: string;
  fullName?: string;
  name?: string;
  role:
    | 'ATTENDING_PHYSICIAN'
    | 'PRIMARY_ATTENDING'
    | 'CONSULTING_PHYSICIAN'
    | 'PRIMARY_NURSE'
    | 'CHARGE_NURSE'
    | 'STAFF_NURSE'
    | 'TRIAGE_NURSE'
    | 'CASE_MANAGER'
    | 'PHARMACIST'
    | 'SOCIAL_WORKER'
    | string;
  roleCategory?: 'PHYSICIAN' | 'NURSE' | 'SPECIALIST' | 'ALLIED_HEALTH';
  specialty?: string;
  periodStart?: string;
  periodEnd?: string;
  startedAt?: string;
}

export interface AddCareTeamMemberRequest {
  practitionerId?: string;
  userId?: string;
  email: string;
  fullName?: string;
  role: string;
  specialty?: string;
}

export interface CareTeamMemberInfo {
  id: string;
  practitionerId?: string;
  userId?: string;
  name: string;
  role: string;
  roleCategory: 'PHYSICIAN' | 'NURSE' | 'SPECIALIST' | 'ALLIED_HEALTH' | string;
  specialty?: string;
  email?: string;
  startedAt?: string;
}

export interface InpatientCareItem {
  encounterId: string;
  encounterNumber: string;
  encounterType: string;
  encounterStatus: string;
  admissionId?: string;
  admissionDate?: string;
  admissionDiagnosis?: string;
  admissionType?: string;
  admissionSource?: string;
  lengthOfStayDays?: number;
  patientId: string;
  patientCode: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber?: string;
  bloodGroup?: string;
  bedId?: string;
  bedCode?: string;
  bedNumber?: string;
  bedType?: string;
  wardId?: string;
  wardName?: string;
  roomNumber?: string;
  departmentName?: string;
  careTeamId?: string;
  careTeamName?: string;
  myRole?: string;
  isAttending?: boolean;
  isPrimaryNurse?: boolean;
  careTeamMembers: CareTeamMemberInfo[];
  ewsScore?: number;
  acuityLevel?: 'STABLE' | 'OBSERVED' | 'CRITICAL';
  codeStatus?: 'FULL_CODE' | 'DNR' | 'DNI';
  fallRisk?: 'LOW' | 'MODERATE' | 'HIGH';
  isolation?: 'NONE' | 'CONTACT' | 'DROPLET' | 'AIRBORNE';
}
