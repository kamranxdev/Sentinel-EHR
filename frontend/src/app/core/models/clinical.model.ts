import { User } from './auth-user.model';
import { Patient } from './patient.model';

export type CareEpisodeType =
  | 'OUTPATIENT_CARE'
  | 'EMERGENCY_EPISODE'
  | 'ACUTE_ILLNESS'
  | 'CHRONIC_CARE'
  | 'SURGICAL_EPISODE'
  | string;

export type CareEpisodeStatus = 'ACTIVE' | 'PLANNED' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED' | string;

export interface CareEpisode {
  id?: string;
  organizationId?: string;
  patientId?: string;
  patient?: Patient;
  patientName?: string;
  episodeCode?: string;
  episodeType: CareEpisodeType;
  status: CareEpisodeStatus;
  title?: string;
  notes?: string;
  primaryDiagnosisCode?: string;
  primaryDiagnosisName?: string;
  primaryPractitionerId?: string;
  primaryPractitionerName?: string;
  startedAt?: string;
  endedAt?: string;
  encounters?: Encounter[];
  createdAt?: string;
  updatedAt?: string;
}

export interface EncounterParticipant {
  id?: string;
  encounterId?: string;
  practitionerId?: string;
  practitionerName?: string;
  practitionerEmail?: string;
  participantRole: 'PRIMARY' | 'ATTENDING' | 'CONSULTANT' | 'ADMITTING' | 'DISCHARGING' | 'NURSE' | 'RESIDENT' | string;
  periodStart?: string;
  periodEnd?: string;
}

export interface Encounter {
  id?: string;
  patient?: Patient;
  patientId?: string;
  organizationId?: string;
  careEpisodeId?: string;
  careEpisodeCode?: string;
  sourceEncounterId?: string;
  relationshipType?: string;
  departmentId?: string;
  departmentName?: string;
  encounterNumber?: string;
  attendingProvider?: User;
  attendingProviderId?: string;
  attendingPractitionerId?: string;
  attendingPractitionerName?: string;
  appointmentId?: string;
  admissionId?: string;
  encounterType: 'INPATIENT' | 'OUTPATIENT' | 'EMERGENCY' | 'OBSERVATION' | 'TELEHEALTH' | string;
  classCode?: string;
  location?: string;
  acuityScore?: string;
  acuity?: string;
  chiefComplaint?: string;
  reasonForVisit?: string;
  clinicalNotes?: string;
  dischargeSummary?: string;
  reasonCode?: string;
  reasonText?: string;
  startTime?: string;
  startedAt?: string;
  endTime?: string;
  endedAt?: string;
  disposition?: 'DISCHARGE' | 'OBSERVE' | 'ADMIT' | 'TRANSFER' | 'AMA' | 'EXPIRED' | string;
  participants?: EncounterParticipant[];
  status: 'PLANNED' | 'ARRIVED' | 'TRIAGED' | 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED' | 'DISCHARGED' | 'CANCELLED' | string;
  encounterDate?: string;
  createdByEmail?: string;
  createdAt?: string;
}

export interface EmergencyDispositionRequest {
  disposition: 'DISCHARGE' | 'OBSERVE' | 'ADMIT' | 'TRANSFER' | 'AMA';
  notes?: string;
  dischargeInstructions?: string;
  admittingPractitionerId?: string;
  admittingDepartmentId?: string;
  wardId?: string;
  roomId?: string;
  bedId?: string;
  admissionType?: string;
  admissionReason?: string;
}

export interface Allergy {
  id?: string;
  patient?: Patient;
  patientId?: string;
  organizationId?: string;
  allergenName: string;
  allergenCode?: string;
  category: 'DRUG' | 'FOOD' | 'ENVIRONMENTAL' | 'OTHER' | string;
  severity?: 'MILD' | 'MODERATE' | 'SEVERE' | 'LIFE_THREATENING' | string;
  criticality?: string;
  reaction?: string;
  reactionDescription?: string;
  onsetDate?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'RESOLVED' | string;
  verificationStatus?: string;
  notes?: string;
  recordedBy?: User;
  recordedByEmail?: string;
  recordedAt?: string;
  updatedAt?: string;
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
  recordedByEmail?: string;
  systolicBp?: number;
  diastolicBp?: number;
  meanArterialPressure?: number;
  heartRate?: number;
  temperature?: number;
  temperatureUnit?: string;
  oxygenSaturation?: number;
  respiratoryRate?: number;
  weightKg?: number;
  heightCm?: number;
  bmi?: number;
  bloodGlucose?: number;
  glucoseUnit?: string;
  painScore?: number;
  position?: string;
  oxygenDeliveryMethod?: string;
  notes?: string;
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
  encounterId?: string;
  practitionerId?: string;
  doctor?: User;
  doctorName?: string;
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
  indication?: string;
  instructions?: string;
  status: string;
  prescribedAt?: string;
  startDate?: string;
  startAt?: string;
  endDate?: string;
  endAt?: string;
  createdAt?: string;
  updatedAt?: string;
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

export interface AdmissionRequest {
  admissionSource?: string;
  admitReason?: string;
  bedId?: string;
  wardId?: string;
  notes?: string;
}

export interface AdmissionResponseDTO {
  id?: string;
  encounterId?: string;
  patientId?: string;
  admissionSource?: string;
  admitReason?: string;
  admittedAt?: string;
  dischargedAt?: string;
  dischargeDisposition?: string;
  lengthOfStayDays?: number;
  bedId?: string;
  bedNumber?: string;
}
