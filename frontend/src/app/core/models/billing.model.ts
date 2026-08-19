import { Patient } from './patient.model';

export interface BillingAccount {
  id: string;
  patientId: string;
  patient?: Patient;
  accountNumber: string;
  accountType: 'INDIVIDUAL' | 'INSURANCE' | 'CORPORATE' | string;
  coverageType?: string;
  balance: number;
  totalCharges: number;
  totalPayments: number;
  totalAdjustments: number;
  status: 'ACTIVE' | 'DELINQUENT' | 'CLOSED' | string;
  createdAt: string;
  updatedAt?: string;
}

export interface ChargeItem {
  id: string;
  encounterId?: string;
  billingAccountId?: string;
  patientId: string;
  patientName?: string;
  chargeCode: string;
  description: string;
  category: 'CONSULTATION' | 'LAB' | 'IMAGING' | 'PROCEDURE' | 'MEDICATION' | 'ROOM' | string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'BILLABLE' | 'INVOICED' | 'PAID' | 'WAIVED' | string;
  serviceDate: string;
  providerName?: string;
}

export interface InvoiceItem {
  id?: string;
  chargeItemId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxAmount?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  billingAccountId: string;
  patientId: string;
  patientName?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  status: 'DRAFT' | 'FINALIZED' | 'PARTIALLY_PAID' | 'PAID' | 'VOID' | string;
  issuedDate: string;
  dueDate: string;
  paidDate?: string;
  notes?: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  billingAccountId: string;
  invoiceId?: string;
  patientId: string;
  amount: number;
  paymentMethod: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'INSURANCE_CHECK' | 'ONLINE_TRANSFER' | string;
  referenceNumber?: string;
  status: 'PROCESSED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | string;
  processedAt: string;
  notes?: string;
}

export interface PaymentAllocation {
  id: string;
  paymentId: string;
  invoiceId: string;
  amountAllocated: number;
}

export interface RefundRequestDTO {
  paymentId: string;
  amount: number;
  reason: string;
  approvedBy?: string;
}
