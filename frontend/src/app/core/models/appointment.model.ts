import { User } from './auth-user.model';
import { Patient } from './patient.model';
import { Vitals } from './clinical.model';

export interface DoctorRecommendationDTO {
  doctor: User;
  matchScore: number;
  specialtyFitScore?: number;
  continuityScore?: number;
  workloadScore?: number;
  urgencyScore?: number;
  triageRiskLevel?: 'ROUTINE' | 'URGENT' | 'EMERGENT' | string;
  triageSummary?: string;
  recommendedSpecialty: string;
  matchReason: string;
  verifiedLicense: boolean;
  reasoningBreakdown?: string[];
  recommendedSlots?: string[];
}

export interface Appointment {
  id?: number;
  patientId?: number;
  patientName?: string;
  patientCode?: string;
  patient?: Patient;
  doctorId?: number;
  doctorName?: string;
  doctorSpecialization?: string;
  doctor?: User;
  appointmentDate: string;
  status: string;
  stage?: string;
  reason?: string;
  notes?: string;
  insuranceVerified?: boolean;
  insuranceDetails?: string;
  reportsUploaded?: string;
  followUpDate?: string;
  arrivedAt?: string;
  vitals?: Vitals;
  createdAt?: string;
}

export interface AppointmentRequestDTO {
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  status?: string;
  stage?: string;
  reason?: string;
  notes?: string;
}

export interface AppointmentNote {
  id?: number;
  appointmentId?: number;
  authorId?: number;
  authorName: string;
  authorRole: string;
  noteType:
    | 'RECEPTIONIST_ADMIN'
    | 'NURSE_OBSERVATION'
    | 'DOCTOR_CLINICAL'
    | 'PATIENT_REMARK'
    | string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
  edited?: boolean;
  editHistoryJson?: string;
}

export interface AppointmentCancellation {
  id?: number;
  appointment?: Appointment;
  appointmentId?: number;
  cancelledByUser?: User;
  cancelledByRole: 'PATIENT' | 'DOCTOR' | 'RECEPTIONIST' | 'ADMIN' | string;
  cancellationReason: string;
  additionalComment?: string;
  cancelledAt?: string;
  refundStatus?: string;
}

export interface AppointmentLabOrder {
  id?: number;
  appointmentId?: number;
  testName: string;
  priority: 'ROUTINE' | 'URGENT' | 'STAT' | string;
  clinicalIndications?: string;
  orderedBy?: User;
  orderedAt?: string;
}

export interface AppointmentBilling {
  id?: number;
  appointmentId?: number;
  consultationFee: number;
  triageFee: number;
  labFee: number;
  pharmacyFee: number;
  insuranceCoverage: number;
  netPayable: number;
  paymentStatus: string;
  generatedAt?: string;
}

export interface AppointmentStatusUpdateDTO {
  status: string;
}

export interface AppointmentStageUpdateDTO {
  stage: string;
}
