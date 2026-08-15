import { User } from './auth-user.model';
import { Allergy, Diagnosis, MedicalRecord, Prescription, Vitals } from './clinical.model';

export interface Patient {
  id: number;
  patientCode: string;
  abhaId?: string;
  nationalId?: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  phone: string;
  email: string;
  address: string;
  pinCode?: string;
  emergencyContact: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceGroupNumber?: string;
  coveragePlan?: string;
  medicalAlerts?: string;
  dietaryHabits?: string;
  smokingStatus?: string;
  alcoholConsumption?: string;
  exerciseRoutine?: string;
  foodAllergies?: string;
  pastMedicalHistory?: string;
  seriousConditions?: string;
  surgeriesAndProcedures?: string;
  familyMedicalHistory?: string;
  user?: User;
  createdAt?: string;
}

export interface PatientClinicalHistoryDTO {
  patient: Patient;
  pastIllnesses: Diagnosis[];
  allergies: Allergy[];
  prescriptions: Prescription[];
  vitals: Vitals[];
  medicalRecords: MedicalRecord[];
  habitsSummary?: string;
  foodAllergiesSummary?: string;
  seriousConditionsSummary?: string;
  surgeriesSummary?: string;
}

// Master Patient Index (MPI) Search & Merge
export interface MPIMatchCandidateDTO {
  patientId: number;
  patientCode: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  matchScore: number;
  matchDetails?: string;
}

export interface MPIMergeRequestDTO {
  primaryPatientId: number;
  duplicatePatientId: number;
  mergeReason: string;
}

// Emergency Access Break-Glass
export interface BreakGlassRecord {
  id?: number;
  patientId: number;
  requestedBy: string;
  accessCategory: string;
  justification: string;
  grantedAt?: string;
  expiresAt?: string;
  ipAddress?: string;
  status?: string;
}

export interface BreakGlassRequestDTO {
  patientId: number;
  category: string;
  justification: string;
}
