import { Patient } from './patient.model';
import { Prescription } from './clinical.model';

export interface TriageEwsRecord {
  id?: number;
  patientId?: number;
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
  patientId: number;
  systolicBp?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  consciousnessLevel?: string;
}

export interface TriageEwsResponseDTO {
  id: number;
  patientId: number;
  ewsScore: number;
  triagePriority: string;
  recordedBy: string;
  recordedAt: string;
}

export interface EmarRecord {
  id?: number;
  patientId?: number;
  prescriptionId?: number;
  patient?: Patient;
  prescription?: Prescription;
  medicationName: string;
  dose: string;
  route?: string;
  administeredBy?: string;
  administeredAt?: string;
  status?: string;
  notes?: string;
}

export interface EmarRecordRequestDTO {
  patientId: number;
  prescriptionId?: number;
  medicationName: string;
  dose: string;
  route?: string;
  notes?: string;
}

export interface EmarRecordResponseDTO {
  id: number;
  patientId: number;
  prescriptionId?: number;
  medicationName: string;
  dose: string;
  route?: string;
  administeredBy: string;
  administeredAt: string;
  status: string;
}
