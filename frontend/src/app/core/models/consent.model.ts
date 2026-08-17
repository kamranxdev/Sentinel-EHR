export interface ConsentType {
  id: number | string;
  code: string;
  name: string;
  category: 'TREATMENT' | 'PROCEDURE' | 'RESEARCH' | 'DATA_SHARING' | 'ABDM_HEALTH_DATA';
  description?: string;
  templateText: string;
  version?: string;
  isActive?: boolean;
}

export interface PatientConsent {
  id: number | string;
  patientId: string;
  consentTypeId: number | string;
  consentTypeCode?: string;
  consentTypeName?: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED' | 'REJECTED';
  validFrom: string;
  validTo?: string;
  signedByPatientName?: string;
  patientSignature?: string;
  witnessName?: string;
  revocationReason?: string;
  revokedAt?: string;
  createdAt?: string;
}

export interface CreatePatientConsentRequest {
  consentTypeId: number | string;
  validFrom?: string;
  validTo?: string;
  signedByPatientName?: string;
  patientSignature?: string;
  witnessName?: string;
}

export interface RevokeConsentRequest {
  revocationReason: string;
}
