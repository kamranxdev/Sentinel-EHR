import { Patient } from './patient.model';
import { Prescription } from './clinical.model';

export interface TriageEwsRecord {
  id?: string;
  patientId?: string;
  patient?: Patient;
  ewsScore: number;
  triagePriority: 'ROUTINE' | 'URGENT' | 'EMERGENT' | 'RESUSCITATION' | string;
  systolicBp?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  consciousnessLevel?: string;
  recordedBy?: string;
  recordedAt?: string;
}

export interface TriageEwsRequestDTO {
  patientId: string;
  systolicBp?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  consciousnessLevel?: string;
}

export interface TriageEwsResponseDTO {
  id: string;
  patientId: string;
  ewsScore: number;
  triagePriority: string;
  recordedBy: string;
  recordedAt: string;
}

export interface EmarRecord {
  id?: string;
  patientId?: string;
  prescriptionId?: string;
  patient?: Patient;
  prescription?: Prescription;
  medicationName: string;
  dose: string;
  unit?: string;
  site?: string;
  route?: string;
  administeredBy?: string;
  scheduledAt?: string;
  administeredAt?: string;
  status?: string;
  notes?: string;
}

export interface EmarRecordRequestDTO {
  patientId: string;
  prescriptionId?: string;
  medicationName: string;
  dose: string;
  unit?: string;
  site?: string;
  route?: string;
  notes?: string;
}

export interface EmarRecordResponseDTO {
  id: string;
  patientId: string;
  prescriptionId?: string;
  medicationName: string;
  dose: string;
  unit?: string;
  site?: string;
  route?: string;
  administeredBy: string;
  scheduledAt?: string;
  administeredAt: string;
  status: string;
}
