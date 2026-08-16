import { User } from './auth-user.model';
import { Allergy, Diagnosis, MedicalRecord, Prescription, Vitals } from './clinical.model';

export interface EmergencyContact {
  id?: number;
  name?: string;
  relationship?: string;
  phone?: string;
  email?: string;
  address?: string;
}

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
  emergencyContact?: EmergencyContact;
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

export interface BreakGlassRequestDTO {
  patientId: number;
  category?: string;
  justification: string;
}

export interface BreakGlassRecord {
  id?: number;
  patient?: Patient;
  user?: User;
  category: string;
  justification: string;
  requestedAt?: string;
  expiresAt?: string;
  status?: string;
  clientIp?: string;
}

