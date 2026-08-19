import { User } from './auth-user.model';
import { Allergy, Diagnosis, Encounter, MedicalRecord, Prescription, Vitals } from './clinical.model';

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
  patient?: Patient;
  pastIllnesses?: Diagnosis[];
  allergies?: Allergy[];
  prescriptions?: Prescription[];
  vitals?: Vitals[];
  medicalRecords?: MedicalRecord[];
  encounters?: Encounter[];
  problems?: Diagnosis[];
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
  patient?: Patient;
  matchingFields?: string[];
  conflictingFields?: string[];
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
  username?: string;
  requestedBy?: string;
  category: string;
  justification: string;
  reason?: string;
  requestedAt?: string;
  accessedAt?: string;
  createdAt?: string;
  expiresAt?: string;
  status?: string;
  clientIp?: string;
}

export interface PatientAddress {
  id?: string;
  patientId?: string;
  addressLine1: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  state?: string;
  countryCode?: string;
  postalCode?: string;
  isPrimary?: boolean;
  addressType?: 'HOME' | 'WORK' | 'TEMPORARY' | string;
}

export interface PatientDemographics {
  id?: string;
  patientId?: string;
  dateOfBirth?: string;
  gender?: string;
  sexAtBirth?: string;
  genderIdentity?: string;
  sexualOrientation?: string;
  maritalStatus?: string;
  preferredLanguage?: string;
  race?: string;
  ethnicity?: string;
  bloodType?: string;
  bloodGroup?: string;
  rhFactor?: string;
}

export interface PatientMedicalHistory {
  id?: string;
  patientId?: string;
  condition?: string;
  diagnosis?: string;
  notes?: string;
  pastMedicalHistory?: string;
  pastSurgicalHistory?: string;
  familyHistory?: string;
  seriousConditions?: string;
  surgeriesAndProcedures?: string;
  familyMedicalHistory?: string;
  updatedAt?: string;
}

export interface PatientSocialHistory {
  id?: string;
  patientId?: string;
  smokingStatus?: string;
  alcoholConsumption?: string;
  alcoholStatus?: string;
  exerciseRoutine?: string;
  exerciseFrequency?: string;
  occupationalHazards?: string;
  updatedAt?: string;
}

export interface PatientDietaryHistory {
  id?: string;
  patientId?: string;
  dietType?: string;
  dietaryHabits?: string;
  foodAllergies?: string;
  restrictions?: string;
  dietaryRestrictions?: string;
  nutritionalRestrictions?: string;
  notes?: string;
  updatedAt?: string;
}

export interface PatientInsurancePolicy {
  id?: string;
  patientId?: string;
  insuranceProvider: string;
  payerName?: string;
  policyNumber: string;
  memberId?: string;
  groupNumber?: string;
  coveragePlan?: string;
  planType?: string;
  primaryPolicyHolder?: string;
  relationshipToHolder?: string;
  validFrom?: string;
  validTo?: string;
  status?: 'ACTIVE' | 'EXPIRED' | 'PENDING_VERIFICATION' | string;
}

export interface InpatientAdmissionRecord {
  id: string;
  encounterId: string;
  patientId?: string;
  wardId?: string;
  roomId?: string;
  bedId?: string;
  admissionReason?: string;
  attendingPractitionerId?: string;
  admittedAt: string;
  status: 'ADMITTED' | 'TRANSFERRED' | 'DISCHARGED' | 'CANCELLED';
}

export interface InpatientDischargeRecord {
  id: string;
  encounterId: string;
  dischargeDisposition?: string;
  dischargeNotes?: string;
  followUpInstructions?: string;
  dischargedAt: string;
  dischargedBy?: string;
}

export interface InpatientTransferRecord {
  id: string;
  encounterId: string;
  fromWardId?: string;
  toWardId?: string;
  fromRoomId?: string;
  toRoomId?: string;
  fromBedId?: string;
  toBedId?: string;
  transferReason?: string;
  transferredAt: string;
  notes?: string;
}


