import { Patient } from './patient.model';
import { Prescription } from './clinical.model';

export interface TriageEwsRecord {
  id?: string;
  encounterId?: string;
  patientId?: string;
  patient?: Patient;
  ewsScore?: number;
  chiefComplaint?: string;
  triagePriority: 'ROUTINE' | 'URGENT' | 'EMERGENT' | 'RESUSCITATION' | 'NON_URGENT' | string;
  vitalsSummary?: string;
  systolicBp?: number;
  diastolicBp?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  consciousnessLevel?: string;
  notes?: string;
  triagedByUsername?: string;
  recordedBy?: string;
  recordedAt?: string;
  triagedAt?: string;
}

export interface TriageEwsRequestDTO {
  encounterId?: string;
  patientId?: string;
  chiefComplaint?: string;
  triagePriority?: string;
  vitalsSummary?: string;
  systolicBp?: number;
  diastolicBp?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  consciousnessLevel?: string;
  notes?: string;
}

export interface TriageEwsResponseDTO {
  id: string;
  encounterId?: string;
  patientId?: string;
  chiefComplaint?: string;
  triagePriority: string;
  vitalsSummary?: string;
  notes?: string;
  ewsScore?: number;
  triagedByUsername?: string;
  recordedBy?: string;
  triagedAt?: string;
  recordedAt?: string;
}

export interface EmarRecord {
  id?: string;
  patientId?: string;
  encounterId?: string;
  prescriptionId?: string;
  patient?: Patient;
  prescription?: Prescription;
  medicationName: string;
  dose: string;
  unit?: string;
  site?: string;
  route?: string;
  administeredBy?: string;
  administeredByUsername?: string;
  scheduledAt?: string;
  administeredAt?: string;
  status?: string;
  notes?: string;
}

export interface EmarRecordRequestDTO {
  prescriptionId?: string;
  encounterId?: string;
  patientId?: string;
  medicationName: string;
  dose: string;
  unit?: string;
  site?: string;
  route?: string;
  notes?: string;
  administeredAt?: string;
}

export interface EmarRecordResponseDTO {
  id: string;
  patientId?: string;
  encounterId?: string;
  prescriptionId?: string;
  medicationName: string;
  dose: string;
  unit?: string;
  site?: string;
  route?: string;
  administeredBy?: string;
  administeredByUsername?: string;
  scheduledAt?: string;
  administeredAt: string;
  status: string;
  notes?: string;
}

export interface NursingFlowsheetEntry {
  id?: string;
  parameterName: string;
  parameterValue: string;
  unit?: string;
  notes?: string;
  recordedAt?: string;
}

export interface NursingFlowsheet {
  id: string;
  encounterId: string;
  shift: string;
  nurseUsername?: string;
  createdAt: string;
  entries: NursingFlowsheetEntry[];
}
