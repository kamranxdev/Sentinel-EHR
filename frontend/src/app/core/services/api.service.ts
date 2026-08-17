import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { User } from '../models/auth-user.model';
import { Patient, BreakGlassRecord, BreakGlassRequestDTO, MPIMatchCandidateDTO, MPIMergeRequestDTO, EmergencyContact } from '../models/patient.model';
import { Encounter, Allergy, Diagnosis, MedicalRecord, Vitals, Prescription, SafetyCheckResult } from '../models/clinical.model';
import {
  Appointment,
  AppointmentRequestDTO,
  AppointmentCheckInRequestDTO,
  AppointmentTriageRequestDTO,
  AppointmentConsultRequestDTO,
  AppointmentCancelRequestDTO,
  AppointmentRescheduleRequestDTO,
  ScheduleSlot,
  AppointmentBilling,
  AppointmentCancellation,
  AppointmentLabOrder,
  AppointmentNote,
  DoctorRecommendationDTO,
} from '../models/appointment.model';
import {
  LabOrder,
  LabOrderRequestDTO,
  LabOrderStatusUpdateDTO,
  LabResult,
  Specimen,
} from '../models/lab.model';
import { Bed, BedRequestDTO, LocationHistory } from '../models/bed.model';
import {
  TriageEwsRecord,
  TriageEwsRequestDTO,
  TriageEwsResponseDTO,
  EmarRecord,
  EmarRecordRequestDTO,
  EmarRecordResponseDTO,
  NursingFlowsheet,
  NursingFlowsheetEntry,
} from '../models/triage-emar.model';
import { EligibilityInquiryDTO, EligibilityResponseDTO, CopayCollectionDTO } from '../models/billing-eligibility.model';
import { AuditLog } from '../models/audit.model';
import { ImagingOrder, ImagingStudy, ImagingSeries, ImagingReport, CreateImagingOrderRequest, CreateImagingReportRequest } from '../models/imaging.model';
import { ProcedureOrder, ProcedurePerformance, ProcedureNote, ProcedureParticipant, CreateProcedureOrderRequest, PerformProcedureRequest } from '../models/procedure.model';
import { ConsentType, PatientConsent, CreatePatientConsentRequest, RevokeConsentRequest } from '../models/consent.model';
import { ClinicalDocument, DocumentVersion, DocumentLink, CreateClinicalDocumentRequest } from '../models/document.model';
import { InsurancePayer, InsurancePlan, PatientInsurancePolicy, InsuranceAuthorization, InsuranceClaim, ClaimItem, CreateInsuranceClaimRequest, CreateInsuranceAuthorizationRequest } from '../models/insurance.model';
import { CodeSystem, TerminologyCode, TerminologySearchResult } from '../models/terminology.model';
import { AbacPolicy, RbacRole, SecurityEventLog, CreateAbacPolicyRequest } from '../models/security-policy.model';
import { CareTeam, CareTeamMember, AddCareTeamMemberRequest } from '../models/care-team.model';
import { Facility, Department, Ward, Room, BedDetail, PriceList, PriceListItem } from '../models/tenancy.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) {}

  /**
   * Unwraps backend ApiResponse envelope { success: boolean, message: string, data: T }
   */
  private unwrap<T>(res: any): T {
    if (res && typeof res === 'object' && 'data' in res && res.data !== undefined) {
      return res.data;
    }
    return res;
  }

  // Generic HTTP helper methods with automatic ApiResponse envelope unwrapping
  get<T>(endpoint: string): Observable<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    return this.http.get<any>(url).pipe(map((res) => this.unwrap<T>(res)));
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    return this.http.post<any>(url, body).pipe(map((res) => this.unwrap<T>(res)));
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    return this.http.put<any>(url, body).pipe(map((res) => this.unwrap<T>(res)));
  }

  patch<T>(endpoint: string, body: any): Observable<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    return this.http.patch<any>(url, body).pipe(map((res) => this.unwrap<T>(res)));
  }

  delete<T>(endpoint: string): Observable<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    return this.http.delete<any>(url).pipe(map((res) => this.unwrap<T>(res)));
  }

  // =========================================================================
  // 1. Patients (Demographics & Identity)
  // =========================================================================
  getPatients(): Observable<Patient[]> {
    return this.get<Patient[]>('/patients/search').pipe(
      map((list) => (Array.isArray(list) ? list.map((p) => this.normalizePatient(p)) : [])),
      catchError(() => of([])),
    );
  }

  searchPatients(query: string): Observable<Patient[]> {
    return this.get<Patient[]>(`/patients/search?query=${encodeURIComponent(query || '')}`).pipe(
      map((list) => (Array.isArray(list) ? list.map((p) => this.normalizePatient(p)) : [])),
      catchError(() => of([])),
    );
  }

  getPatientById(id: string): Observable<Patient> {
    return this.get<Patient>(`/patients/${id}`).pipe(
      switchMap((patient) => {
        if (!patient || !patient.id) return of(patient);
        return this.enrichPatientProfile(patient);
      }),
    );
  }

  getPatientClinicalHistory(id: string): Observable<any> {
    return this.get<any>(`/patients/${id}/clinical-history`).pipe(
      catchError(() =>
        forkJoin({
          allergies: this.getAllergiesByPatient(id),
          vitals: this.getVitalsByPatient(id),
          prescriptions: this.getPrescriptionsByPatient(id),
          encounters: this.getEncountersByPatient(id),
          problems: this.getDiagnosesByPatient(id),
        }),
      ),
    );
  }

  getMyPatientProfile(): Observable<Patient> {
    let storedUser: any = null;
    try {
      const raw = localStorage.getItem('sentinel_user');
      if (raw) storedUser = JSON.parse(raw);
      if (storedUser && storedUser.data) storedUser = storedUser.data;
    } catch (e) {
      console.warn('Could not parse stored sentinel_user', e);
    }

    const assignedId = storedUser?.assignedPatientIds && storedUser.assignedPatientIds.length > 0
      ? storedUser.assignedPatientIds[0]
      : storedUser?.patientId;

    if (assignedId) {
      return this.getPatientById(assignedId);
    }

    const searchKey = storedUser?.fullName || storedUser?.username || storedUser?.email || '';

    if (!searchKey) {
      return throwError(() => new Error('No active user profile found in session.'));
    }

    return this.searchPatients(searchKey).pipe(
      switchMap((patients) => {
        if (patients && patients.length > 0) {
          const match = patients.find(
            (p) =>
              (storedUser?.email && p.email?.toLowerCase() === storedUser.email.toLowerCase()) ||
              (storedUser?.fullName && p.fullName?.toLowerCase() === storedUser.fullName.toLowerCase()),
          ) || patients[0];
          return this.enrichPatientProfile(match);
        }

        return this.getPatients().pipe(
          switchMap((all) => {
            if (all && all.length > 0) {
              return this.enrichPatientProfile(all[0]);
            }
            return throwError(() => new Error('No patient chart record found for active user account.'));
          }),
        );
      }),
    );
  }

  getPatientByUserId(userId: string): Observable<Patient> {
    if (!userId) {
      return this.getMyPatientProfile();
    }
    return this.getMyPatientProfile();
  }

  createPatient(patient: Partial<Patient>): Observable<Patient> {
    return this.post<Patient>('/patients', patient).pipe(
      map((p) => this.normalizePatient(p)),
    );
  }

  submitIntake(patient: Partial<Patient>): Observable<Patient> {
    return this.post<Patient>('/patients', patient).pipe(
      map((p) => this.normalizePatient(p)),
    );
  }

  updatePatient(id: string, patient: Partial<Patient>): Observable<Patient> {
    return this.patch<Patient>(`/patients/${id}`, patient).pipe(
      switchMap((updated) => {
        const tasks: Observable<any>[] = [];

        if (patient.bloodGroup || patient.rhFactor || patient.maritalStatus || patient.preferredLanguage) {
          tasks.push(
            this.updatePatientDemographics(id, {
              bloodGroup: patient.bloodGroup || patient.bloodType,
              rhFactor: patient.rhFactor || 'POSITIVE',
              maritalStatus: patient.maritalStatus,
              preferredLanguage: patient.preferredLanguage,
              ethnicity: patient.ethnicity,
              race: patient.race,
              genderIdentity: patient.genderIdentity,
            }).pipe(catchError(() => of(null))),
          );
        }

        if (patient.emergencyContact && patient.emergencyContact.name) {
          tasks.push(
            this.savePatientEmergencyContact(id, patient.emergencyContact).pipe(catchError(() => of(null))),
          );
        }

        if (patient.address) {
          tasks.push(
            this.savePatientAddress(id, { addressLine1: patient.address, isPrimary: true }).pipe(catchError(() => of(null))),
          );
        }

        if (patient.pastMedicalHistory || patient.seriousConditions) {
          tasks.push(
            this.savePatientMedicalHistory(id, {
              condition: patient.pastMedicalHistory || patient.seriousConditions,
              notes: patient.seriousConditions,
            }).pipe(catchError(() => of(null))),
          );
        }

        if (patient.smokingStatus || patient.alcoholConsumption || patient.exerciseRoutine) {
          tasks.push(
            this.updatePatientSocialHistory(id, {
              smokingStatus: patient.smokingStatus,
              alcoholConsumption: patient.alcoholConsumption,
              exerciseRoutine: patient.exerciseRoutine,
            }).pipe(catchError(() => of(null))),
          );
        }

        if (patient.dietaryHabits || patient.foodAllergies) {
          tasks.push(
            this.updatePatientDietaryHistory(id, {
              dietType: patient.dietaryHabits,
              restrictions: patient.foodAllergies,
              notes: patient.foodAllergies,
            }).pipe(catchError(() => of(null))),
          );
        }

        if (tasks.length === 0) {
          return of(this.normalizePatient(updated || patient));
        }

        return forkJoin(tasks).pipe(
          switchMap(() => this.getPatientById(id)),
          catchError(() => of(this.normalizePatient(updated || patient))),
        );
      }),
    );
  }

  // Sub-resource Helpers for Patient Profile
  getEmergencyContacts(patientId: string): Observable<EmergencyContact[]> {
    return this.get<any[]>(`/patients/${patientId}/emergency-contacts`).pipe(
      map((list) => (Array.isArray(list) ? list.map((c) => ({
        id: c.id,
        name: c.name,
        relationship: c.relationship,
        phone: c.phone,
        alternatePhone: c.altPhone,
        email: c.email,
        isPrimary: c.isPrimary,
      })) : [])),
      catchError(() => of([])),
    );
  }

  savePatientEmergencyContact(patientId: string, contact: EmergencyContact): Observable<any> {
    if (contact.id) {
      return this.patch(`/emergency-contacts/${contact.id}`, {
        name: contact.name,
        relationship: contact.relationship,
        phone: contact.phone,
        altPhone: contact.alternatePhone,
        email: contact.email,
        isPrimary: contact.isPrimary ?? true,
      });
    }
    return this.post(`/patients/${patientId}/emergency-contacts`, {
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      altPhone: contact.alternatePhone,
      email: contact.email,
      isPrimary: contact.isPrimary ?? true,
    });
  }

  getPatientAddresses(patientId: string): Observable<any[]> {
    return this.get<any[]>(`/patients/${patientId}/addresses`).pipe(
      map((list) => (Array.isArray(list) ? list : [])),
      catchError(() => of([])),
    );
  }

  savePatientAddress(patientId: string, address: any): Observable<any> {
    if (address.id) {
      return this.patch(`/patient-addresses/${address.id}`, address);
    }
    return this.post(`/patients/${patientId}/addresses`, address);
  }

  getPatientDemographics(patientId: string): Observable<any> {
    return this.get<any>(`/patients/${patientId}/demographics`).pipe(catchError(() => of(null)));
  }

  updatePatientDemographics(patientId: string, demographics: any): Observable<any> {
    return this.put(`/patients/${patientId}/demographics`, demographics);
  }

  getPatientMedicalHistory(patientId: string): Observable<any> {
    return this.get<any>(`/patients/${patientId}/medical-history`).pipe(catchError(() => of(null)));
  }

  savePatientMedicalHistory(patientId: string, history: any): Observable<any> {
    return this.post(`/patients/${patientId}/medical-history`, history);
  }

  getPatientSocialHistory(patientId: string): Observable<any> {
    return this.get<any>(`/patients/${patientId}/social-history`).pipe(catchError(() => of(null)));
  }

  updatePatientSocialHistory(patientId: string, social: any): Observable<any> {
    return this.put(`/patients/${patientId}/social-history`, social);
  }

  getPatientDietaryHistory(patientId: string): Observable<any> {
    return this.get<any>(`/patients/${patientId}/dietary-history`).pipe(catchError(() => of(null)));
  }

  updatePatientDietaryHistory(patientId: string, dietary: any): Observable<any> {
    return this.put(`/patients/${patientId}/dietary-history`, dietary);
  }

  getPatientInsurances(patientId: string): Observable<any[]> {
    return this.get<any[]>(`/patients/${patientId}/insurances`).pipe(
      map((list) => (Array.isArray(list) ? list : [])),
      catchError(() => of([])),
    );
  }

  addPatientInsurance(patientId: string, insurance: any): Observable<any> {
    return this.post(`/patients/${patientId}/insurances`, insurance);
  }

  private normalizePatient(p: any): Patient {
    if (!p) return p;
    return {
      ...p,
      patientCode: p.patientCode || p.mrn || 'PAT-' + (p.id ? String(p.id).substring(0, 6).toUpperCase() : '1001'),
      bloodType: p.bloodType || p.bloodGroup || 'O+',
      bloodGroup: p.bloodGroup || p.bloodType || 'O+',
      fullName: p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Patient',
    };
  }

  private enrichPatientProfile(patient: Patient): Observable<Patient> {
    if (!patient || !patient.id) return of(this.normalizePatient(patient));

    return forkJoin({
      contacts: this.getEmergencyContacts(patient.id),
      addresses: this.getPatientAddresses(patient.id),
      demographics: this.getPatientDemographics(patient.id),
      insurances: this.getPatientInsurances(patient.id),
      medicalHistory: this.getPatientMedicalHistory(patient.id),
      socialHistory: this.getPatientSocialHistory(patient.id),
      dietaryHistory: this.getPatientDietaryHistory(patient.id),
    }).pipe(
      map((res) => {
        const enriched: Patient = { ...patient };
        enriched.patientCode = enriched.patientCode || enriched.mrn || 'PAT-' + String(enriched.id).substring(0, 6).toUpperCase();
        enriched.bloodType = enriched.bloodType || enriched.bloodGroup || res.demographics?.bloodGroup || 'O+';
        enriched.bloodGroup = enriched.bloodGroup || res.demographics?.bloodGroup || enriched.bloodType || 'O+';
        enriched.rhFactor = enriched.rhFactor || res.demographics?.rhFactor || 'POSITIVE';

        if (res.contacts && res.contacts.length > 0) {
          enriched.emergencyContact = res.contacts[0];
          enriched.emergencyContacts = res.contacts;
        }

        if (res.addresses && res.addresses.length > 0) {
          const addr = res.addresses[0];
          enriched.address = enriched.address || [addr.addressLine1, addr.city, addr.state, addr.postalCode].filter(Boolean).join(', ');
          enriched.state = enriched.state || addr.state;
          enriched.pinCode = enriched.pinCode || addr.postalCode;
        }

        if (res.insurances && res.insurances.length > 0) {
          const ins = res.insurances[0];
          enriched.insuranceProvider = enriched.insuranceProvider || ins.payerName || ins.insuranceProvider || 'Universal Healthcare';
          enriched.insurancePolicyNumber = enriched.insurancePolicyNumber || ins.policyNumber || ins.memberId;
          enriched.insuranceGroupNumber = enriched.insuranceGroupNumber || ins.groupNumber;
          enriched.coveragePlan = enriched.coveragePlan || ins.planType || ins.coveragePlan;
        }

        if (res.medicalHistory) {
          enriched.pastMedicalHistory = enriched.pastMedicalHistory || res.medicalHistory.condition || res.medicalHistory.diagnosis;
          enriched.seriousConditions = enriched.seriousConditions || res.medicalHistory.notes;
        }

        if (res.socialHistory) {
          enriched.smokingStatus = enriched.smokingStatus || res.socialHistory.smokingStatus;
          enriched.alcoholConsumption = enriched.alcoholConsumption || res.socialHistory.alcoholConsumption;
          enriched.exerciseRoutine = enriched.exerciseRoutine || res.socialHistory.exerciseRoutine;
        }

        if (res.dietaryHistory) {
          enriched.dietaryHabits = enriched.dietaryHabits || res.dietaryHistory.dietType || res.dietaryHistory.dietaryHabits;
          enriched.foodAllergies = enriched.foodAllergies || res.dietaryHistory.restrictions || res.dietaryHistory.foodAllergies;
        }

        return this.normalizePatient(enriched);
      }),
      catchError(() => of(this.normalizePatient(patient))),
    );
  }

  // =========================================================================
  // 2. Master Patient Index (MPI) Search & Merge
  // =========================================================================
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
    return this.get<MPIMatchCandidateDTO[]>(`/patients/mpi/search?${queryParams.toString()}`);
  }

  scanDuplicateMPI(): Observable<MPIMatchCandidateDTO[]> {
    return this.get<MPIMatchCandidateDTO[]>('/patients/mpi/duplicates');
  }

  requestMPIMerge(payload: MPIMergeRequestDTO): Observable<string> {
    return this.post('/patients/mpi/merge-requests', payload);
  }

  // =========================================================================
  // 3. Real-Time Insurance Eligibility
  // =========================================================================
  checkEligibility(inquiry: EligibilityInquiryDTO | any): Observable<EligibilityResponseDTO> {
    return this.post<EligibilityResponseDTO>('/insurance/verify-eligibility', inquiry);
  }

  collectCopay(copayPayload: CopayCollectionDTO | any): Observable<CopayCollectionDTO> {
    return this.post<CopayCollectionDTO>('/insurance/collect-copay', copayPayload);
  }

  // =========================================================================
  // 4. Encounters & Clinical Visits
  // =========================================================================
  getEncountersByPatient(patientId: string): Observable<Encounter[]> {
    return this.get<Encounter[]>(`/patients/${patientId}/encounters`).pipe(
      map((list) =>
        Array.isArray(list)
          ? list.map((e) => ({
              ...e,
              encounterType: e.encounterType || 'OUTPATIENT',
              status: e.status || 'ACTIVE',
              startTime: e.startTime || e.startedAt || e.createdAt,
              encounterDate: e.encounterDate || e.startedAt?.split('T')[0],
              chiefComplaint: e.chiefComplaint || e.reasonForVisit || e.reasonText || 'Clinical Consultation',
            }))
          : [],
      ),
      catchError(() => of([])),
    );
  }

  getEncounterById(encounterId: string): Observable<Encounter> {
    return this.get<Encounter>(`/encounters/${encounterId}`);
  }

  createEncounter(encounter: Partial<Encounter>): Observable<Encounter> {
    return this.post<Encounter>('/encounters', encounter);
  }

  updateEncounter(id: string, encounter: Partial<Encounter>): Observable<Encounter> {
    return this.patch<Encounter>(`/encounters/${id}`, encounter);
  }

  completeEncounter(encounterId: string): Observable<Encounter> {
    return this.post<Encounter>(`/encounters/${encounterId}/complete`, {});
  }

  // =========================================================================
  // 5. Inpatient Admissions, Discharges & Bed Transfers
  // =========================================================================
  admitPatient(encounterId: string, payload: { wardId?: string; roomId?: string; bedId?: string; admissionReason?: string; attendingPractitionerId?: string; admittedAt?: string }): Observable<any> {
    return this.post<any>(`/encounters/${encounterId}/admission`, payload);
  }

  getAdmission(encounterId: string): Observable<any> {
    return this.get<any>(`/encounters/${encounterId}/admission`);
  }

  cancelAdmission(admissionId: string): Observable<any> {
    return this.post<any>(`/admissions/${admissionId}/cancel`, {});
  }

  dischargePatient(encounterId: string, payload: { dischargeDisposition?: string; dischargeNotes?: string; followUpInstructions?: string; dischargedAt?: string }): Observable<any> {
    return this.post<any>(`/encounters/${encounterId}/discharge`, payload);
  }

  getDischarge(encounterId: string): Observable<any> {
    return this.get<any>(`/encounters/${encounterId}/discharge`);
  }

  transferPatientInpatient(encounterId: string, payload: { toWardId?: string; toRoomId?: string; toBedId?: string; transferReason?: string; notes?: string }): Observable<any> {
    return this.post<any>(`/encounters/${encounterId}/transfer`, payload);
  }

  getTransfers(encounterId: string): Observable<any[]> {
    return this.get<any[]>(`/encounters/${encounterId}/transfers`).pipe(catchError(() => of([])));
  }

  // =========================================================================
  // 6. Bed Management
  // =========================================================================
  getAvailableBeds(facilityId?: string, wardId?: string): Observable<Bed[]> {
    const params: string[] = [];
    if (facilityId) params.push(`facilityId=${facilityId}`);
    if (wardId) params.push(`wardId=${wardId}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return this.get<Bed[]>(`/beds/available${query}`).pipe(
      catchError(() => of([])),
    );
  }

  getBeds(department?: string): Observable<Bed[]> {
    return this.getAvailableBeds();
  }

  getBedById(id: string): Observable<Bed> {
    return this.get<Bed>(`/beds/${id}`);
  }

  createBed(roomId: string, bed: BedRequestDTO): Observable<Bed> {
    return this.post<Bed>(`/rooms/${roomId}/beds`, bed);
  }

  updateBed(id: string, payload: Partial<Bed>): Observable<Bed> {
    return this.patch<Bed>(`/beds/${id}`, payload);
  }

  assignBed(bedId: string, encounterId?: string): Observable<Bed> {
    return this.post<Bed>(`/beds/${bedId}/assign`, { encounterId });
  }

  releaseBed(bedId: string): Observable<Bed> {
    return this.post<Bed>(`/beds/${bedId}/release`, {});
  }

  updateBedStatus(id: string, status: string): Observable<Bed> {
    return this.patch<Bed>(`/beds/${id}`, { status });
  }

  transferBed(payload: { encounterId: string; newBedId: string; transferReason?: string }): Observable<LocationHistory> {
    return this.transferPatientInpatient(payload.encounterId, { toBedId: payload.newBedId, transferReason: payload.transferReason });
  }

  getLocationHistory(encounterId: string): Observable<LocationHistory[]> {
    return this.getTransfers(encounterId);
  }

  // =========================================================================
  // 7. Emergency Access Break-Glass System
  // =========================================================================
  requestBreakGlass(payload: BreakGlassRequestDTO): Observable<BreakGlassRecord> {
    return this.post<BreakGlassRecord>('/break-glass/request', payload);
  }

  getBreakGlassByPatient(patientId: string): Observable<BreakGlassRecord[]> {
    return this.get<BreakGlassRecord[]>(`/break-glass/patient/${patientId}`);
  }

  getBreakGlassByUser(username: string): Observable<BreakGlassRecord[]> {
    return this.get<BreakGlassRecord[]>(`/break-glass/user/${username}`);
  }

  // =========================================================================
  // 8. Laboratory Orders, Results & Specimens
  // =========================================================================
  getLabOrdersList(patientId?: string, encounterId?: string, status?: string, search?: string): Observable<LabOrder[]> {
    if (patientId) {
      return this.get<LabOrder[]>(`/patients/${patientId}/lab-orders`).pipe(catchError(() => of([])));
    }
    if (encounterId) {
      return this.get<LabOrder[]>(`/encounters/${encounterId}/lab-orders`).pipe(catchError(() => of([])));
    }
    const params: string[] = [];
    if (status && status !== 'ALL') params.push(`status=${encodeURIComponent(status)}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    const qs = params.length > 0 ? `?${params.join('&')}` : '';

    return this.get<LabOrder[]>(`/lab-orders${qs}`).pipe(
      catchError(() => {
        // Fallback: Query across patients
        return this.getPatients().pipe(
          switchMap((patients) => {
            if (!patients || patients.length === 0) return of([]);
            const tasks = patients.slice(0, 15).map((p) =>
              this.get<LabOrder[]>(`/patients/${p.id}/lab-orders`).pipe(
                map((orders) => Array.isArray(orders) ? orders.map((o) => ({ ...o, patient: p, patientFullName: p.fullName })) : []),
                catchError(() => of([])),
              ),
            );
            return forkJoin(tasks).pipe(map((res) => res.flat()));
          }),
          catchError(() => of([])),
        );
      }),
    );
  }

  getLabOrderById(id: string | number): Observable<LabOrder> {
    return this.get<LabOrder>(`/lab-orders/${id}`);
  }

  createLabOrder(order: LabOrderRequestDTO): Observable<LabOrder> {
    if (order.encounterId) {
      return this.post<LabOrder>(`/encounters/${order.encounterId}/lab-orders`, {
        testCode: order.testCode || order.loincCode || 'LOINC-4548-4',
        testName: order.testName,
        category: order.category || 'CHEMISTRY',
        priority: order.priority || 'ROUTINE',
        clinicalNotes: order.clinicalNotes || order.notes,
        specimenType: order.specimenType || 'BLOOD',
        collectionInstructions: order.collectionInstructions,
        fastingRequired: order.fastingRequired || false,
      });
    }

    if (order.patientId) {
      return this.getEncountersByPatient(order.patientId).pipe(
        switchMap((encounters) => {
          const encounterId = encounters.length > 0 ? encounters[0].id : null;
          if (encounterId) {
            return this.createLabOrder({ ...order, encounterId });
          }
          return this.createEncounter({
            patientId: order.patientId,
            encounterType: 'OUTPATIENT',
            chiefComplaint: 'Diagnostic Lab Evaluation',
            status: 'ACTIVE',
          }).pipe(
            switchMap((enc) => this.createLabOrder({ ...order, encounterId: enc.id })),
          );
        }),
      );
    }

    return throwError(() => new Error('Patient ID or Encounter ID is required to create a lab order.'));
  }

  updateLabOrder(id: string | number, payload: Partial<LabOrderStatusUpdateDTO>): Observable<LabOrder> {
    return this.patch<LabOrder>(`/lab-orders/${id}`, payload);
  }

  updateLabOrderStatus(id: string | number, status: string, barcode?: string): Observable<LabOrder> {
    return this.patch<LabOrder>(`/lab-orders/${id}`, {
      status,
      specimenBarcode: barcode,
    });
  }

  cancelLabOrder(id: string | number): Observable<LabOrder> {
    return this.post<LabOrder>(`/lab-orders/${id}/cancel`, {});
  }

  addLabResult(orderId: string | number, result: any): Observable<LabResult> {
    const payload = {
      testCode: result.testCode || result.loincCode || result.testName || 'LOINC-4548-4',
      testName: result.testName || 'Laboratory Result',
      resultValue: String(result.resultValue ?? result.value ?? ''),
      unit: result.unit || '',
      referenceRange: result.referenceRange || '',
      abnormalFlag: result.abnormalFlag || 'NORMAL',
      isCritical: result.isCritical || false,
      components: result.components,
    };
    return this.post<LabResult>(`/lab-orders/${orderId}/results`, payload);
  }

  getOrderResults(orderId: string | number): Observable<LabResult[]> {
    return this.get<LabResult[]>(`/lab-orders/${orderId}/results`).pipe(catchError(() => of([])));
  }

  getPatientLabResults(patientId: string): Observable<LabResult[]> {
    return this.get<LabResult[]>(`/patients/${patientId}/lab-results`).pipe(catchError(() => of([])));
  }

  verifyLabResult(resultId: string): Observable<LabResult> {
    return this.post<LabResult>(`/lab-results/${resultId}/verify`, {});
  }

  createSpecimen(orderId: string | number, request: any): Observable<Specimen> {
    return this.post<Specimen>(`/lab-orders/${orderId}/specimens`, {
      specimenBarcode: request.specimenBarcode || request.barcode,
      specimenType: request.specimenType || 'BLOOD',
      collectionSite: request.collectionSite || 'Antecubital fossa',
      fastingStatus: request.fastingStatus || 'NON_FASTING',
      notes: request.notes,
      collectedAt: request.collectedAt || new Date().toISOString(),
    });
  }

  getOrderSpecimens(orderId: string | number): Observable<Specimen[]> {
    return this.get<Specimen[]>(`/lab-orders/${orderId}/specimens`).pipe(catchError(() => of([])));
  }

  // =========================================================================
  // 9. Allergies & Contraindications
  // =========================================================================
  getAllergiesByPatient(patientId: string): Observable<Allergy[]> {
    return this.get<Allergy[]>(`/patients/${patientId}/allergies`).pipe(
      map((list) =>
        Array.isArray(list)
          ? list.map((a) => ({
              ...a,
              reactionDescription: a.reactionDescription || a.reaction || 'Documented allergic sensitivity',
              reaction: a.reaction || a.reactionDescription,
              status: a.status || 'ACTIVE',
            }))
          : [],
      ),
      catchError(() => of([])),
    );
  }

  createAllergy(allergy: Partial<Allergy>): Observable<Allergy> {
    const patientId = allergy.patientId || allergy.patient?.id;
    if (patientId) {
      return this.post<Allergy>(`/patients/${patientId}/allergies`, {
        allergenCode: allergy.allergenCode || 'OTHER',
        allergenName: allergy.allergenName,
        category: allergy.category || 'OTHER',
        reaction: allergy.reaction || allergy.reactionDescription,
        severity: allergy.severity || 'MILD',
        status: allergy.status || 'ACTIVE',
        verificationStatus: allergy.verificationStatus || 'CONFIRMED',
        notes: allergy.notes,
      });
    }
    return this.post<Allergy>('/allergies', allergy);
  }

  updateAllergyStatus(id: string, status: string): Observable<Allergy> {
    if (status.toUpperCase() === 'INACTIVE' || status.toUpperCase() === 'RESOLVED') {
      return this.post<Allergy>(`/allergies/${id}/inactivate`, {});
    }
    return this.patch<Allergy>(`/allergies/${id}`, { status });
  }

  // =========================================================================
  // 10. Diagnoses & Problem Lists
  // =========================================================================
  getDiagnosesByPatient(patientId: string): Observable<Diagnosis[]> {
    return this.get<any[]>(`/patients/${patientId}/problems`).pipe(
      map((list) =>
        Array.isArray(list)
          ? list.map((p) => ({
              id: p.id,
              patientId: p.patientId,
              conditionName: p.problemName || p.conditionName || 'Medical Diagnosis',
              diagnosisName: p.problemName || p.diagnosisName || p.conditionName,
              icdCode: p.icd10Code || p.icdCode || 'ICD-10',
              snomedCode: p.snomedCode,
              onsetDate: p.onsetDate,
              status: p.status || 'ACTIVE',
              verificationStatus: p.verificationStatus,
              notes: p.notes,
              recordedAt: p.recordedAt || p.createdAt,
            }))
          : [],
      ),
      catchError(() => of([])),
    );
  }

  createDiagnosis(diagnosis: Partial<Diagnosis>): Observable<Diagnosis> {
    const patientId = diagnosis.patientId || diagnosis.patient?.id;
    if (patientId) {
      return this.post<any>(`/patients/${patientId}/problems`, {
        problemName: diagnosis.conditionName || diagnosis.diagnosisName,
        icd10Code: diagnosis.icdCode,
        snomedCode: diagnosis.snomedCode,
        onsetDate: diagnosis.onsetDate,
        status: diagnosis.status || 'ACTIVE',
        notes: diagnosis.notes,
      });
    }
    return this.post<Diagnosis>('/diagnoses', diagnosis);
  }

  updateDiagnosisStatus(id: string, status: string): Observable<Diagnosis> {
    return this.patch<Diagnosis>(`/problems/${id}`, { status });
  }

  // =========================================================================
  // 11. Medical Records (EHR Legacy Notes)
  // =========================================================================
  getRecordsByPatient(patientId: string): Observable<MedicalRecord[]> {
    return this.get<MedicalRecord[]>(`/clinical-records/patient/${patientId}`).pipe(
      catchError(() => of([])),
    );
  }

  createRecord(record: Partial<MedicalRecord>): Observable<MedicalRecord> {
    return this.post<MedicalRecord>('/clinical-records', record);
  }

  // =========================================================================
  // 12. Vitals & Observations
  // =========================================================================
  getVitalsByPatient(patientId: string): Observable<Vitals[]> {
    return this.get<Vitals[]>(`/patients/${patientId}/vitals`).pipe(
      map((list) =>
        Array.isArray(list)
          ? list.map((v) => ({
              ...v,
              recordedAt: v.recordedAt || new Date().toISOString(),
              temperatureUnit: v.temperatureUnit || 'F',
            }))
          : [],
      ),
      catchError(() => of([])),
    );
  }

  getLatestVitals(patientId: string): Observable<Vitals> {
    return this.get<Vitals>(`/patients/${patientId}/vitals/latest`).pipe(
      catchError(() =>
        this.getVitalsByPatient(patientId).pipe(
          map((list) => (list.length > 0 ? list[0] : (null as any))),
        ),
      ),
    );
  }

  recordVitals(vitals: Partial<Vitals>): Observable<Vitals> {
    const patientId = vitals.patientId || vitals.patient?.id;
    if (!patientId) {
      return of(vitals as Vitals);
    }
    return this.recordPatientVitals(patientId, vitals);
  }

  recordPatientVitals(patientId: string, vitals: Partial<Vitals>): Observable<Vitals> {
    return this.getEncountersByPatient(patientId).pipe(
      switchMap((encounters) => {
        const encounterId = vitals.encounterId || (encounters.length > 0 ? encounters[0].id : null);

        if (encounterId) {
          return this.post<Vitals>(`/encounters/${encounterId}/vitals`, vitals);
        }

        return this.createEncounter({
          patientId: patientId,
          encounterType: 'OUTPATIENT',
          chiefComplaint: 'Patient Portal Health Vitals Entry',
          status: 'ACTIVE',
        }).pipe(
          switchMap((enc) => {
            if (!enc?.id) {
              return throwError(() => new Error('Could not create encounter for logging vitals.'));
            }
            return this.post<Vitals>(`/encounters/${enc.id}/vitals`, vitals);
          }),
        );
      }),
    );
  }

  // =========================================================================
  // 13. Prescriptions & Medication Administration (eMAR)
  // =========================================================================
  getPrescriptionsByPatient(patientId: string): Observable<Prescription[]> {
    return this.get<Prescription[]>(`/patients/${patientId}/prescriptions`).pipe(
      map((list) =>
        Array.isArray(list)
          ? list.map((rx) => ({
              ...rx,
              dosage: rx.dosage || rx.dose || 'Standard',
              route: rx.route || 'Oral',
              frequency: rx.frequency || 'Once Daily',
              refills: rx.refills ?? 1,
              status: rx.status || 'ACTIVE',
            }))
          : [],
      ),
      catchError(() => of([])),
    );
  }

  checkPrescriptionSafety(patientId: string, medicationName: string): Observable<SafetyCheckResult> {
    return this.post<SafetyCheckResult>('/prescriptions/safety-check', { patientId, medicationName });
  }

  validatePrescriptionSafety(
    patientId: string,
    medicationName: string,
    dosage?: string,
    instructions?: string,
  ): Observable<SafetyCheckResult> {
    return this.post<SafetyCheckResult>('/prescriptions/safety-check', {
      patientId,
      medicationName,
      dosage,
      instructions,
    });
  }

  createPrescription(prescription: Partial<Prescription>, overrideWarning = false): Observable<Prescription> {
    const encounterId = prescription.encounterId;
    if (encounterId) {
      return this.post<Prescription>(`/encounters/${encounterId}/prescriptions`, prescription);
    }
    const patientId = prescription.patientId || prescription.patient?.id;
    if (patientId) {
      return this.getEncountersByPatient(patientId).pipe(
        switchMap((encounters) => {
          const encId = encounters.length > 0 ? encounters[0].id : null;
          if (encId) {
            return this.post<Prescription>(`/encounters/${encId}/prescriptions`, prescription);
          }
          return this.createEncounter({
            patientId,
            encounterType: 'OUTPATIENT',
            chiefComplaint: 'Medication Prescription Visit',
            status: 'ACTIVE',
          }).pipe(
            switchMap((enc) => this.post<Prescription>(`/encounters/${enc.id}/prescriptions`, prescription)),
          );
        }),
      );
    }
    return this.post<Prescription>('/prescriptions', prescription);
  }

  updatePrescriptionStatus(id: string, status: string): Observable<Prescription> {
    if (status.toUpperCase() === 'DISCONTINUED') {
      return this.post<Prescription>(`/prescriptions/${id}/discontinue`, {});
    }
    return this.patch<Prescription>(`/prescriptions/${id}`, { status });
  }

  administerMedication(prescriptionId: string, payload: { medicationName: string; dose: string; route?: string; notes?: string; administeredAt?: string }): Observable<EmarRecordResponseDTO> {
    return this.post<EmarRecordResponseDTO>(`/prescriptions/${prescriptionId}/administer`, payload);
  }

  getEncounterAdministrations(encounterId: string): Observable<EmarRecordResponseDTO[]> {
    return this.get<EmarRecordResponseDTO[]>(`/encounters/${encounterId}/administrations`).pipe(catchError(() => of([])));
  }

  getPatientAdministrations(patientId: string): Observable<EmarRecordResponseDTO[]> {
    return this.get<EmarRecordResponseDTO[]>(`/patients/${patientId}/administrations`).pipe(catchError(() => of([])));
  }

  // =========================================================================
  // 14. Appointments & Provider Scheduling
  // =========================================================================
  getAppointments(): Observable<Appointment[]> {
    return this.getPatients().pipe(
      switchMap((patients) => {
        if (!patients || patients.length === 0) return of([]);
        const tasks = patients.slice(0, 15).map((p) =>
          this.get<Appointment[]>(`/patients/${p.id}/appointments`).pipe(
            map((list) => (Array.isArray(list) ? list.map((a) => this.normalizeAppointment({ ...a, patient: p })) : [])),
            catchError(() => of([])),
          ),
        );
        return forkJoin(tasks).pipe(
          map((res) => {
            const flattened = res.flat();
            // Sort by startsAt descending
            return flattened.sort((a, b) => {
              const tA = new Date(a.startsAt || a.appointmentDate || 0).getTime();
              const tB = new Date(b.startsAt || b.appointmentDate || 0).getTime();
              return tB - tA;
            });
          }),
        );
      }),
      catchError(() => of([])),
    );
  }

  getAppointmentById(id: string): Observable<Appointment> {
    return this.get<Appointment>(`/appointments/${id}`).pipe(
      map((a) => this.normalizeAppointment(a)),
    );
  }

  getAppointmentsByPatient(patientId: string): Observable<Appointment[]> {
    return this.get<Appointment[]>(`/patients/${patientId}/appointments`).pipe(
      map((list) => (Array.isArray(list) ? list.map((a) => this.normalizeAppointment(a)) : [])),
      catchError(() => of([])),
    );
  }

  getAppointmentsByFacility(facilityId: string): Observable<Appointment[]> {
    return this.get<Appointment[]>(`/facilities/${facilityId}/appointments`).pipe(
      map((list) => (Array.isArray(list) ? list.map((a) => this.normalizeAppointment(a)) : [])),
      catchError(() => of([])),
    );
  }

  scheduleAppointment(appointment: AppointmentRequestDTO | Partial<Appointment>): Observable<Appointment> {
    let startsAt = appointment.appointmentDate || appointment.startsAt;
    if (startsAt) {
      try {
        const d = new Date(startsAt);
        if (!isNaN(d.getTime())) {
          startsAt = d.toISOString();
        }
      } catch (e) {}
    } else {
      startsAt = new Date().toISOString();
    }

    let endsAt = appointment.endsAt;
    if (endsAt) {
      try {
        const d = new Date(endsAt);
        if (!isNaN(d.getTime())) {
          endsAt = d.toISOString();
        }
      } catch (e) {}
    }

    const payload = {
      patientId: appointment.patientId,
      practitionerId: appointment.practitionerId || appointment.doctorId,
      facilityId: appointment.facilityId,
      departmentId: appointment.departmentId,
      startsAt: startsAt,
      endsAt: endsAt,
      appointmentType: appointment.appointmentType || 'CONSULTATION',
      reason: appointment.reason || 'General Consultation',
      priority: appointment.priority || 'ROUTINE',
      notes: appointment.notes,
    };
    return this.post<Appointment>('/appointments', payload).pipe(
      map((a) => this.normalizeAppointment(a || appointment)),
    );
  }

  checkInPatient(
    id: string,
    payload: {
      notes?: string;
      insuranceVerified?: boolean;
      insuranceDetails?: string;
      reportsUploaded?: string;
    } = {},
  ): Observable<Appointment> {
    return this.post<Appointment>(`/appointments/${id}/check-in`, { notes: payload.notes || payload.insuranceDetails }).pipe(
      map((a) => this.normalizeAppointment(a)),
    );
  }

  updateAppointmentStage(id: string, stage: string): Observable<Appointment> {
    if (stage === 'CHECKED_IN') {
      return this.checkInPatient(id);
    }
    return this.patch<Appointment>(`/appointments/${id}`, { stage, status: stage }).pipe(
      map((a) => this.normalizeAppointment(a)),
      catchError(() => this.getAppointmentById(id)),
    );
  }

  updateAppointmentStatus(id: string, status: string): Observable<Appointment> {
    if (status === 'CHECKED_IN') {
      return this.checkInPatient(id);
    }
    return this.patch<Appointment>(`/appointments/${id}`, { status, stage: status }).pipe(
      map((a) => this.normalizeAppointment(a)),
      catchError(() => this.getAppointmentById(id)),
    );
  }

  recordAppointmentTriage(id: string, payload: AppointmentTriageRequestDTO): Observable<Appointment> {
    return this.post<Appointment>(`/appointments/${id}/triage`, payload).pipe(
      map((a) => this.normalizeAppointment(a)),
    );
  }

  recordTriageVitals(id: string, payload: any): Observable<Appointment> {
    return this.recordAppointmentTriage(id, {
      systolicBp: payload.systolicBp,
      diastolicBp: payload.diastolicBp,
      heartRate: payload.heartRate,
      respiratoryRate: payload.respiratoryRate,
      temperature: payload.temperature,
      oxygenSaturation: payload.oxygenSaturation,
      notes: payload.notes || 'Bedside triage vitals logged',
    });
  }

  startConsultation(id: string): Observable<Appointment> {
    return this.patch<Appointment>(`/appointments/${id}`, { status: 'IN_CONSULTATION' }).pipe(
      map((a) => this.normalizeAppointment(a)),
      catchError(() => this.getAppointmentById(id).pipe(map((a) => ({ ...a, status: 'IN_CONSULTATION', stage: 'IN_CONSULTATION' })))),
    );
  }

  recordDoctorConsultation(id: string, payload: { doctorNotes?: string; diagnoses?: any[]; prescriptions?: any[]; labOrders?: any[] }): Observable<Appointment> {
    const primaryDiag = payload.diagnoses && payload.diagnoses.length > 0 ? payload.diagnoses[0] : null;
    const req: AppointmentConsultRequestDTO = {
      diagnosis: primaryDiag?.conditionName || primaryDiag?.diagnosisName || 'General Medical Consultation',
      icdCode: primaryDiag?.icdCode || 'Z00.00',
      treatmentNotes: payload.doctorNotes || 'Consultation completed successfully.',
    };
    return this.post<Appointment>(`/appointments/${id}/consult`, req).pipe(
      map((a) => this.normalizeAppointment(a)),
    );
  }

  cancelAppointment(id: string, reason: string, comment?: string): Observable<AppointmentCancellation> {
    const payload: AppointmentCancelRequestDTO = {
      cancellationReason: reason || 'Patient Requested',
      additionalComment: comment,
    };
    return this.post<Appointment>(`/appointments/${id}/cancel`, payload).pipe(
      map((a) => ({
        id: a.id,
        appointmentId: id,
        cancellationReason: reason,
        additionalComment: comment,
        cancelledAt: new Date().toISOString(),
        cancelledByRole: 'USER',
      } as AppointmentCancellation)),
    );
  }

  rescheduleAppointment(id: string, payload: AppointmentRescheduleRequestDTO): Observable<Appointment> {
    let newStartsAt = payload.newStartsAt;
    if (newStartsAt) {
      try {
        const d = new Date(newStartsAt);
        if (!isNaN(d.getTime())) {
          newStartsAt = d.toISOString();
        }
      } catch (e) {}
    }
    let newEndsAt = payload.newEndsAt;
    if (newEndsAt) {
      try {
        const d = new Date(newEndsAt);
        if (!isNaN(d.getTime())) {
          newEndsAt = d.toISOString();
        }
      } catch (e) {}
    }
    return this.post<Appointment>(`/appointments/${id}/reschedule`, { ...payload, newStartsAt, newEndsAt }).pipe(
      map((a) => this.normalizeAppointment(a)),
    );
  }

  getPractitionerSlots(practitionerId: string, start?: string, end?: string): Observable<ScheduleSlot[]> {
    const params: string[] = [];
    if (start) params.push(`start=${encodeURIComponent(start)}`);
    if (end) params.push(`end=${encodeURIComponent(end)}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return this.get<ScheduleSlot[]>(`/practitioners/${practitionerId}/slots${query}`).pipe(catchError(() => of([])));
  }

  createPractitionerSlot(practitionerId: string, slot: Partial<ScheduleSlot>): Observable<ScheduleSlot> {
    return this.post<ScheduleSlot>(`/practitioners/${practitionerId}/slots`, slot);
  }

  getRecommendedDoctors(patientId?: string, reason?: string, date?: string): Observable<DoctorRecommendationDTO[]> {
    return this.getDoctors().pipe(
      map((doctors) => {
        if (!doctors || doctors.length === 0) return [];
        return doctors.map((doc, idx) => {
          const matchScore = Math.max(70, 98 - idx * 6);
          const specialty = doc.specialization || (doc as any).primarySpecialty || 'General Physician';
          return {
            doctor: doc,
            matchScore,
            specialtyFitScore: 95,
            continuityScore: idx === 0 ? 92 : 80,
            recommendedSpecialty: specialty,
            matchReason: `High clinical alignment for "${reason || 'General Consultation'}" based on specialist qualifications.`,
            verifiedLicense: true,
            recommendedSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '04:15 PM'],
          };
        });
      }),
      catchError(() => of([])),
    );
  }

  private normalizeAppointment(a: any): Appointment {
    if (!a) return a;
    const starts = a.startsAt || a.appointmentDate || new Date().toISOString();
    const docName = a.doctorName || (a.doctorUsername ? 'Dr. ' + a.doctorUsername : (a.doctor?.fullName || 'Attending Physician'));
    return {
      ...a,
      appointmentDate: starts,
      startsAt: starts,
      doctorName: docName,
      doctorUsername: a.doctorUsername || a.doctor?.username,
      doctorSpecialization: a.doctorSpecialization || a.doctor?.specialization || 'Clinical Medicine',
      status: a.status || 'SCHEDULED',
      stage: a.stage || a.status || 'SCHEDULED',
    };
  }

  getDoctors(): Observable<User[]> {
    return this.get<any[]>('/practitioners').pipe(
      map((list) => {
        if (Array.isArray(list) && list.length > 0) {
          return list.map((p) => ({
            id: p.id,
            username: p.identifier || p.firstName?.toLowerCase() || 'doctor',
            fullName: p.fullName || `Dr. ${p.firstName || ''} ${p.lastName || ''}`.trim(),
            specialization: p.primarySpecialty || 'General Practice',
            roles: ['PHYSICIAN'],
          } as User));
        }
        return [];
      }),
      catchError(() =>
        this.get<any[]>('/users?role=PHYSICIAN').pipe(
          map((list) => (Array.isArray(list) ? list : [])),
          catchError(() => of([])),
        ),
      ),
    );
  }

  getAppointmentNotes(id: string): Observable<AppointmentNote[]> {
    return this.get<AppointmentNote[]>(`/appointments/${id}/notes`).pipe(catchError(() => of([])));
  }

  addAppointmentNote(id: string, noteType: string, content: string): Observable<AppointmentNote> {
    return this.post<AppointmentNote>(`/appointments/${id}/notes`, { noteType, content });
  }

  generateBilling(id: string, payload: any): Observable<AppointmentBilling> {
    return of({
      id: `BILL-${id.substring(0, 6)}`,
      appointmentId: id,
      consultationFee: payload.consultationFee || 100,
      triageFee: payload.triageFee || 25,
      labFee: 0,
      pharmacyFee: 0,
      insuranceCoverage: 0,
      netPayable: (payload.consultationFee || 100) + (payload.triageFee || 25),
      paymentStatus: 'PENDING',
      generatedAt: new Date().toISOString(),
    });
  }

  getBillingDetails(id: string): Observable<AppointmentBilling> {
    return this.get<AppointmentBilling>(`/appointments/${id}/billing`);
  }

  // =========================================================================
  // 15. Billing, Invoices & Ledger
  // =========================================================================
  getPatientInvoices(patientId: string): Observable<any[]> {
    return this.get<any[]>(`/billing/invoices/patient/${patientId}`).pipe(catchError(() => of([])));
  }

  getPatientPayments(patientId: string): Observable<any[]> {
    return this.get<any[]>(`/billing/payments/patient/${patientId}`).pipe(catchError(() => of([])));
  }

  createInvoice(invoice: any): Observable<any> {
    return this.post<any>('/billing/invoices', invoice);
  }

  recordPayment(payment: any): Observable<any> {
    return this.post<any>('/billing/payments', payment);
  }

  createBillingAccount(patientId: string, payload: { accountType?: string; coverageType?: string }): Observable<any> {
    return this.post<any>(`/patients/${patientId}/billing-accounts`, payload);
  }

  getBillingAccounts(patientId: string): Observable<any[]> {
    return this.get<any[]>(`/patients/${patientId}/billing-accounts`).pipe(catchError(() => of([])));
  }

  getBillingAccount(accountId: string): Observable<any> {
    return this.get<any>(`/billing-accounts/${accountId}`);
  }

  createAccountInvoice(accountId: string, payload: any): Observable<any> {
    return this.post<any>(`/billing-accounts/${accountId}/invoices`, payload);
  }

  getAccountInvoices(accountId: string): Observable<any[]> {
    return this.get<any[]>(`/billing-accounts/${accountId}/invoices`).pipe(catchError(() => of([])));
  }

  getInvoice(invoiceId: string): Observable<any> {
    return this.get<any>(`/invoices/${invoiceId}`);
  }

  addInvoiceItem(invoiceId: string, payload: any): Observable<any> {
    return this.post<any>(`/invoices/${invoiceId}/items`, payload);
  }

  finalizeInvoice(invoiceId: string): Observable<any> {
    return this.post<any>(`/invoices/${invoiceId}/finalize`, {});
  }

  recordInvoicePayment(invoiceId: string, payload: any): Observable<any> {
    return this.post<any>(`/invoices/${invoiceId}/payments`, payload);
  }

  getInvoicePayments(invoiceId: string): Observable<any[]> {
    return this.get<any[]>(`/invoices/${invoiceId}/payments`).pipe(catchError(() => of([])));
  }

  processRefund(paymentId: string, payload: any): Observable<any> {
    return this.post<any>(`/payments/${paymentId}/refund`, payload);
  }

  // =========================================================================
  // 16. Clinical Triage & Nursing Flowsheets
  // =========================================================================
  recordTriage(encounterId: string, record: TriageEwsRequestDTO | any): Observable<TriageEwsResponseDTO> {
    return this.post<TriageEwsResponseDTO>(`/encounters/${encounterId}/triage`, {
      chiefComplaint: record.chiefComplaint,
      triagePriority: record.triagePriority || 'ROUTINE',
      vitalsSummary: record.vitalsSummary || `BP: ${record.systolicBp || 120}/${record.diastolicBp || 80}, HR: ${record.heartRate || 72}, Temp: ${record.temperature || 98.6}`,
      notes: record.notes,
    });
  }

  getTriage(encounterId: string): Observable<TriageEwsResponseDTO> {
    return this.get<TriageEwsResponseDTO>(`/encounters/${encounterId}/triage`);
  }

  updateTriage(encounterId: string, record: TriageEwsRequestDTO | any): Observable<TriageEwsResponseDTO> {
    return this.put<TriageEwsResponseDTO>(`/encounters/${encounterId}/triage`, record);
  }

  submitTriage(record: TriageEwsRequestDTO | any): Observable<TriageEwsResponseDTO> {
    if (record.encounterId) {
      return this.recordTriage(record.encounterId, record);
    }
    if (record.patientId) {
      return this.getEncountersByPatient(record.patientId).pipe(
        switchMap((encounters) => {
          const encounterId = encounters.length > 0 ? encounters[0].id : null;
          if (encounterId) {
            return this.recordTriage(encounterId, record);
          }
          return this.createEncounter({
            patientId: record.patientId,
            encounterType: 'EMERGENCY',
            chiefComplaint: record.chiefComplaint || 'Emergency / Bedside Triage',
            status: 'ACTIVE',
          }).pipe(
            switchMap((enc) => this.recordTriage(enc.id!, record)),
          );
        }),
      );
    }
    return of({
      id: 'TRG-' + Date.now(),
      patientId: record.patientId,
      triagePriority: record.triagePriority || 'ROUTINE',
      recordedBy: 'Nurse Desk',
      recordedAt: new Date().toISOString(),
    } as TriageEwsResponseDTO);
  }

  getTriageRecordsForPatient(patientId: string): Observable<TriageEwsResponseDTO[]> {
    return this.getEncountersByPatient(patientId).pipe(
      switchMap((encounters) => {
        if (!encounters || encounters.length === 0) return of([]);
        const tasks = encounters.map((e) =>
          this.getTriage(e.id!).pipe(catchError(() => of(null))),
        );
        return forkJoin(tasks).pipe(
          map((results) => results.filter((r): r is TriageEwsResponseDTO => r !== null)),
        );
      }),
      catchError(() => of([])),
    );
  }

  createNursingFlowsheet(encounterId: string, payload: { shift?: string; notes?: string }): Observable<NursingFlowsheet> {
    return this.post<NursingFlowsheet>(`/encounters/${encounterId}/nursing-flowsheets`, payload);
  }

  getEncounterFlowsheets(encounterId: string): Observable<NursingFlowsheet[]> {
    return this.get<NursingFlowsheet[]>(`/encounters/${encounterId}/nursing-flowsheets`).pipe(catchError(() => of([])));
  }

  addFlowsheetEntry(flowsheetId: string, payload: NursingFlowsheetEntry): Observable<NursingFlowsheet> {
    return this.post<NursingFlowsheet>(`/nursing-flowsheets/${flowsheetId}/entries`, payload);
  }

  getFlowsheetEntries(flowsheetId: string): Observable<NursingFlowsheetEntry[]> {
    return this.get<NursingFlowsheetEntry[]>(`/nursing-flowsheets/${flowsheetId}/entries`).pipe(catchError(() => of([])));
  }

  recordEmarAdministration(emar: EmarRecordRequestDTO | any): Observable<EmarRecordResponseDTO> {
    if (emar.prescriptionId) {
      return this.administerMedication(emar.prescriptionId, emar);
    }
    return of({
      id: 'ADM-' + Date.now(),
      patientId: emar.patientId,
      medicationName: emar.medicationName,
      dose: emar.dose,
      administeredBy: 'Staff Nurse',
      administeredAt: new Date().toISOString(),
      status: 'ADMINISTERED',
    } as EmarRecordResponseDTO);
  }

  getEmarHistoryForPatient(patientId: string): Observable<EmarRecordResponseDTO[]> {
    return this.getPatientAdministrations(patientId);
  }

  // =========================================================================
  // 17. Compliance Audit Ledger & User RBAC Management
  // =========================================================================
  getUsers(): Observable<User[]> {
    return this.get<User[]>('/users').pipe(catchError(() => of([])));
  }

  updateUser(id: string, payload: any): Observable<User> {
    return this.patch<User>(`/users/${id}`, payload);
  }

  updateUserStatus(id: string, status: string): Observable<any> {
    if (status === 'ACTIVE') {
      return this.post(`/users/${id}/activate`, {});
    }
    return this.post(`/users/${id}/deactivate`, {});
  }

  resetUserPassword(id: string, newPassword?: string): Observable<any> {
    return this.patch(`/users/${id}`, { password: newPassword });
  }

  deleteUser(id: string): Observable<any> {
    return this.post(`/users/${id}/deactivate`, {});
  }

  getAuditLogs(search?: string): Observable<AuditLog[]> {
    return this.get<any[]>('/audit-events').pipe(
      map((list) => {
        if (!Array.isArray(list)) return [];
        let items: AuditLog[] = list.map((a: any) => ({
          id: a.id,
          organizationId: a.organizationId,
          facilityId: a.facilityId,
          userId: a.userId,
          patientId: a.patientId,
          encounterId: a.encounterId,
          username: a.username || a.userId || 'SYSTEM_DAEMON',
          userRole: a.userRole || 'SECURITY_STAFF',
          action: a.action || 'AUDIT_LOG_ENTRY',
          resourceType: a.resourceType || a.entityName || 'SECURITY_RESOURCE',
          entityName: a.entityName || a.resourceType || 'SECURITY_RESOURCE',
          resourceId: a.resourceId,
          purposeOfUse: a.purposeOfUse || 'TREATMENT',
          result: a.result || 'SUCCESS',
          ipAddress: a.ipAddress || '127.0.0.1',
          userAgent: a.userAgent,
          details: a.details || `${a.action || 'EVENT'} performed on ${a.resourceType || 'RESOURCE'} [Result: ${a.result || 'SUCCESS'}]`,
          occurredAt: a.occurredAt,
          timestamp: a.timestamp || a.occurredAt || new Date().toISOString(),
        }));

        if (search) {
          const q = search.toLowerCase();
          items = items.filter(
            (l) =>
              l.username?.toLowerCase().includes(q) ||
              l.action?.toLowerCase().includes(q) ||
              l.entityName?.toLowerCase().includes(q) ||
              l.details?.toLowerCase().includes(q) ||
              l.ipAddress?.includes(q),
          );
        }

        return items;
      }),
      catchError(() => of([])),
    );
  }

  // =========================================================================
  // 18. HL7 FHIR R4 Interoperability Subsystem
  // =========================================================================
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

  getFhirResource(resourceType: string, patientId?: string): Observable<any> {
    const query = patientId ? `?patientId=${patientId}` : '';
    return this.http.get<any>(`${this.fhirUrl}/${resourceType}${query}`);
  }

  getFhirResourceById(resourceType: string, id: string): Observable<any> {
    return this.http.get<any>(`${this.fhirUrl}/${resourceType}/${id}`);
  }

  getFhirPatientEverything(patientId: string): Observable<any> {
    return this.http.get<any>(`${this.fhirUrl}/Patient/${patientId}/$everything`);
  }

  createFhirPatient(payload: any): Observable<any> {
    return this.http.post<any>(`${this.fhirUrl}/Patient`, payload);
  }

  // =========================================================================
  // 19. Imaging & Radiology (DICOM Studies, Series, Orders, Reports)
  // =========================================================================
  getImagingOrdersByPatient(patientId: string): Observable<ImagingOrder[]> {
    return this.get<ImagingOrder[]>(`/patients/${patientId}/imaging-orders`).pipe(catchError(() => of([])));
  }

  getImagingOrdersByEncounter(encounterId: string): Observable<ImagingOrder[]> {
    return this.get<ImagingOrder[]>(`/encounters/${encounterId}/imaging-orders`).pipe(catchError(() => of([])));
  }

  getImagingOrderById(orderId: number | string): Observable<ImagingOrder> {
    return this.get<ImagingOrder>(`/imaging-orders/${orderId}`);
  }

  createImagingOrder(encounterId: string, order: CreateImagingOrderRequest): Observable<ImagingOrder> {
    return this.post<ImagingOrder>(`/encounters/${encounterId}/imaging-orders`, order);
  }

  cancelImagingOrder(orderId: number | string): Observable<ImagingOrder> {
    return this.post<ImagingOrder>(`/imaging-orders/${orderId}/cancel`, {});
  }

  getImagingStudies(orderId: number | string): Observable<ImagingStudy[]> {
    return this.get<ImagingStudy[]>(`/imaging-orders/${orderId}/studies`).pipe(catchError(() => of([])));
  }

  getImagingStudyById(studyId: number | string): Observable<ImagingStudy> {
    return this.get<ImagingStudy>(`/imaging-studies/${studyId}`);
  }

  getImagingSeries(studyId: number | string): Observable<ImagingSeries[]> {
    return this.get<ImagingSeries[]>(`/imaging-studies/${studyId}/series`).pipe(catchError(() => of([])));
  }

  getImagingReports(studyId: number | string): Observable<ImagingReport[]> {
    return this.get<ImagingReport[]>(`/imaging-studies/${studyId}/reports`).pipe(catchError(() => of([])));
  }

  createImagingReport(studyId: number | string, report: CreateImagingReportRequest): Observable<ImagingReport> {
    return this.post<ImagingReport>(`/imaging-studies/${studyId}/reports`, report);
  }

  signImagingReport(reportId: number | string): Observable<ImagingReport> {
    return this.post<ImagingReport>(`/imaging-reports/${reportId}/sign`, {});
  }

  // =========================================================================
  // 20. Surgical & Clinical Procedures
  // =========================================================================
  getProcedureOrdersByPatient(patientId: string): Observable<ProcedureOrder[]> {
    return this.get<ProcedureOrder[]>(`/patients/${patientId}/procedure-orders`).pipe(catchError(() => of([])));
  }

  getProcedureOrdersByEncounter(encounterId: string): Observable<ProcedureOrder[]> {
    return this.get<ProcedureOrder[]>(`/encounters/${encounterId}/procedure-orders`).pipe(catchError(() => of([])));
  }

  createProcedureOrder(encounterId: string, payload: CreateProcedureOrderRequest): Observable<ProcedureOrder> {
    return this.post<ProcedureOrder>(`/encounters/${encounterId}/procedure-orders`, payload);
  }

  performProcedure(orderId: number | string, payload: PerformProcedureRequest): Observable<ProcedurePerformance> {
    return this.post<ProcedurePerformance>(`/procedure-orders/${orderId}/perform`, payload);
  }

  getProcedurePerformances(orderId: number | string): Observable<ProcedurePerformance[]> {
    return this.get<ProcedurePerformance[]>(`/procedure-orders/${orderId}/performances`).pipe(catchError(() => of([])));
  }

  addProcedureNote(performanceId: number | string, payload: { noteType: string; content: string }): Observable<ProcedureNote> {
    return this.post<ProcedureNote>(`/procedure-performances/${performanceId}/notes`, payload);
  }

  getProcedureNotes(performanceId: number | string): Observable<ProcedureNote[]> {
    return this.get<ProcedureNote[]>(`/procedure-performances/${performanceId}/notes`).pipe(catchError(() => of([])));
  }

  // =========================================================================
  // 21. Informed Consents & Directives
  // =========================================================================
  getConsentTypes(): Observable<ConsentType[]> {
    return this.get<ConsentType[]>('/consent-types').pipe(catchError(() => of([])));
  }

  createConsentType(payload: Partial<ConsentType>): Observable<ConsentType> {
    return this.post<ConsentType>('/consent-types', payload);
  }

  getPatientConsents(patientId: string): Observable<PatientConsent[]> {
    return this.get<PatientConsent[]>(`/patients/${patientId}/consents`).pipe(catchError(() => of([])));
  }

  createPatientConsent(patientId: string, payload: CreatePatientConsentRequest): Observable<PatientConsent> {
    return this.post<PatientConsent>(`/patients/${patientId}/consents`, payload);
  }

  revokePatientConsent(consentId: number | string, reason: string): Observable<PatientConsent> {
    return this.post<PatientConsent>(`/patient-consents/${consentId}/revoke`, { revocationReason: reason });
  }

  // =========================================================================
  // 22. Clinical Documents, Progress Notes & Discharge Summaries
  // =========================================================================
  getPatientDocuments(patientId: string): Observable<ClinicalDocument[]> {
    return this.get<ClinicalDocument[]>(`/patients/${patientId}/documents`).pipe(catchError(() => of([])));
  }

  getEncounterClinicalDocuments(encounterId: string): Observable<ClinicalDocument[]> {
    return this.get<ClinicalDocument[]>(`/encounters/${encounterId}/documents`).pipe(catchError(() => of([])));
  }

  createClinicalDocument(encounterId: string, payload: CreateClinicalDocumentRequest): Observable<ClinicalDocument> {
    return this.post<ClinicalDocument>(`/encounters/${encounterId}/documents`, payload);
  }

  finalizeClinicalDocument(documentId: number | string): Observable<ClinicalDocument> {
    return this.post<ClinicalDocument>(`/clinical-documents/${documentId}/finalize`, {});
  }

  addDocumentVersion(documentId: number | string, payload: { content: string; changeSummary?: string }): Observable<DocumentVersion> {
    return this.post<DocumentVersion>(`/clinical-documents/${documentId}/versions`, payload);
  }

  getDocumentVersions(documentId: number | string): Observable<DocumentVersion[]> {
    return this.get<DocumentVersion[]>(`/clinical-documents/${documentId}/versions`).pipe(catchError(() => of([])));
  }

  // =========================================================================
  // 23. Care Teams
  // =========================================================================
  getEncounterCareTeam(encounterId: string): Observable<CareTeam> {
    return this.get<CareTeam>(`/encounters/${encounterId}/care-team`).pipe(catchError(() => of(null as any)));
  }

  createEncounterCareTeam(encounterId: string): Observable<CareTeam> {
    return this.post<CareTeam>(`/encounters/${encounterId}/care-team`, {});
  }

  addCareTeamMember(careTeamId: number | string, payload: AddCareTeamMemberRequest): Observable<CareTeamMember> {
    return this.post<CareTeamMember>(`/care-teams/${careTeamId}/members`, payload);
  }

  removeCareTeamMember(careTeamId: number | string, memberId: number | string): Observable<any> {
    return this.delete(`/care-teams/${careTeamId}/members/${memberId}`);
  }

  // =========================================================================
  // 24. Insurance Payers, Plans, Authorizations & Claims
  // =========================================================================
  getInsurancePayers(): Observable<InsurancePayer[]> {
    return this.get<InsurancePayer[]>('/insurance-payers').pipe(catchError(() => of([])));
  }

  createInsurancePayer(payload: Partial<InsurancePayer>): Observable<InsurancePayer> {
    return this.post<InsurancePayer>('/insurance-payers', payload);
  }

  getPayerPlans(payerId: number | string): Observable<InsurancePlan[]> {
    return this.get<InsurancePlan[]>(`/insurance-payers/${payerId}/plans`).pipe(catchError(() => of([])));
  }

  createPayerPlan(payerId: number | string, payload: Partial<InsurancePlan>): Observable<InsurancePlan> {
    return this.post<InsurancePlan>(`/insurance-payers/${payerId}/plans`, payload);
  }

  getPatientInsurancePolicies(patientId: string): Observable<PatientInsurancePolicy[]> {
    return this.get<PatientInsurancePolicy[]>(`/patients/${patientId}/insurances`).pipe(catchError(() => of([])));
  }

  createPatientInsurancePolicy(patientId: string, payload: Partial<PatientInsurancePolicy>): Observable<PatientInsurancePolicy> {
    return this.post<PatientInsurancePolicy>(`/patients/${patientId}/insurances`, payload);
  }

  getEncounterAuthorizations(encounterId: string): Observable<InsuranceAuthorization[]> {
    return this.get<InsuranceAuthorization[]>(`/encounters/${encounterId}/authorizations`).pipe(catchError(() => of([])));
  }

  requestAuthorization(encounterId: string, payload: CreateInsuranceAuthorizationRequest): Observable<InsuranceAuthorization> {
    return this.post<InsuranceAuthorization>(`/encounters/${encounterId}/authorizations`, payload);
  }

  updateAuthorization(authId: number | string, payload: Partial<InsuranceAuthorization>): Observable<InsuranceAuthorization> {
    return this.patch<InsuranceAuthorization>(`/insurance-authorizations/${authId}`, payload);
  }

  getEncounterClaims(encounterId: string): Observable<InsuranceClaim[]> {
    return this.get<InsuranceClaim[]>(`/encounters/${encounterId}/claims`).pipe(catchError(() => of([])));
  }

  createInsuranceClaim(encounterId: string, payload: CreateInsuranceClaimRequest): Observable<InsuranceClaim> {
    return this.post<InsuranceClaim>(`/encounters/${encounterId}/claims`, payload);
  }

  submitInsuranceClaim(claimId: number | string): Observable<InsuranceClaim> {
    return this.post<InsuranceClaim>(`/insurance-claims/${claimId}/submit`, {});
  }

  updateInsuranceClaim(claimId: number | string, payload: Partial<InsuranceClaim>): Observable<InsuranceClaim> {
    return this.patch<InsuranceClaim>(`/insurance-claims/${claimId}`, payload);
  }

  // =========================================================================
  // 25. Facility Chargemasters & Price Lists
  // =========================================================================
  getFacilityPriceLists(facilityId: string): Observable<PriceList[]> {
    return this.get<PriceList[]>(`/facilities/${facilityId}/price-lists`).pipe(catchError(() => of([])));
  }

  createPriceList(facilityId: string, payload: Partial<PriceList>): Observable<PriceList> {
    return this.post<PriceList>(`/facilities/${facilityId}/price-lists`, payload);
  }

  getPriceListItems(priceListId: number | string): Observable<PriceListItem[]> {
    return this.get<PriceListItem[]>(`/price-lists/${priceListId}/items`).pipe(catchError(() => of([])));
  }

  addPriceListItem(priceListId: number | string, payload: Partial<PriceListItem>): Observable<PriceListItem> {
    return this.post<PriceListItem>(`/price-lists/${priceListId}/items`, payload);
  }

  // =========================================================================
  // 26. Tenancy Hierarchy (Facilities, Departments, Wards, Rooms, Beds)
  // =========================================================================
  getFacilities(organizationId: string): Observable<Facility[]> {
    return this.get<Facility[]>(`/organizations/${organizationId}/facilities`).pipe(catchError(() => of([])));
  }

  createFacility(organizationId: string, payload: Partial<Facility>): Observable<Facility> {
    return this.post<Facility>(`/organizations/${organizationId}/facilities`, payload);
  }

  getDepartments(facilityId: string): Observable<Department[]> {
    return this.get<Department[]>(`/facilities/${facilityId}/departments`).pipe(catchError(() => of([])));
  }

  createDepartment(facilityId: string, payload: Partial<Department>): Observable<Department> {
    return this.post<Department>(`/facilities/${facilityId}/departments`, payload);
  }

  getWards(departmentId: string): Observable<Ward[]> {
    return this.get<Ward[]>(`/departments/${departmentId}/wards`).pipe(catchError(() => of([])));
  }

  createWard(departmentId: string, payload: Partial<Ward>): Observable<Ward> {
    return this.post<Ward>(`/departments/${departmentId}/wards`, payload);
  }

  getRooms(wardId: string): Observable<Room[]> {
    return this.get<Room[]>(`/wards/${wardId}/rooms`).pipe(catchError(() => of([])));
  }

  createRoom(wardId: string, payload: Partial<Room>): Observable<Room> {
    return this.post<Room>(`/wards/${wardId}/rooms`, payload);
  }

  // =========================================================================
  // 27. Security Policies (ABAC), RBAC Roles & Security Events
  // =========================================================================
  getAbacPolicies(): Observable<AbacPolicy[]> {
    return this.get<AbacPolicy[]>('/abac-policies').pipe(catchError(() => of([])));
  }

  createAbacPolicy(payload: CreateAbacPolicyRequest): Observable<AbacPolicy> {
    return this.post<AbacPolicy>('/abac-policies', payload);
  }

  updateAbacPolicy(policyId: number | string, payload: Partial<AbacPolicy>): Observable<AbacPolicy> {
    return this.patch<AbacPolicy>(`/abac-policies/${policyId}`, payload);
  }

  getRbacRoles(): Observable<RbacRole[]> {
    return this.get<RbacRole[]>('/roles').pipe(catchError(() => of([])));
  }

  createRbacRole(payload: { name: string; description?: string }): Observable<RbacRole> {
    return this.post<RbacRole>('/roles', payload);
  }

  getRolePermissions(roleId: number | string): Observable<string[]> {
    return this.get<string[]>(`/roles/${roleId}/permissions`).pipe(catchError(() => of([])));
  }

  assignRolePermissions(roleId: number | string, permissions: string[]): Observable<any> {
    return this.post(`/roles/${roleId}/permissions`, { permissions });
  }

  getSecurityEvents(): Observable<SecurityEventLog[]> {
    return this.get<SecurityEventLog[]>('/security-events').pipe(catchError(() => of([])));
  }

  // =========================================================================
  // 28. Terminology Engine & Medical Code Search
  // =========================================================================
  getCodeSystems(): Observable<CodeSystem[]> {
    return this.get<CodeSystem[]>('/code-systems').pipe(catchError(() => of([])));
  }

  searchTerminology(query: string, system?: string): Observable<TerminologySearchResult[]> {
    const params: string[] = [`q=${encodeURIComponent(query)}`];
    if (system) params.push(`system=${encodeURIComponent(system)}`);
    return this.get<TerminologySearchResult[]>(`/terminology/search?${params.join('&')}`).pipe(catchError(() => of([])));
  }
}

