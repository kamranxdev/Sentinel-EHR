import { User } from './auth-user.model';
import { Patient } from './patient.model';
import { Vitals } from './clinical.model';

export interface PractitionerOrgInfo {
  id: string;
  name: string;
  code: string;
  employmentType?: string;
}

export interface PractitionerSpecialtyInfo {
  id?: string;
  specialtyCode?: string;
  specialtyName?: string;
  isPrimary?: boolean;
}

export interface PractitionerDTO {
  id: string;
  personId?: string;
  userId?: string;
  email?: string;
  identifier?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  fullName?: string;
  gender?: string;
  practitionerType?: string;
  primarySpecialty?: string;
  status?: string;
  specialties?: PractitionerSpecialtyInfo[];
  organizations?: PractitionerOrgInfo[];
  createdAt?: string;
  updatedAt?: string;
}

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
  organizationId?: string;
  departmentId?: string;
  departmentName?: string;
  practitionerId?: string;
  doctorId?: string;
  doctorName?: string;
  doctorSpecialization?: string;
  doctor?: User;
  appointmentDate?: string;
  startsAt?: string;
  endsAt?: string;
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
  checkedInAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  vitals?: Vitals;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentRequestDTO {
  patientId: string;
  practitionerId?: string;
  doctorId?: string;
  appointmentDate?: string;
  startsAt?: string;
  endsAt?: string;
  organizationId?: string;
  departmentId?: string;
  appointmentType?: string;
  status?: string;
  stage?: string;
  reason?: string;
  priority?: string;
  notes?: string;
}

export interface AppointmentCheckInRequestDTO {
  notes?: string;
  insuranceVerified?: boolean;
  insuranceDetails?: string;
}

export interface AppointmentTriageRequestDTO {
  systolicBp?: number;
  diastolicBp?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  notes?: string;
}

export interface AppointmentConsultRequestDTO {
  diagnosis?: string;
  icdCode?: string;
  treatmentNotes?: string;
}

export interface AppointmentCancelRequestDTO {
  cancellationReason: string;
  additionalComment?: string;
}

export interface AppointmentRescheduleRequestDTO {
  newStartsAt: string;
  newEndsAt?: string;
  reason?: string;
}

export interface ScheduleSlot {
  id: string;
  organizationId?: string;
  practitionerId: string;
  startTime: string;
  endTime: string;
  slotStatus: 'AVAILABLE' | 'BOOKED' | 'BLOCKED' | string;
  capacity?: number;
}

export interface AppointmentNote {
  id?: string;
  appointmentId?: string;
  authorId?: string;
  authorName: string;
  authorRole: string;
  noteType:
    'RECEPTIONIST_ADMIN' | 'NURSE_OBSERVATION' | 'DOCTOR_CLINICAL' | 'PATIENT_REMARK' | string;
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
