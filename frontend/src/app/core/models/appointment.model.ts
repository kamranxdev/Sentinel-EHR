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
  id?: string;
  patientId?: string;
  patientName?: string;
  patientCode?: string;
  patient?: Patient;
  doctorId?: string;
  doctorName?: string;
  doctorSpecialization?: string;
  doctor?: User;
  appointmentDate: string;
  startTime?: string;
  endTime?: string;
  appointmentType?: string;
  status: string;
  stage?: string;
  reason?: string;
  priority?: string;
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
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentType?: string;
  status?: string;
  stage?: string;
  reason?: string;
  priority?: string;
  notes?: string;
}

export interface AppointmentNote {
  id?: string;
  appointmentId?: string;
  authorId?: string;
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
  id?: string;
  appointment?: Appointment;
  appointmentId?: string;
  cancelledByUser?: User;
  cancelledByRole: 'PATIENT' | 'DOCTOR' | 'RECEPTIONIST' | 'ADMIN' | string;
  cancellationReason: string;
  additionalComment?: string;
  cancelledAt?: string;
  refundStatus?: string;
}

export interface AppointmentLabOrder {
  id?: string;
  appointmentId?: string;
  testName: string;
  priority: 'ROUTINE' | 'URGENT' | 'STAT' | string;
  clinicalIndications?: string;
  orderedBy?: User;
  orderedAt?: string;
}

export interface AppointmentBilling {
  id?: string;
  appointmentId?: string;
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
