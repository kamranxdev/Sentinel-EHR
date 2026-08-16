import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/auth-user.model';
import { Patient, BreakGlassRecord, BreakGlassRequestDTO, MPIMatchCandidateDTO, MPIMergeRequestDTO } from '../models/patient.model';
import { Encounter, Allergy, Diagnosis, MedicalRecord, Vitals, Prescription, SafetyCheckResult } from '../models/clinical.model';
import { Appointment, AppointmentRequestDTO, AppointmentBilling, AppointmentCancellation, AppointmentLabOrder, AppointmentNote } from '../models/appointment.model';
import { LabOrder, LabOrderRequestDTO, LabResult } from '../models/lab.model';
import { Bed, BedRequestDTO, LocationHistory } from '../models/bed.model';
import { TriageEwsRecord, TriageEwsRequestDTO, TriageEwsResponseDTO, EmarRecord, EmarRecordRequestDTO, EmarRecordResponseDTO } from '../models/triage-emar.model';
import { EligibilityInquiryDTO, EligibilityResponseDTO, CopayCollectionDTO } from '../models/billing-eligibility.model';
import { AuditLog } from '../models/audit.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) {}

  // Generic HTTP helper methods
  get<T>(endpoint: string): Observable<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    return this.http.get<T>(url);
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    return this.http.post<T>(url, body);
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    return this.http.put<T>(url, body);
  }

  patch<T>(endpoint: string, body: any): Observable<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    return this.http.patch<T>(url, body);
  }

  delete<T>(endpoint: string): Observable<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    return this.http.delete<T>(url);
  }

  // Patients (Demographics & Identity)
  getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.baseUrl}/patients`);
  }

  searchPatients(query: string): Observable<Patient[]> {
    return this.http.get<Patient[]>(
      `${this.baseUrl}/patients?search=${encodeURIComponent(query)}`,
    );
  }

  getPatientById(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.baseUrl}/patients/${id}`);
  }

  getPatientClinicalHistory(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/patients/${id}/clinical-history`);
  }

  getMyPatientProfile(): Observable<Patient> {
    return this.http.get<Patient>(`${this.baseUrl}/patients/me`);
  }

  getPatientByUserId(userId: number): Observable<Patient> {
    const numId = Number(userId);
    if (!userId || isNaN(numId) || numId <= 0) {
      return this.getMyPatientProfile();
    }
    return this.http.get<Patient>(`${this.baseUrl}/patients/user/${numId}`);
  }

  createPatient(patient: Partial<Patient>): Observable<Patient> {
    return this.http.post<Patient>(`${this.baseUrl}/patients`, patient);
  }

  submitIntake(patient: Partial<Patient>): Observable<Patient> {
    return this.http.post<Patient>(`${this.baseUrl}/patients/intake`, patient);
  }

  updatePatient(id: number, patient: Partial<Patient>): Observable<Patient> {
    return this.http.put<Patient>(`${this.baseUrl}/patients/${id}`, patient);
  }

  // Master Patient Index (MPI) Search & Merge
  searchMPI(params: any): Observable<MPIMatchCandidateDTO[]> {
    let queryParams = new URLSearchParams();
    if (params.fullName) queryParams.set('fullName', params.fullName);
    if (params.dateOfBirth) queryParams.set('dateOfBirth', params.dateOfBirth);
    if (params.abhaId) queryParams.set('abhaId', params.abhaId);
    if (params.nationalId) queryParams.set('nationalId', params.nationalId);
    if (params.mrn) queryParams.set('mrn', params.mrn);
    if (params.phone) queryParams.set('phone', params.phone);
    if (params.email) queryParams.set('email', params.email);
    if (params.gender) queryParams.set('gender', params.gender);
    return this.http.get<MPIMatchCandidateDTO[]>(`${this.baseUrl}/patients/mpi/search?${queryParams.toString()}`);
  }

  scanDuplicateMPI(): Observable<MPIMatchCandidateDTO[]> {
    return this.http.get<MPIMatchCandidateDTO[]>(`${this.baseUrl}/patients/mpi/duplicates`);
  }

  requestMPIMerge(payload: MPIMergeRequestDTO): Observable<string> {
    return this.http.post(`${this.baseUrl}/patients/mpi/merge-requests`, payload, { responseType: 'text' });
  }

  // Real-Time Insurance Eligibility (ANSI X12 270/271 RTE)
  checkEligibility(inquiry: EligibilityInquiryDTO | any): Observable<EligibilityResponseDTO> {
    return this.http.post<EligibilityResponseDTO>(`${this.baseUrl}/insurance/verify-eligibility`, inquiry);
  }

  collectCopay(copayPayload: CopayCollectionDTO | any): Observable<CopayCollectionDTO> {
    return this.http.post<CopayCollectionDTO>(`${this.baseUrl}/insurance/collect-copay`, copayPayload);
  }

  // Appointment Stage Transitions & Resource Grid
  updateAppointmentStage(id: number, stage: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.baseUrl}/appointments/${id}/stage`, { stage });
  }

  getMultiResourceGrid(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/appointments/resources`);
  }

  // Encounters & Visits
  getEncountersByPatient(patientId: number): Observable<Encounter[]> {
    return this.http.get<Encounter[]>(`${this.baseUrl}/encounters/patient/${patientId}`);
  }

  createEncounter(encounter: Partial<Encounter>): Observable<Encounter> {
    return this.http.post<Encounter>(`${this.baseUrl}/encounters`, encounter);
  }

  updateEncounter(id: number, encounter: Partial<Encounter>): Observable<Encounter> {
    return this.http.put<Encounter>(`${this.baseUrl}/encounters/${id}`, encounter);
  }

  // Bed & Spatial Ward Management
  getBeds(department?: string): Observable<Bed[]> {
    const query = department ? `?department=${encodeURIComponent(department)}` : '';
    return this.http.get<Bed[]>(`${this.baseUrl}/beds${query}`);
  }

  getAvailableBeds(department?: string): Observable<Bed[]> {
    const query = department ? `?department=${encodeURIComponent(department)}` : '';
    return this.http.get<Bed[]>(`${this.baseUrl}/beds/available${query}`);
  }

  getBedById(id: number): Observable<Bed> {
    return this.http.get<Bed>(`${this.baseUrl}/beds/${id}`);
  }

  createBed(bed: BedRequestDTO): Observable<Bed> {
    return this.http.post<Bed>(`${this.baseUrl}/beds`, bed);
  }

  updateBedStatus(id: number, status: string): Observable<Bed> {
    return this.http.patch<Bed>(`${this.baseUrl}/beds/${id}/status`, { status });
  }

  transferBed(payload: { encounterId: number; newBedId: number; transferReason?: string }): Observable<LocationHistory> {
    return this.http.post<LocationHistory>(`${this.baseUrl}/beds/transfer`, payload);
  }

  getLocationHistory(encounterId: number): Observable<LocationHistory[]> {
    return this.http.get<LocationHistory[]>(`${this.baseUrl}/beds/encounters/${encounterId}/location-history`);
  }

  // Emergency Access Break-Glass System
  requestBreakGlass(payload: BreakGlassRequestDTO): Observable<BreakGlassRecord> {
    return this.http.post<BreakGlassRecord>(`${this.baseUrl}/break-glass/request`, payload);
  }

  getBreakGlassByPatient(patientId: number): Observable<BreakGlassRecord[]> {
    return this.http.get<BreakGlassRecord[]>(`${this.baseUrl}/break-glass/patient/${patientId}`);
  }

  getBreakGlassByUser(username: string): Observable<BreakGlassRecord[]> {
    return this.http.get<BreakGlassRecord[]>(`${this.baseUrl}/break-glass/user/${username}`);
  }

  // Laboratory Orders & Results Tracking
  getLabOrdersList(patientId?: number, encounterId?: number): Observable<LabOrder[]> {
    const params: string[] = [];
    if (patientId) params.push(`patientId=${patientId}`);
    if (encounterId) params.push(`encounterId=${encounterId}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return this.http.get<LabOrder[]>(`${this.baseUrl}/lab-orders${query}`);
  }

  getLabOrderById(id: number): Observable<LabOrder> {
    return this.http.get<LabOrder>(`${this.baseUrl}/lab-orders/${id}`);
  }

  createLabOrder(order: LabOrderRequestDTO): Observable<LabOrder> {
    return this.http.post<LabOrder>(`${this.baseUrl}/lab-orders`, order);
  }

  updateLabOrderStatus(id: number, status: string, barcode?: string): Observable<LabOrder> {
    return this.http.patch<LabOrder>(`${this.baseUrl}/lab-orders/${id}/status`, { status, barcode });
  }

  addLabResult(id: number, result: any): Observable<LabResult> {
    return this.http.post<LabResult>(`${this.baseUrl}/lab-orders/${id}/results`, result);
  }

  // Allergies & Contraindications
  getAllergiesByPatient(patientId: number): Observable<Allergy[]> {
    return this.http.get<Allergy[]>(`${this.baseUrl}/allergies/patient/${patientId}`);
  }

  createAllergy(allergy: Partial<Allergy>): Observable<Allergy> {
    return this.http.post<Allergy>(`${this.baseUrl}/allergies`, allergy);
  }

  updateAllergyStatus(id: number, status: string): Observable<Allergy> {
    return this.http.patch<Allergy>(`${this.baseUrl}/allergies/${id}/status`, { status });
  }

  // Diagnoses & Problem Lists
  getDiagnosesByPatient(patientId: number): Observable<Diagnosis[]> {
    return this.http.get<Diagnosis[]>(`${this.baseUrl}/diagnoses/patient/${patientId}`);
  }

  createDiagnosis(diagnosis: Partial<Diagnosis>): Observable<Diagnosis> {
    return this.http.post<Diagnosis>(`${this.baseUrl}/diagnoses`, diagnosis);
  }

  updateDiagnosisStatus(id: number, status: string): Observable<Diagnosis> {
    return this.http.patch<Diagnosis>(`${this.baseUrl}/diagnoses/${id}/status`, { status });
  }

  // Medical Records (EHR Legacy Notes)
  getRecordsByPatient(patientId: number): Observable<MedicalRecord[]> {
    return this.http.get<MedicalRecord[]>(`${this.baseUrl}/clinical-records/patient/${patientId}`);
  }

  createRecord(record: Partial<MedicalRecord>): Observable<MedicalRecord> {
    return this.http.post<MedicalRecord>(`${this.baseUrl}/clinical-records`, record);
  }

  // Vitals & Observations
  getVitalsByPatient(patientId: number): Observable<Vitals[]> {
    return this.http.get<Vitals[]>(`${this.baseUrl}/vitals/patient/${patientId}`);
  }

  recordVitals(vitals: Partial<Vitals>): Observable<Vitals> {
    return this.http.post<Vitals>(`${this.baseUrl}/vitals`, vitals);
  }

  // Prescriptions & Smart Safety Engine
  getPrescriptionsByPatient(patientId: number): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(`${this.baseUrl}/prescriptions/patient/${patientId}`);
  }

  checkPrescriptionSafety(
    patientId: number,
    medicationName: string,
  ): Observable<SafetyCheckResult> {
    return this.http.post<SafetyCheckResult>(`${this.baseUrl}/prescriptions/safety-check`, {
      patientId,
      medicationName,
    });
  }

  validatePrescriptionSafety(
    patientId: number,
    medicationName: string,
    dosage?: string,
    instructions?: string,
  ): Observable<SafetyCheckResult> {
    return this.http.post<SafetyCheckResult>(`${this.baseUrl}/prescriptions/safety-check`, {
      patientId,
      medicationName,
      dosage,
      instructions,
    });
  }

  createPrescription(
    prescription: Partial<Prescription>,
    overrideWarning = false,
  ): Observable<Prescription> {
    return this.http.post<Prescription>(`${this.baseUrl}/prescriptions`, {
      ...prescription,
      overrideWarning,
    });
  }

  updatePrescriptionStatus(id: number, status: string): Observable<Prescription> {
    return this.http.patch<Prescription>(`${this.baseUrl}/prescriptions/${id}/status`, { status });
  }

  // Appointments & Collaborative Workflow
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments`);
  }

  getAppointmentById(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.baseUrl}/appointments/${id}`);
  }

  getAppointmentsByPatient(patientId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments/patient/${patientId}`);
  }

  getRecommendedDoctors(patientId?: number, reason?: string, date?: string): Observable<any[]> {
    let query = '';
    const params: string[] = [];
    if (patientId) params.push(`patientId=${patientId}`);
    if (reason) params.push(`reason=${encodeURIComponent(reason)}`);
    if (date) params.push(`date=${encodeURIComponent(date)}`);
    if (params.length > 0) query = '?' + params.join('&');
    return this.http.get<any[]>(`${this.baseUrl}/appointments/recommended-doctors${query}`);
  }

  scheduleAppointment(appointment: AppointmentRequestDTO | Partial<Appointment>): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.baseUrl}/appointments`, appointment);
  }

  updateAppointmentStatus(id: number, status: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.baseUrl}/appointments/${id}/status`, { status });
  }

  checkInPatient(
    id: number,
    payload: {
      insuranceVerified?: boolean;
      insuranceDetails?: string;
      reportsUploaded?: string;
      note?: string;
    },
  ): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.baseUrl}/appointments/${id}/check-in`, payload);
  }

  recordTriageVitals(id: number, payload: any): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.baseUrl}/appointments/${id}/triage-vitals`, payload);
  }

  startConsultation(id: number): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.baseUrl}/appointments/${id}/start-consultation`, {});
  }

  recordDoctorConsultation(id: number, payload: any): Observable<Appointment> {
    return this.http.post<Appointment>(
      `${this.baseUrl}/appointments/${id}/doctor-consultation`,
      payload,
    );
  }

  getAppointmentNotes(id: number): Observable<AppointmentNote[]> {
    return this.http.get<AppointmentNote[]>(`${this.baseUrl}/appointments/${id}/notes`);
  }

  addAppointmentNote(id: number, noteType: string, content: string): Observable<AppointmentNote> {
    return this.http.post<AppointmentNote>(`${this.baseUrl}/appointments/${id}/notes`, {
      noteType,
      content,
    });
  }

  editAppointmentNote(noteId: number, content: string): Observable<AppointmentNote> {
    return this.http.patch<AppointmentNote>(`${this.baseUrl}/appointments/notes/${noteId}`, {
      content,
    });
  }

  cancelAppointment(
    id: number,
    reason: string,
    comment?: string,
  ): Observable<AppointmentCancellation> {
    return this.http.post<AppointmentCancellation>(`${this.baseUrl}/appointments/${id}/cancel`, {
      reason,
      comment,
    });
  }

  getCancellationDetails(id: number): Observable<AppointmentCancellation> {
    return this.http.get<AppointmentCancellation>(
      `${this.baseUrl}/appointments/${id}/cancellation`,
    );
  }

  generateBilling(id: number, payload: any): Observable<AppointmentBilling> {
    return this.http.post<AppointmentBilling>(
      `${this.baseUrl}/appointments/${id}/billing`,
      payload,
    );
  }

  getBillingDetails(id: number): Observable<AppointmentBilling> {
    return this.http.get<AppointmentBilling>(`${this.baseUrl}/appointments/${id}/billing`);
  }

  getLabOrders(id: number): Observable<AppointmentLabOrder[]> {
    return this.http.get<AppointmentLabOrder[]>(`${this.baseUrl}/appointments/${id}/lab-orders`);
  }

  getDoctors(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users/doctors`);
  }

  // Compliance Audit Ledger & User RBAC Management
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/admin/users`);
  }

  updateUser(id: number, payload: any): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/admin/users/${id}`, payload);
  }

  updateUserStatus(id: number, status: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/admin/users/${id}/status`, { status });
  }

  resetUserPassword(id: number, newPassword?: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/admin/users/${id}/reset-password`, { newPassword });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/admin/users/${id}`);
  }

  getAuditLogs(search?: string): Observable<AuditLog[]> {
    const url = search
      ? `${this.baseUrl}/admin/audit-logs?search=${encodeURIComponent(search)}`
      : `${this.baseUrl}/admin/audit-logs`;
    return this.http.get<AuditLog[]>(url);
  }

  // HL7 FHIR R4 Interoperability Subsystem
  private fhirUrl = 'http://localhost:8080/fhir';

  getFhirMetadata(): Observable<any> {
    return this.http.get<any>(`${this.fhirUrl}/metadata`);
  }

  getFhirPatients(name?: string, gender?: string, identifier?: string): Observable<any> {
    let query = '';
    const params: string[] = [];
    if (name) params.push(`name=${encodeURIComponent(name)}`);
    if (gender) params.push(`gender=${encodeURIComponent(gender)}`);
    if (identifier) params.push(`identifier=${encodeURIComponent(identifier)}`);
    if (params.length > 0) query = '?' + params.join('&');
    return this.http.get<any>(`${this.fhirUrl}/Patient${query}`);
  }

  getFhirResource(resourceType: string, patientId?: number): Observable<any> {
    const query = patientId ? `?patientId=${patientId}` : '';
    return this.http.get<any>(`${this.fhirUrl}/${resourceType}${query}`);
  }

  getFhirResourceById(resourceType: string, id: string): Observable<any> {
    return this.http.get<any>(`${this.fhirUrl}/${resourceType}/${id}`);
  }

  getFhirPatientEverything(patientId: number): Observable<any> {
    return this.http.get<any>(`${this.fhirUrl}/Patient/${patientId}/$everything`);
  }

  createFhirPatient(payload: any): Observable<any> {
    return this.http.post<any>(`${this.fhirUrl}/Patient`, payload);
  }

  // --- Nursing Workspace API ---
  submitTriage(record: TriageEwsRequestDTO | any): Observable<TriageEwsResponseDTO> {
    return this.http.post<TriageEwsResponseDTO>(`${this.baseUrl}/nursing/triage`, record);
  }

  getTriageRecordsForPatient(patientId: number): Observable<TriageEwsResponseDTO[]> {
    return this.http.get<TriageEwsResponseDTO[]>(`${this.baseUrl}/nursing/triage/patient/${patientId}`);
  }

  recordEmarAdministration(emar: EmarRecordRequestDTO | any): Observable<EmarRecordResponseDTO> {
    return this.http.post<EmarRecordResponseDTO>(`${this.baseUrl}/nursing/emar/administer`, emar);
  }

  getEmarHistoryForPatient(patientId: number): Observable<EmarRecordResponseDTO[]> {
    return this.http.get<EmarRecordResponseDTO[]>(`${this.baseUrl}/nursing/emar/patient/${patientId}`);
  }
}

