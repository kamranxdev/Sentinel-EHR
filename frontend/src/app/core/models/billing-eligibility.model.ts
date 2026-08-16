export interface EligibilityInquiryDTO {
  patientId?: string;
  payerName?: string;
  subscriberId?: string;
  groupNumber?: string;
  serviceType?: string;
}

export interface EligibilityResponseDTO {
  eligible: boolean;
  payerName: string;
  subscriberId: string;
  transactionControlNumber: string;
  copayAmount?: number;
  coverageAlerts?: string[];
  responseRaw?: string;
}

export interface CopayCollectionDTO {
  id?: string;
  appointmentId?: string;
  patientId?: string;
  amountCollected: number;
  paymentMethod: string;
  receiptNumber?: string;
  collectedBy?: string;
  collectionTimestamp?: string;
  notes?: string;
}
