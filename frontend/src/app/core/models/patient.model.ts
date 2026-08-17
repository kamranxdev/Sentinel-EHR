import { User } from './auth-user.model';
import { Allergy, Diagnosis, MedicalRecord, Prescription, Vitals } from './clinical.model';

export interface EmergencyContact {
  id?: string;
  name?: string;
  relationship?: string;
  phone?: string;
  alternatePhone?: string;
  email?: string;
  address?: string;
  isPrimary?: boolean;
  canMakeMedicalDecisions?: boolean;
  notes?: string;
}

export interface Patient {
  id: string;
  patientCode: string;
  personId?: string;
  mrn?: string;
  abhaId?: string;
  nationalId?: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  dateOfBirth: string;
  gender: string;
  sexAtBirth?: string;
  genderIdentity?: string;
  sexualOrientation?: string;
  maritalStatus?: string;
  preferredLanguage?: string;
  ethnicity?: string;
  race?: string;
  bloodType?: string;
  bloodGroup?: string;
  rhFactor?: string;
  phone: string;
  email: string;
  address: string;
  district?: string;
  state?: string;
  countryCode?: string;
  pinCode?: string;
  status?: string;
  emergencyContact?: EmergencyContact;
  emergencyContacts?: EmergencyContact[];
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
  updatedAt?: string;
  deceasedAt?: string;
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
  id?: string;
  patientId?: string;
  patientCode: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  matchScore: number;
  matchClassification?: string;
  matchReason?: string;
  matchDetails?: string;
}

export interface MPIMergeRequestDTO {
  primaryPatientId: string;
  duplicatePatientId: string;
  mergeReason: string;
}

export interface BreakGlassRequestDTO {
  patientId: string;
  category?: string;
  justification: string;
}

export interface BreakGlassRecord {
  id?: string;
  patientId?: string;
  patient?: Patient;
  user?: User;
  category: string;
  justification: string;
  requestedAt?: string;
  expiresAt?: string;
  status?: string;
  clientIp?: string;
}


