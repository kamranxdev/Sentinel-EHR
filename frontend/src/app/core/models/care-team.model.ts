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
  username: string;
  fullName?: string;
  role: 'PRIMARY_ATTENDING' | 'CONSULTING_PHYSICIAN' | 'PRIMARY_NURSE' | 'CASE_MANAGER' | 'PHARMACIST' | 'SOCIAL_WORKER' | string;
  specialty?: string;
  periodStart?: string;
  periodEnd?: string;
}

export interface AddCareTeamMemberRequest {
  practitionerId?: string;
  username: string;
  fullName?: string;
  role: string;
  specialty?: string;
}
