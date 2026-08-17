export interface ClinicalDocument {
  id: number | string;
  encounterId?: string;
  patientId: string;
  documentType: 'PROGRESS_NOTE' | 'DISCHARGE_SUMMARY' | 'CONSULT_NOTE' | 'OPERATIVE_REPORT' | 'EMERGENCY_SUMMARY' | 'HISTORY_PHYSICAL';
  title: string;
  content: string;
  status: 'DRAFT' | 'PRELIMINARY' | 'FINAL' | 'AMENDED';
  authorUsername: string;
  authorFullName?: string;
  signedAt?: string;
  versionNumber?: number;
  createdAt?: string;
  updatedAt?: string;
  versions?: DocumentVersion[];
}

export interface DocumentVersion {
  id: number | string;
  documentId: number | string;
  versionNumber: number;
  content: string;
  changeSummary?: string;
  createdByUser: string;
  createdAt: string;
}

export interface DocumentLink {
  id: number | string;
  documentId: number | string;
  linkedEntityType: 'ENCOUNTER' | 'ORDER' | 'CLAIM' | 'PATIENT';
  linkedEntityId: string;
}

export interface CreateClinicalDocumentRequest {
  documentType: string;
  title: string;
  content: string;
  authorUsername?: string;
}
