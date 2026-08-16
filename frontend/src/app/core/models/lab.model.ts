import { Patient } from './patient.model';
import { Encounter } from './clinical.model';

export interface LabResult {
  id?: string;
  labOrderId?: string;
  testName?: string;
  resultValue: string;
  unit?: string;
  referenceRange?: string;
  abnormalFlag?: boolean;
  notes?: string;
  recordedBy?: string;
  recordedAt?: string;
}

export interface LabOrder {
  id?: string;
  patientId?: string;
  encounterId?: string;
  patient?: Patient;
  encounter?: Encounter;
  testName: string;
  loincCode?: string;
  notes?: string;
  status: 'ORDERED' | 'SPECIMEN_COLLECTED' | 'IN_ANALYSIS' | 'COMPLETED' | 'CANCELLED' | string;
  barcode?: string;
  orderedBy?: string;
  orderedAt?: string;
  results?: LabResult[];
}

export interface LabOrderRequestDTO {
  patientId: string;
  encounterId?: string;
  testName: string;
  loincCode?: string;
  notes?: string;
}

export interface LabOrderStatusUpdateDTO {
  status: string;
  barcode?: string;
}
