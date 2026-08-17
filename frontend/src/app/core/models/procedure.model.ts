export interface ProcedureOrder {
  id: number | string;
  patientId: string;
  encounterId?: string;
  procedureCode: string; // CPT or SNOMED
  procedureName: string;
  bodySite?: string;
  status: 'ORDERED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority?: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  indication?: string;
  notes?: string;
  orderingProviderUsername?: string;
  orderedAt?: string;
  scheduledAt?: string;
  performances?: ProcedurePerformance[];
}

export interface ProcedurePerformance {
  id: number | string;
  procedureOrderId: number | string;
  performedByUsername: string;
  performedAt: string;
  outcome: 'SUCCESSFUL' | 'PARTIALLY_SUCCESSFUL' | 'COMPLICATIONS' | 'ABORTED';
  complications?: string;
  anesthesiaType?: string;
  notes?: ProcedureNote[];
  participants?: ProcedureParticipant[];
}

export interface ProcedureParticipant {
  id: number | string;
  procedurePerformanceId: number | string;
  practitionerId?: string;
  username: string;
  role: 'PRIMARY_SURGEON' | 'ASSISTING_SURGEON' | 'ANESTHESIOLOGIST' | 'SCRUB_NURSE' | 'CIRCULATING_NURSE';
}

export interface ProcedureNote {
  id: number | string;
  procedurePerformanceId: number | string;
  noteType: 'PRE_OP' | 'OPERATIVE_NOTE' | 'POST_OP' | 'ANESTHESIA_NOTE' | 'DISCHARGE';
  content: string;
  authorUsername: string;
  createdAt?: string;
}

export interface CreateProcedureOrderRequest {
  procedureCode: string;
  procedureName: string;
  bodySite?: string;
  priority?: string;
  indication?: string;
  notes?: string;
  scheduledAt?: string;
}

export interface PerformProcedureRequest {
  outcome: string;
  complications?: string;
  anesthesiaType?: string;
  performedAt?: string;
  operativeNotes?: string;
}
