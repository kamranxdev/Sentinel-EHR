import { Patient } from './patient.model';
import { Encounter } from './clinical.model';

export interface CriticalPhoneLog {
  doctorName: string;
  phoneNumber?: string;
  contactTime?: string;
  readBackConfirmed: boolean;
  notes?: string;
  loggedByUsername?: string;
}

export interface LabResultComponent {
  id?: string | number;
  code?: string;
  name: string;
  valueNumeric?: number | null;
  valueText?: string;
  unit?: string;
  referenceLow?: number | null;
  referenceHigh?: number | null;
  abnormalFlag?: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL_PANIC' | string;
  critical?: boolean;
  interpretation?: string;
  deltaPercent?: number | null;
  previousValue?: string | number | null;
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
  abnormalFlag?: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL_PANIC' | string | boolean;
  isCritical?: boolean;
  verified?: boolean;
  verifiedByUsername?: string;
  verifiedAt?: string;
  notes?: string;
  recordedBy?: string;
  recordedAt?: string;
  resultAt?: string;
  orderedAt?: string;
  loincCode?: string;
  createdAt?: string;
  status?: string;
  components?: LabResultComponent[];
  criticalPhoneLog?: CriticalPhoneLog;
  deltaCheckAlert?: boolean;
  deltaCheckMessage?: string;
}

export interface Specimen {
  id?: string;
  orderId?: string | number;
  patientId?: string;
  specimenBarcode: string;
  barcode?: string;
  accessionNumber?: string;
  specimenType?: string;
  container?: string;
  tubeColor?: string;
  collectionSite?: string;
  collectionMethod?: string;
  fastingStatus?: string;
  adequacyStatus?: 'SATISFACTORY' | 'HEMOLYZED' | 'LIPEMIC' | 'CLOTTED' | 'QNS';
  storageLocation?: string;
  status?: 'COLLECTED' | 'RECEIVED' | 'ACCESSIONED' | 'REJECTED' | 'PROCESSING' | string;
  notes?: string;
  collectedByUsername?: string;
  collectedAt?: string;
  receivedAt?: string;
}

export interface LabOrder {
  id?: string | number;
  patientId?: string;
  patientFullName?: string;
  patientMrn?: string;
  patientGender?: string;
  patientBirthDate?: string;
  encounterId?: string;
  patient?: Patient;
  encounter?: Encounter;
  testCode?: string;
  testName: string;
  category?: string;
  priority?: 'STAT' | 'URGENT' | 'ROUTINE' | string;
  loincCode?: string;
  clinicalNotes?: string;
  notes?: string;
  status:
    | 'ORDERED'
    | 'RECEIVED'
    | 'SPECIMEN_COLLECTED'
    | 'ACCESSIONED'
    | 'IN_PROCESS'
    | 'IN_ANALYSIS'
    | 'RESULTED'
    | 'COMPLETED'
    | 'VERIFIED'
    | 'CANCELLED'
    | string;
  specimenBarcode?: string;
  barcode?: string;
  accessionNumber?: string;
  container?: string;
  specimenType?: string;
  analyzerName?: string;
  orderingProviderUsername?: string;
  orderedByUsername?: string;
  orderedBy?: string;
  orderedAt?: string;
  specimenCollectedAt?: string;
  inProcessAt?: string;
  resultedAt?: string;
  reviewedAt?: string;
  reviewedByUsername?: string;
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
