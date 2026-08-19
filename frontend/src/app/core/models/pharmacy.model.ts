import { Patient } from './patient.model';
import { User } from './auth-user.model';
import { Prescription } from './clinical.model';

export interface MedicationOrder {
  id: string;
  patientId: string;
  patient?: Patient;
  encounterId?: string;
  practitionerId?: string;
  doctor?: User;
  doctorName?: string;
  medicationName: string;
  medicationCode?: string;
  rxNormCode?: string;
  dosage: string;
  route: string;
  frequency: string;
  quantity: number;
  refills: number;
  instructions?: string;
  indication?: string;
  status:
    | 'PENDING_VERIFICATION'
    | 'PHARMACY_VERIFIED'
    | 'DISPENSED'
    | 'REJECTED'
    | 'CLARIFICATION_REQUESTED'
    | 'DISCONTINUED'
    | string;
  priority?: 'ROUTINE' | 'STAT' | 'URGENT' | string;
  orderedAt: string;
  verifiedAt?: string;
  dispensedAt?: string;
  pharmacistNotes?: string;
  rejectionReason?: string;
  clarificationText?: string;
}

export interface MedicationBatch {
  id: string;
  medicationId?: string;
  medicationName: string;
  batchNumber: string;
  manufacturer: string;
  expiryDate: string;
  quantityOnHand: number;
  reorderLevel: number;
  unitPrice: number;
  location: string;
  status: 'ACTIVE' | 'QUARANTINED' | 'EXPIRED' | 'DEPLETED' | string;
  receivedDate?: string;
}

export interface InventoryItem {
  id: string;
  organizationId?: string;
  medicationId?: string;
  medicationName: string;
  genericName?: string;
  dosageForm: string;
  strength: string;
  category: string;
  totalQuantityOnHand: number;
  reorderLevel: number;
  unitOfMeasure: string;
  unitPrice: number;
  batches?: MedicationBatch[];
  lastRestockedAt?: string;
}

export interface StockReceiptDTO {
  medicationName: string;
  batchNumber: string;
  manufacturer: string;
  expiryDate: string;
  quantity: number;
  unitPrice: number;
  location: string;
  supplierInvoiceNumber?: string;
}

export interface StockAdjustmentDTO {
  batchId: string;
  adjustmentType: 'INCREMENT' | 'DECREMENT' | 'DAMAGE' | 'EXPIRED' | 'RECOUNT';
  quantity: number;
  reason: string;
}

export interface DispensationRecord {
  id: string;
  orderId: string;
  patientId: string;
  patientName?: string;
  medicationName: string;
  dosage: string;
  batchId?: string;
  batchNumber?: string;
  quantityDispensed: number;
  dispensedByPharmacistId?: string;
  dispensedByPharmacistName?: string;
  dispensedAt: string;
  copayAmount?: number;
  chargeGenerated?: boolean;
  notes?: string;
}

export interface PharmacySafetyEvaluation {
  orderId: string;
  patientAllergies: string[];
  drugInteractions: { severity: 'HIGH' | 'MODERATE' | 'LOW'; description: string }[];
  renalDosingWarning?: string;
  duplicateTherapyWarning?: string;
  overallStatus: 'SAFE' | 'WARNING' | 'CRITICAL_CONTRAINDICATION';
}

export interface MedicationCatalogItem {
  id: string;
  code?: string;
  name: string;
  medicationName?: string;
  genericName?: string;
  form?: string;
  dosageForm?: string;
  strength?: string;
  category?: string;
  stockQuantity?: number;
  reorderThreshold?: number;
  unitPrice?: number;
  batches?: MedicationBatch[];
}
