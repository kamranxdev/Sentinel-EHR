import { User } from './auth-user.model';
import { Patient } from './patient.model';

export interface Encounter {
  id?: number;
  patient: Patient;
  attendingProvider?: User;
  encounterType: 'INPATIENT' | 'OUTPATIENT' | 'EMERGENCY' | 'TELEHEALTH' | string;
  location?: string;
  acuityScore?: string;
  chiefComplaint?: string;
  clinicalNotes?: string;
  dischargeSummary?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DISCHARGED' | string;
  encounterDate?: string;
}

export interface Allergy {
  id?: number;
  patient: Patient;
  allergenName: string;
  allergenCode?: string;
  category: 'DRUG' | 'FOOD' | 'ENVIRONMENTAL' | 'OTHER' | string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'LIFE_THREATENING' | string;
  reactionDescription?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'RESOLVED' | string;
  recordedBy?: User;
  recordedAt?: string;
}

export interface Diagnosis {
  id?: number;
  patient: Patient;
  doctor?: User;
  conditionName: string;
  icdCode?: string;
  snomedCode?: string;
  onsetDate?: string;
  status: 'ACTIVE' | 'RESOLVED' | 'CHRONIC' | string;
  notes?: string;
  recordedAt?: string;
}

export interface MedicalRecord {
  id?: number;
  patient: Patient;
  doctor?: User;
  diagnosis: string;
  icdCode?: string;
  symptoms?: string;
  treatmentPlan?: string;
  notes?: string;
  createdAt?: string;
}

export interface Vitals {
  id?: number;
  patient?: Patient;
  patientId?: number;
  recordedBy?: User;
  recordedById?: number;
  recordedByName?: string;
  systolicBp?: number;
  diastolicBp?: number;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
  weightKg?: number;
  heightCm?: number;
  bmi?: number;
  bloodGlucose?: number;
  painScore?: number;
  fluidIntakeMl?: number;
  fluidOutputMl?: number;
  recordedAt?: string;
}

export interface Prescription {
  id?: number;
  patient: Patient;
  doctor?: User;
  medicationName: string;
  rxNormCode?: string;
  dosage: string;
  route?: string;
  frequency: string;
  durationDays: number;
  refills?: number;
  instructions?: string;
  status: string;
  prescribedAt?: string;
}

export interface SafetyCheckResult {
  safe: boolean;
  severity: string;
  conflictingAllergen?: string;
  message: string;
  alertType?: string;
}

export interface AllergyStatusUpdateDTO {
  status: string;
}

export interface DiagnosisStatusUpdateDTO {
  status: string;
}

export interface PrescriptionStatusUpdateDTO {
  status: string;
}
