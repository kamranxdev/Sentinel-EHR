import { User } from './auth-user.model';
import { Patient } from './patient.model';

export interface Encounter {
  id?: string;
  patient?: Patient;
  patientId?: string;
  attendingProvider?: User;
  attendingProviderId?: string;
  encounterType: 'INPATIENT' | 'OUTPATIENT' | 'EMERGENCY' | 'TELEHEALTH' | string;
  classCode?: string;
  location?: string;
  acuityScore?: string;
  chiefComplaint?: string;
  clinicalNotes?: string;
  dischargeSummary?: string;
  reasonCode?: string;
  reasonText?: string;
  startTime?: string;
  endTime?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DISCHARGED' | string;
  encounterDate?: string;
}

export interface Allergy {
  id?: string;
  patient?: Patient;
  patientId?: string;
  allergenName: string;
  allergenCode?: string;
  category: 'DRUG' | 'FOOD' | 'ENVIRONMENTAL' | 'OTHER' | string;
  severity?: 'MILD' | 'MODERATE' | 'SEVERE' | 'LIFE_THREATENING' | string;
  criticality?: string;
  reactionDescription?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'RESOLVED' | string;
  recordedBy?: User;
  recordedAt?: string;
}

export interface Diagnosis {
  id?: string;
  patient?: Patient;
  patientId?: string;
  doctor?: User;
  conditionName: string;
  diagnosisName?: string;
  diagnosisCode?: string;
  icdCode?: string;
  snomedCode?: string;
  diagnosisType?: string;
  verificationStatus?: string;
  onsetDate?: string;
  resolvedDate?: string;
  status: 'ACTIVE' | 'RESOLVED' | 'CHRONIC' | string;
  notes?: string;
  recordedAt?: string;
}

export interface MedicalRecord {
  id?: string;
  patient?: Patient;
  patientId?: string;
  encounterId?: string;
  authorId?: string;
  doctor?: User;
  recordType?: string;
  title?: string;
  diagnosis?: string;
  icdCode?: string;
  symptoms?: string;
  content?: string;
  treatmentPlan?: string;
  notes?: string;
  isConfidential?: boolean;
  createdAt?: string;
}

export interface Vitals {
  id?: string;
  patient?: Patient;
  patientId?: string;
  encounterId?: string;
  recordedBy?: User;
  recordedById?: string;
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
  news2Score?: number;
  triageCategory?: string;
  fluidIntakeMl?: number;
  fluidOutputMl?: number;
  status?: string;
  recordedAt?: string;
}

export interface Prescription {
  id?: string;
  patient?: Patient;
  patientId?: string;
  practitionerId?: string;
  doctor?: User;
  medicationName: string;
  medicationCode?: string;
  rxNormCode?: string;
  dosage?: string;
  dose?: string;
  unit?: string;
  route?: string;
  frequency?: string;
  durationDays?: number;
  durationUnit?: string;
  quantity?: number;
  refills?: number;
  instructions?: string;
  status: string;
  prescribedAt?: string;
  startDate?: string;
  endDate?: string;
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
