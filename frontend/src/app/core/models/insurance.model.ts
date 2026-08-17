export interface InsurancePayer {
  id: number | string;
  payerCode: string;
  payerName: string;
  payerType: 'COMMERCIAL' | 'GOVERNMENT' | 'MEDICARE' | 'MEDICAID' | 'PM_JAY' | 'TPA';
  electronicPayerId?: string;
  contactPhone?: string;
  contactEmail?: string;
  addressLine?: string;
  plans?: InsurancePlan[];
}

export interface InsurancePlan {
  id: number | string;
  payerId: number | string;
  planCode: string;
  planName: string;
  planType: 'HMO' | 'PPO' | 'EPO' | 'POS' | 'GOVERNMENT_SCHEME';
  copayAmount?: number;
  deductibleAmount?: number;
  coinsurancePercentage?: number;
}

export interface PatientInsurancePolicy {
  id: number | string;
  patientId: string;
  payerId: number | string;
  planId?: number | string;
  payerName?: string;
  policyNumber: string;
  memberId: string;
  groupNumber?: string;
  policyHolderName?: string;
  policyHolderRelationship?: string;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'PENDING_VERIFICATION';
  coverageType?: string;
  isPrimary?: boolean;
}

export interface InsuranceAuthorization {
  id: number | string;
  encounterId: string;
  patientInsuranceId?: number | string;
  authorizationNumber: string;
  requestedService: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED' | 'CANCELLED';
  approvedUnits?: number;
  validFrom?: string;
  validTo?: string;
  notes?: string;
  denialReason?: string;
  requestedAt?: string;
  decidedAt?: string;
}

export interface InsuranceClaim {
  id: number | string;
  encounterId: string;
  claimNumber: string;
  payerId: number | string;
  payerName?: string;
  patientName?: string;
  patientCode?: string;
  totalBilledAmount: number;
  allowedAmount?: number;
  patientPaidAmount?: number;
  insurancePaidAmount?: number;
  status: 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'ADJUDICATED' | 'DENIED' | 'PAID';
  submittedAt?: string;
  adjudicatedAt?: string;
  denialReason?: string;
  items?: ClaimItem[];
}

export interface ClaimItem {
  id: number | string;
  claimId: number | string;
  procedureCode: string;
  description: string;
  billedAmount: number;
  allowedAmount?: number;
  copayAmount?: number;
  adjudicationStatus?: string;
}

export interface CreateInsuranceClaimRequest {
  payerId: number | string;
  totalBilledAmount: number;
  items?: Partial<ClaimItem>[];
}

export interface CreateInsuranceAuthorizationRequest {
  patientInsuranceId?: number | string;
  requestedService: string;
  validFrom?: string;
  validTo?: string;
  notes?: string;
}
