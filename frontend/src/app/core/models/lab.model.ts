import { Patient } from './patient.model';
import { Encounter } from './clinical.model';

export interface LabResultComponent {
  code?: string;
  name?: string;
  valueNumeric?: number;
  valueText?: string;
  unit?: string;
  referenceLow?: number;
  referenceHigh?: number;
  abnormalFlag?: string;
  critical?: boolean;
  interpretation?: string;
}

export interface LabResult {
  id?: string;
  orderId?: string | number;
  labOrderId?: string | number;
  patientId?: string;
  testCode?: string;
  testName: string;
  resultValue: string;
  unit?: string;
  referenceRange?: string;
  abnormalFlag?: string | boolean;
  isCritical?: boolean;
  verified?: boolean;
  verifiedByUsername?: string;
  verifiedAt?: string;
  notes?: string;
  recordedBy?: string;
  recordedAt?: string;
  createdAt?: string;
  components?: LabResultComponent[];
}

export interface Specimen {
  id?: string;
  orderId?: string | number;
  specimenBarcode: string;
  specimenType?: string;
  collectionSite?: string;
  fastingStatus?: string;
  status?: string;
  notes?: string;
  collectedByUsername?: string;
  collectedAt?: string;
}

export interface LabOrder {
  id?: string | number;
  patientId?: string;
  encounterId?: string;
  patient?: Patient;
  encounter?: Encounter;
  testCode?: string;
  testName: string;
  category?: string;
  priority?: string;
  loincCode?: string;
  clinicalNotes?: string;
  notes?: string;
  status: 'ORDERED' | 'SPECIMEN_COLLECTED' | 'IN_PROCESS' | 'IN_ANALYSIS' | 'COMPLETED' | 'RESULTED' | 'CANCELLED' | string;
  specimenBarcode?: string;
  barcode?: string;
  orderedByUsername?: string;
  orderedBy?: string;
  orderedAt?: string;
  results?: LabResult[];
  specimens?: Specimen[];
}

export interface LabOrderRequestDTO {
  patientId?: string;
  encounterId?: string;
  testCode?: string;
  testName: string;
  category?: string;
  priority?: string;
  loincCode?: string;
  specimenType?: string;
  collectionInstructions?: string;
  fastingRequired?: boolean;
  clinicalNotes?: string;
  notes?: string;
}

export interface LabOrderStatusUpdateDTO {
  status: string;
  specimenBarcode?: string;
  barcode?: string;
  clinicalNotes?: string;
}
