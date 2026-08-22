import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of, forkJoin, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { User, UserUpdateRequestDTO, OrganizationContextDTO } from '../models/auth-user.model';
import {
  Patient,
  PatientClinicalHistoryDTO,
  BreakGlassRecord,
  BreakGlassRequestDTO,
  MPIMatchCandidateDTO,
  MPIMergeRequestDTO,
  EmergencyContact,
  PatientAddress,
  PatientDemographics,
  PatientMedicalHistory,
  PatientSocialHistory,
  PatientDietaryHistory,
  PatientInsurancePolicy,
  InpatientAdmissionRecord,
  InpatientDischargeRecord,
  InpatientTransferRecord,
} from '../models/patient.model';
import {
  CareEpisode,
  EncounterParticipant,
  EmergencyDispositionRequest,
  Encounter,
  Allergy,
  Diagnosis,
  MedicalRecord,
  Vitals,
  Prescription,
  SafetyCheckResult,
  AdmissionRequest,
  AdmissionResponseDTO,
} from '../models/clinical.model';
import {
  Appointment,
  AppointmentRequestDTO,
  AppointmentCheckInRequestDTO,
  AppointmentTriageRequestDTO,
  AppointmentConsultRequestDTO,
  AppointmentCancelRequestDTO,
  AppointmentRescheduleRequestDTO,
  AppointmentNoShowRequestDTO,
  ScheduleSlot,
  AppointmentBilling,
  AppointmentCancellation,
  AppointmentLabOrder,
  AppointmentNote,
  DoctorRecommendationDTO,
  PractitionerDTO,
  PractitionerOrgInfo,
  PractitionerSpecialtyInfo,
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
import {
  EligibilityInquiryDTO,
  EligibilityResponseDTO,
  CopayCollectionDTO,
} from '../models/billing-eligibility.model';
import { AuditLog } from '../models/audit.model';
import {
  ImagingOrder,
  ImagingStudy,
  ImagingSeries,
  ImagingReport,
  CreateImagingOrderRequest,
  CreateImagingReportRequest,
} from '../models/imaging.model';
import {
  ProcedureOrder,
  ProcedurePerformance,
  ProcedureNote,
  ProcedureParticipant,
  CreateProcedureOrderRequest,
  PerformProcedureRequest,
} from '../models/procedure.model';
import {
  ConsentType,
  PatientConsent,
  CreatePatientConsentRequest,
  RevokeConsentRequest,
} from '../models/consent.model';
import {
  ClinicalDocument,
  DocumentVersion,
  DocumentLink,
  CreateClinicalDocumentRequest,
} from '../models/document.model';
import {
  InsurancePayer,
  InsurancePlan,
  InsuranceAuthorization,
  InsuranceClaim,
  ClaimItem,
  CreateInsuranceClaimRequest,
  CreateInsuranceAuthorizationRequest,
} from '../models/insurance.model';
import { CodeSystem, TerminologyCode, TerminologySearchResult } from '../models/terminology.model';
import {
  AbacPolicy,
  RbacRole,
  SecurityEventLog,
  CreateAbacPolicyRequest,
} from '../models/security-policy.model';
import { CareTeam, CareTeamMember, AddCareTeamMemberRequest } from '../models/care-team.model';
import {
  Department,
  Ward,
  Room,
  BedDetail,
  PriceList,
  PriceListItem,
} from '../models/tenancy.model';
import {
  MedicationOrder,
  MedicationBatch,
  InventoryItem,
  MedicationCatalogItem,
  StockReceiptDTO,
  StockAdjustmentDTO,
  DispensationRecord,
  PharmacySafetyEvaluation,
} from '../models/pharmacy.model';
import {
  BillingAccount,
  ChargeItem,
  Invoice,
  InvoiceItem,
  Payment,
  RefundRequestDTO,
} from '../models/billing.model';
import { Organization } from '../models/organization.model';
import {
  FhirBundle,
  FhirResource,
  FhirCapabilityStatement,
  FhirPatient,
} from '../models/fhir.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

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
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    return this.http.get<any>(url).pipe(map((res) => this.unwrap<T>(res)));
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    return this.http.post<any>(url, body).pipe(map((res) => this.unwrap<T>(res)));
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    return this.http.put<any>(url, body).pipe(map((res) => this.unwrap<T>(res)));
  }

  patch<T>(endpoint: string, body: any): Observable<T> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    return this.http.patch<any>(url, body).pipe(map((res) => this.unwrap<T>(res)));
  }

  delete<T>(endpoint: string): Observable<T> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    return this.http.delete<any>(url).pipe(map((res) => this.unwrap<T>(res)));
  }

  // =========================================================================
  // 1. Patients (Demographics & Identity)
  // =========================================================================
  getPatients(): Observable<Patient[]> {
    return this.get<Patient[]>('/patients/search').pipe(
      map((list) => (Array.isArray(list) ? list.map((p) => this.normalizePatient(p)) : [])),
    );
  }

  searchPatients(query: string): Observable<Patient[]> {
    return this.get<Patient[]>(`/patients/search?query=${encodeURIComponent(query || '')}`).pipe(
      map((list) => (Array.isArray(list) ? list.map((p) => this.normalizePatient(p)) : [])),
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

  getPatientClinicalHistory(id: string): Observable<PatientClinicalHistoryDTO> {
    return this.get<PatientClinicalHistoryDTO>(`/patients/${id}/clinical-history`).pipe(
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
    return this.get<any>('/patients/me').pipe(
      map((res: any) => (res && res.data ? res.data : res)),
      map((p) => this.normalizePatient(p)),
      switchMap((p) => this.enrichPatientProfile(p)),
      catchError(() => {
        let storedUser: any = null;
        try {
          const raw = localStorage.getItem('sentinel_user');
          if (raw) storedUser = JSON.parse(raw);
          if (storedUser && storedUser.data) storedUser = storedUser.data;
        } catch (e) {
          console.warn('Could not parse stored sentinel_user', e);
        }

        const assignedId =
          storedUser?.assignedPatientIds && storedUser.assignedPatientIds.length > 0
            ? storedUser.assignedPatientIds[0]
            : storedUser?.patientId;

        if (assignedId) {
          return this.getPatientById(assignedId).pipe(
            switchMap((p) => this.enrichPatientProfile(p)),
            catchError(() => this.searchPatients(storedUser?.fullName || storedUser?.email || '').pipe(
              switchMap((list) => list.length > 0 ? this.enrichPatientProfile(list[0]) : throwError(() => new Error('No patient found'))),
            )),
          );
        }

        const searchKey = storedUser?.fullName || storedUser?.email || '';
        return this.searchPatients(searchKey).pipe(
          switchMap((patients) => {
            if (patients && patients.length > 0) {
              return this.enrichPatientProfile(patients[0]);
            }
            return this.getPatients().pipe(
              switchMap((all) => {
                if (all && all.length > 0) {
                  return this.enrichPatientProfile(all[0]);
                }
                return throwError(() => new Error('No patient chart record found.'));
              }),
            );
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
    return this.post<Patient>('/patients', patient).pipe(map((p) => this.normalizePatient(p)));
  }

  submitIntake(patient: Partial<Patient>): Observable<Patient> {
    return this.post<Patient>('/patients', patient).pipe(map((p) => this.normalizePatient(p)));
  }

  updatePatient(id: string, patient: Partial<Patient>): Observable<Patient> {
    return this.patch<Patient>(`/patients/${id}`, patient).pipe(
      switchMap((updated) => {
        const tasks: Observable<unknown>[] = [];

        if (
          patient.bloodGroup ||
          patient.rhFactor ||
          patient.maritalStatus ||
          patient.preferredLanguage
        ) {
          tasks.push(
            this.updatePatientDemographics(id, {
              bloodGroup: patient.bloodGroup || patient.bloodType,
              rhFactor: patient.rhFactor || 'POSITIVE',
              maritalStatus: patient.maritalStatus,
              preferredLanguage: patient.preferredLanguage,
              ethnicity: patient.ethnicity,
              race: patient.race,
              genderIdentity: patient.genderIdentity,
            }),
          );
        }

        if (patient.emergencyContact && patient.emergencyContact.name) {
          tasks.push(
            this.savePatientEmergencyContact(id, patient.emergencyContact).pipe(

            ),
          );
        }

        if (patient.address) {
          tasks.push(
            this.savePatientAddress(id, { addressLine1: patient.address, isPrimary: true }).pipe(

            ),
          );
        }

        if (patient.pastMedicalHistory || patient.seriousConditions) {
          tasks.push(
            this.savePatientMedicalHistory(id, {
              condition: patient.pastMedicalHistory || patient.seriousConditions,
              notes: patient.seriousConditions,
            }),
          );
        }

        if (patient.smokingStatus || patient.alcoholConsumption || patient.exerciseRoutine) {
          tasks.push(
            this.updatePatientSocialHistory(id, {
              smokingStatus: patient.smokingStatus,
              alcoholConsumption: patient.alcoholConsumption,
              exerciseRoutine: patient.exerciseRoutine,
            }),
          );
        }

        if (patient.dietaryHabits || patient.foodAllergies) {
          tasks.push(
            this.updatePatientDietaryHistory(id, {
              dietType: patient.dietaryHabits,
              restrictions: patient.foodAllergies,
              notes: patient.foodAllergies,
            }),
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
      map((list) =>
        Array.isArray(list)
          ? list.map((c) => ({
            id: c.id,
            name: c.name,
            relationship: c.relationship,
            phone: c.phone,
            alternatePhone: c.altPhone,
            email: c.email,
            isPrimary: c.isPrimary,
          }))
          : [],
      ),
    );
  }

  savePatientEmergencyContact(
    patientId: string,
    contact: EmergencyContact,
  ): Observable<EmergencyContact> {
    if (contact.id) {
      return this.patch<EmergencyContact>(`/emergency-contacts/${contact.id}`, {
        name: contact.name,
        relationship: contact.relationship,
        phone: contact.phone,
        altPhone: contact.alternatePhone,
        email: contact.email,
        isPrimary: contact.isPrimary ?? true,
      });
    }
    return this.post<EmergencyContact>(`/patients/${patientId}/emergency-contacts`, {
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      altPhone: contact.alternatePhone,
      email: contact.email,
      isPrimary: contact.isPrimary ?? true,
    });
  }

  getPatientAddresses(patientId: string): Observable<PatientAddress[]> {
    return this.get<PatientAddress[]>(`/patients/${patientId}/addresses`).pipe(
      map((list) => (Array.isArray(list) ? list : [])),
    );
  }

  savePatientAddress(patientId: string, address: PatientAddress): Observable<PatientAddress> {
    if (address.id) {
      return this.patch<PatientAddress>(`/patient-addresses/${address.id}`, address);
    }
    return this.post<PatientAddress>(`/patients/${patientId}/addresses`, address);
  }

  getPatientDemographics(patientId: string): Observable<PatientDemographics | null> {
    return this.get<PatientDemographics>(`/patients/${patientId}/demographics`).pipe(
    );
  }

  updatePatientDemographics(
    patientId: string,
    demographics: PatientDemographics,
  ): Observable<PatientDemographics> {
    return this.put<PatientDemographics>(`/patients/${patientId}/demographics`, demographics);
  }

  getPatientMedicalHistory(patientId: string): Observable<PatientMedicalHistory | null> {
    return this.get<PatientMedicalHistory>(`/patients/${patientId}/medical-history`).pipe(
    );
  }

  savePatientMedicalHistory(
    patientId: string,
    history: PatientMedicalHistory,
  ): Observable<PatientMedicalHistory> {
    return this.post<PatientMedicalHistory>(`/patients/${patientId}/medical-history`, history);
  }

  getPatientSocialHistory(patientId: string): Observable<PatientSocialHistory | null> {
    return this.get<PatientSocialHistory>(`/patients/${patientId}/social-history`).pipe(
    );
  }

  updatePatientSocialHistory(
    patientId: string,
    social: PatientSocialHistory,
  ): Observable<PatientSocialHistory> {
    return this.put<PatientSocialHistory>(`/patients/${patientId}/social-history`, social);
  }

  getPatientDietaryHistory(patientId: string): Observable<PatientDietaryHistory | null> {
    return this.get<PatientDietaryHistory>(`/patients/${patientId}/dietary-history`).pipe(
    );
  }

  updatePatientDietaryHistory(
    patientId: string,
    dietary: PatientDietaryHistory,
  ): Observable<PatientDietaryHistory> {
    return this.put<PatientDietaryHistory>(`/patients/${patientId}/dietary-history`, dietary);
  }

  getPatientInsurances(patientId: string): Observable<PatientInsurancePolicy[]> {
    return this.get<PatientInsurancePolicy[]>(`/patients/${patientId}/insurances`).pipe(
      map((list) => (Array.isArray(list) ? list : [])),
    );
  }

  addPatientInsurance(
    patientId: string,
    insurance: PatientInsurancePolicy,
  ): Observable<PatientInsurancePolicy> {
    return this.post<PatientInsurancePolicy>(`/patients/${patientId}/insurances`, insurance);
  }

  private normalizePatient(p: any): Patient {
    if (!p) return p;
    return {
      ...p,
      patientCode: p.patientCode || p.mrn,
      bloodGroup: p.bloodGroup || p.bloodType,
      fullName: p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || undefined,
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
        enriched.patientCode = enriched.patientCode || enriched.mrn || "";
        enriched.bloodType = enriched.bloodType || enriched.bloodGroup || res.demographics?.bloodGroup;
        enriched.bloodGroup = enriched.bloodGroup || res.demographics?.bloodGroup || enriched.bloodType;
        enriched.rhFactor = enriched.rhFactor || res.demographics?.rhFactor;

        if (res.contacts && res.contacts.length > 0) {
          enriched.emergencyContact = res.contacts[0];
          enriched.emergencyContacts = res.contacts;
        }

        if (res.addresses && res.addresses.length > 0) {
          const addr = res.addresses[0];
          enriched.address =
            enriched.address ||
            [addr.addressLine1, addr.city, addr.state, addr.postalCode].filter(Boolean).join(', ');
          enriched.state = enriched.state || addr.state;
          enriched.pinCode = enriched.pinCode || addr.postalCode;
        }

        if (res.insurances && res.insurances.length > 0) {
          const ins = res.insurances[0];
          enriched.insuranceProvider =
            enriched.insuranceProvider ||
            ins.payerName ||
            ins.insuranceProvider;
          enriched.insurancePolicyNumber =
            enriched.insurancePolicyNumber || ins.policyNumber || ins.memberId;
          enriched.insuranceGroupNumber = enriched.insuranceGroupNumber || ins.groupNumber;
          enriched.coveragePlan = enriched.coveragePlan || ins.planType || ins.coveragePlan;
        }

        if (res.medicalHistory) {
          enriched.pastMedicalHistory =
            enriched.pastMedicalHistory ||
            res.medicalHistory.pastMedicalHistory ||
            res.medicalHistory.condition ||
            res.medicalHistory.diagnosis;
          enriched.seriousConditions = enriched.seriousConditions || res.medicalHistory.notes;
          enriched.surgeriesAndProcedures =
            enriched.surgeriesAndProcedures ||
            res.medicalHistory.pastSurgicalHistory ||
            res.medicalHistory.surgeriesAndProcedures;
          enriched.familyMedicalHistory =
            enriched.familyMedicalHistory ||
            res.medicalHistory.familyHistory ||
            res.medicalHistory.familyMedicalHistory;
        }

        if (res.socialHistory) {
          enriched.smokingStatus = enriched.smokingStatus || res.socialHistory.smokingStatus;
          enriched.alcoholConsumption =
            enriched.alcoholConsumption ||
            res.socialHistory.alcoholStatus ||
            res.socialHistory.alcoholConsumption;
          enriched.exerciseRoutine =
            enriched.exerciseRoutine ||
            res.socialHistory.exerciseFrequency ||
            res.socialHistory.exerciseRoutine;
        }

        if (res.dietaryHistory) {
          enriched.dietaryHabits =
            enriched.dietaryHabits ||
            res.dietaryHistory.dietType ||
            res.dietaryHistory.dietaryHabits;
          enriched.foodAllergies =
            enriched.foodAllergies ||
            res.dietaryHistory.dietaryRestrictions ||
            res.dietaryHistory.restrictions ||
            res.dietaryHistory.foodAllergies;
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
  // 4. Care Episodes & Clinical Encounters (Unified Care Foundation)
  // =========================================================================
  getCareEpisodes(patientId?: string): Observable<CareEpisode[]> {
    if (patientId) {
      return this.get<CareEpisode[]>(`/patients/${patientId}/care-episodes`).pipe(
        map((list) => (Array.isArray(list) ? list : [])),
      );
    }
    return this.get<CareEpisode[]>('/care-episodes/search').pipe(
      map((list) => (Array.isArray(list) ? list : [])),
    );
  }

  getCareEpisodeById(id: string): Observable<CareEpisode> {
    return this.get<CareEpisode>(`/care-episodes/${id}`);
  }

  createCareEpisode(payload: Partial<CareEpisode>): Observable<CareEpisode> {
    return this.post<CareEpisode>('/care-episodes', payload);
  }

  updateCareEpisode(id: string, payload: Partial<CareEpisode>): Observable<CareEpisode> {
    return this.patch<CareEpisode>(`/care-episodes/${id}`, payload);
  }

  closeCareEpisode(id: string, payload?: any): Observable<CareEpisode> {
    return this.post<CareEpisode>(`/care-episodes/${id}/close`, payload || {});
  }

  getCareEpisodeEncounters(episodeId: string): Observable<Encounter[]> {
    return this.get<Encounter[]>(`/care-episodes/${episodeId}/encounters`).pipe(
      map((list) => (Array.isArray(list) ? list : [])),
    );
  }

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
            chiefComplaint:
              e.chiefComplaint || e.reasonForVisit || e.reasonText || 'Clinical Consultation',
          }))
          : [],
      ),
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

  recordEmergencyDisposition(
    encounterId: string,
    payload: EmergencyDispositionRequest | any,
  ): Observable<Encounter> {
    return this.post<Encounter>(`/encounters/${encounterId}/disposition`, payload);
  }

  getEncounterParticipants(encounterId: string): Observable<EncounterParticipant[]> {
    return this.get<EncounterParticipant[]>(`/encounters/${encounterId}/participants`).pipe(
      map((list) => (Array.isArray(list) ? list : [])),
    );
  }

  addEncounterParticipant(
    encounterId: string,
    payload: { practitionerId: string; participantRole?: string },
  ): Observable<EncounterParticipant> {
    return this.post<EncounterParticipant>(`/encounters/${encounterId}/participants`, payload);
  }

  // =========================================================================
  // 5. Inpatient Admissions, Discharges & Bed Transfers
  // =========================================================================
  admitPatient(
    encounterId: string,
    payload: {
      wardId?: string;
      roomId?: string;
      bedId?: string;
      admissionReason?: string;
      attendingPractitionerId?: string;
      admittedAt?: string;
    },
  ): Observable<InpatientAdmissionRecord> {
    return this.post<InpatientAdmissionRecord>(`/encounters/${encounterId}/admission`, payload);
  }

  getAdmission(encounterId: string): Observable<InpatientAdmissionRecord> {
    return this.get<InpatientAdmissionRecord>(`/encounters/${encounterId}/admission`);
  }

  cancelAdmission(admissionId: string): Observable<{ status: string }> {
    return this.post<{ status: string }>(`/admissions/${admissionId}/cancel`, {});
  }

  dischargePatient(
    encounterId: string,
    payload: {
      dischargeDisposition?: string;
      dischargeNotes?: string;
      followUpInstructions?: string;
      dischargedAt?: string;
    },
  ): Observable<InpatientDischargeRecord> {
    return this.post<InpatientDischargeRecord>(`/encounters/${encounterId}/discharge`, payload);
  }

  getDischarge(encounterId: string): Observable<InpatientDischargeRecord> {
    return this.get<InpatientDischargeRecord>(`/encounters/${encounterId}/discharge`);
  }

  transferPatientInpatient(
    encounterId: string,
    payload: {
      toWardId?: string;
      toRoomId?: string;
      toBedId?: string;
      transferReason?: string;
      notes?: string;
    },
  ): Observable<InpatientTransferRecord> {
    return this.post<InpatientTransferRecord>(`/encounters/${encounterId}/transfer`, payload);
  }

  getTransfers(encounterId: string): Observable<InpatientTransferRecord[]> {
    return this.get<InpatientTransferRecord[]>(`/encounters/${encounterId}/transfers`).pipe(
    );
  }

  // =========================================================================
  // 6. Bed Management
  // =========================================================================
  getAvailableBeds(organizationId?: string, wardId?: string): Observable<Bed[]> {
    const params: string[] = [];
    if (organizationId) params.push(`organizationId=${organizationId}`);
    if (wardId) params.push(`wardId=${wardId}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return this.get<Bed[]>(`/beds/available${query}`);
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

  transferBed(payload: {
    encounterId: string;
    newBedId: string;
    transferReason?: string;
  }): Observable<LocationHistory> {
    return this.transferPatientInpatient(payload.encounterId, {
      toBedId: payload.newBedId,
      transferReason: payload.transferReason,
    });
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

  getBreakGlassByUser(email: string): Observable<BreakGlassRecord[]> {
    return this.get<BreakGlassRecord[]>(`/break-glass/user/${email}`);
  }

  // =========================================================================
  // 8. Laboratory Orders, Results & Specimens
  // =========================================================================
  getLabOrdersList(
    patientId?: string,
    encounterId?: string,
    status?: string,
    search?: string,
  ): Observable<LabOrder[]> {
    if (patientId) {
      return this.get<LabOrder[]>(`/patients/${patientId}/lab-orders`).pipe(

      );
    }
    if (encounterId) {
      return this.get<LabOrder[]>(`/encounters/${encounterId}/lab-orders`).pipe(

      );
    }
    const params: string[] = [];
    if (status && status !== 'ALL') params.push(`status=${encodeURIComponent(status)}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    const qs = params.length > 0 ? `?${params.join('&')}` : '';

    return this.get<LabOrder[]>(`/lab-orders${qs}`);
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
          }).pipe(switchMap((enc) => this.createLabOrder({ ...order, encounterId: enc.id })));
        }),
      );
    }

    return throwError(
      () => new Error('Patient ID or Encounter ID is required to create a lab order.'),
    );
  }

  updateLabOrder(
    id: string | number,
    payload: Partial<LabOrderStatusUpdateDTO>,
  ): Observable<LabOrder> {
    return this.patch<LabOrder>(`/lab-orders/${id}`, payload);
  }

  updateLabOrderStatus(
    id: string | number,
    status: string,
    barcode?: string,
  ): Observable<LabOrder> {
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
    return this.get<LabResult[]>(`/lab-orders/${orderId}/results`);
  }

  getPatientLabResults(patientId: string): Observable<LabResult[]> {
    return this.get<LabResult[]>(`/patients/${patientId}/lab-results`).pipe(
    );
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
    return this.get<Specimen[]>(`/lab-orders/${orderId}/specimens`);
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
            reactionDescription:
              a.reactionDescription || a.reaction || 'Documented allergic sensitivity',
            reaction: a.reaction || a.reactionDescription,
            status: a.status || 'ACTIVE',
          }))
          : [],
      ),
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
      return throwError(() => new Error('Patient ID is required to record vitals.'));
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
    );
  }

  checkPrescriptionSafety(
    patientId: string,
    medicationName: string,
  ): Observable<SafetyCheckResult> {
    return this.post<SafetyCheckResult>('/prescriptions/safety-check', {
      patientId,
      medicationName,
    });
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

  createPrescription(
    prescription: Partial<Prescription>,
    overrideWarning = false,
  ): Observable<Prescription> {
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
            switchMap((enc) =>
              this.post<Prescription>(`/encounters/${enc.id}/prescriptions`, prescription),
            ),
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

  administerMedication(
    prescriptionId: string,
    payload: {
      medicationName: string;
      dose: string;
      route?: string;
      notes?: string;
      administeredAt?: string;
    },
  ): Observable<EmarRecordResponseDTO> {
    return this.post<EmarRecordResponseDTO>(`/prescriptions/${prescriptionId}/administer`, payload);
  }

  getEncounterAdministrations(encounterId: string): Observable<EmarRecordResponseDTO[]> {
    return this.get<EmarRecordResponseDTO[]>(`/encounters/${encounterId}/administrations`).pipe(
    );
  }

  getPatientAdministrations(patientId: string): Observable<EmarRecordResponseDTO[]> {
    return this.get<EmarRecordResponseDTO[]>(`/patients/${patientId}/administrations`).pipe(
    );
  }

  // =========================================================================
  // 14. Appointments & Provider Scheduling
  // =========================================================================
  getAppointments(filters?: {
    practitionerId?: string;
    organizationId?: string;
    patientId?: string;
  }): Observable<Appointment[]> {
    const params: string[] = [];
    if (filters?.practitionerId) params.push(`practitionerId=${encodeURIComponent(filters.practitionerId)}`);
    if (filters?.organizationId) params.push(`organizationId=${encodeURIComponent(filters.organizationId)}`);
    if (filters?.patientId) params.push(`patientId=${encodeURIComponent(filters.patientId)}`);

    const queryString = params.length > 0 ? `?${params.join('&')}` : '';
    return this.get<Appointment[]>(`/appointments${queryString}`).pipe(
      map((list) => (Array.isArray(list) ? list.map((a) => this.normalizeAppointment(a)) : [])),
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
    );
  }

  getAppointmentsByOrganization(organizationId: string): Observable<Appointment[]> {
    return this.get<Appointment[]>(`/organizations/${organizationId}/appointments`).pipe(
      map((list) => (Array.isArray(list) ? list.map((a) => this.normalizeAppointment(a)) : [])),
    );
  }

  getPractitionerOrganizationAppointments(
    practitionerId: string,
    organizationId: string,
  ): Observable<Appointment[]> {
    return this.get<Appointment[]>(
      `/organizations/${organizationId}/practitioners/${practitionerId}/appointments`,
    ).pipe(
      map((list) => (Array.isArray(list) ? list.map((a) => this.normalizeAppointment(a)) : [])),
    );
  }

  getAppointmentsByPractitioner(
    practitionerId: string,
    organizationId?: string,
  ): Observable<Appointment[]> {
    const url = organizationId
      ? `/organizations/${organizationId}/practitioners/${practitionerId}/appointments`
      : `/practitioners/${practitionerId}/appointments`;
    return this.get<Appointment[]>(url).pipe(
      map((list) => (Array.isArray(list) ? list.map((a) => this.normalizeAppointment(a)) : [])),
    );
  }

  scheduleAppointment(
    appointment: AppointmentRequestDTO | Partial<Appointment>,
  ): Observable<Appointment> {
    let startsAt = appointment.appointmentDate || appointment.startsAt;
    if (startsAt) {
      try {
        const d = new Date(startsAt);
        if (!isNaN(d.getTime())) {
          startsAt = d.toISOString();
        }
      } catch (e) { }
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
      } catch (e) { }
    }

    const payload = {
      patientId: appointment.patientId,
      practitionerId: appointment.practitionerId || appointment.doctorId,
      departmentId: appointment.departmentId,
      startsAt: startsAt,
      endsAt: endsAt,
      appointmentType: appointment.appointmentType || 'CONSULTATION',
      schedulingMode: (appointment as any).schedulingMode || 'SPECIFIC_DOCTOR',
      specialtyCode: (appointment as any).specialtyCode,
      encounterType: (appointment as any).encounterType || 'OUTPATIENT',
      reason: appointment.reason || 'General Consultation',
      priority: appointment.priority || 'ROUTINE',
      notes: appointment.notes,
    };
    return this.post<Appointment>('/appointments', payload).pipe(
      map((a) => this.normalizeAppointment(a || appointment)),
    );
  }

  createAppointment(
    appointment: AppointmentRequestDTO | Partial<Appointment>,
  ): Observable<Appointment> {
    return this.scheduleAppointment(appointment);
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
    return this.patch<Appointment>(`/appointments/${id}`, {
      status: 'CHECKED_IN',
      notes: payload.notes || payload.insuranceDetails,
    }).pipe(map((a) => this.normalizeAppointment(a)));
  }

  markAppointmentNoShow(
    id: string,
    payload?: AppointmentNoShowRequestDTO,
  ): Observable<Appointment> {
    return this.patch<Appointment>(`/appointments/${id}`, { status: 'NO_SHOW', notes: payload?.notes }).pipe(
      map((a) => this.normalizeAppointment(a)),
    );
  }

  getPractitionersBySpecialty(
    specialtyCode: string,
    organizationId?: string,
  ): Observable<PractitionerDTO[]> {
    const params: string[] = [`specialtyCode=${encodeURIComponent(specialtyCode)}`];
    if (organizationId) {
      params.push(`organizationId=${encodeURIComponent(organizationId)}`);
    }
    return this.get<PractitionerDTO[]>(`/practitioners/by-specialty?${params.join('&')}`).pipe(
      map((list) => (Array.isArray(list) ? list : [])),
    );
  }

  getEncounterByAppointment(appointmentId: string): Observable<Encounter> {
    return this.get<Encounter>(`/appointments/${appointmentId}/encounter`).pipe(
    );
  }

  admitEncounter(encounterId: string, request: AdmissionRequest): Observable<Encounter> {
    return this.post<Encounter>(`/encounters/${encounterId}/admit`, request);
  }

  updateAppointmentStage(id: string, stage: string): Observable<Appointment> {
    if (stage === 'CHECKED_IN') {
      return this.checkInPatient(id);
    }
    return this.patch<Appointment>(`/appointments/${id}`, { status: stage }).pipe(
      map((a) => this.normalizeAppointment(a)),
    );
  }

  updateAppointmentStatus(id: string, status: string): Observable<Appointment> {
    if (status === 'CHECKED_IN') {
      return this.checkInPatient(id);
    }
    return this.patch<Appointment>(`/appointments/${id}`, { status }).pipe(
      map((a) => this.normalizeAppointment(a)),
    );
  }

  recordAppointmentTriage(
    id: string,
    payload: AppointmentTriageRequestDTO,
  ): Observable<Appointment> {
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
    );
  }

  recordDoctorConsultation(
    id: string,
    payload: { doctorNotes?: string; diagnoses?: any[]; prescriptions?: any[]; labOrders?: any[] },
  ): Observable<Appointment> {
    const primaryDiag =
      payload.diagnoses && payload.diagnoses.length > 0 ? payload.diagnoses[0] : null;
    const req: AppointmentConsultRequestDTO = {
      diagnosis:
        primaryDiag?.conditionName || primaryDiag?.diagnosisName || 'General Medical Consultation',
      icdCode: primaryDiag?.icdCode || 'Z00.00',
      treatmentNotes: payload.doctorNotes || 'Consultation completed successfully.',
    };
    return this.post<Appointment>(`/appointments/${id}/consult`, req).pipe(
      map((a) => this.normalizeAppointment(a)),
    );
  }

  cancelAppointment(
    id: string,
    reason: string,
    comment?: string,
  ): Observable<AppointmentCancellation> {
    const payload: AppointmentCancelRequestDTO = {
      cancellationReason: reason || 'Patient Requested',
      additionalComment: comment,
    };
    return this.post<Appointment>(`/appointments/${id}/cancel`, payload).pipe(
      map(
        (a) =>
          ({
            id: a.id,
            appointmentId: id,
            cancellationReason: reason,
            additionalComment: comment,
            cancelledAt: new Date().toISOString(),
            cancelledByRole: 'USER',
          }) as AppointmentCancellation,
      ),
    );
  }

  rescheduleAppointment(
    id: string,
    payload: AppointmentRescheduleRequestDTO,
  ): Observable<Appointment> {
    let newStartsAt = payload.newStartsAt;
    if (newStartsAt) {
      try {
        const d = new Date(newStartsAt);
        if (!isNaN(d.getTime())) {
          newStartsAt = d.toISOString();
        }
      } catch (e) { }
    }
    let newEndsAt = payload.newEndsAt;
    if (newEndsAt) {
      try {
        const d = new Date(newEndsAt);
        if (!isNaN(d.getTime())) {
          newEndsAt = d.toISOString();
        }
      } catch (e) { }
    }
    return this.post<Appointment>(`/appointments/${id}/reschedule`, {
      ...payload,
      newStartsAt,
      newEndsAt,
    }).pipe(map((a) => this.normalizeAppointment(a)));
  }

  getPractitionerSlots(
    practitionerId: string,
    start?: string,
    end?: string,
  ): Observable<ScheduleSlot[]> {
    const params: string[] = [];
    if (start) params.push(`start=${encodeURIComponent(start)}`);
    if (end) params.push(`end=${encodeURIComponent(end)}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return this.get<ScheduleSlot[]>(`/practitioners/${practitionerId}/slots${query}`).pipe(
    );
  }

  createPractitionerSlot(
    practitionerId: string,
    slot: Partial<ScheduleSlot>,
  ): Observable<ScheduleSlot> {
    return this.post<ScheduleSlot>(`/practitioners/${practitionerId}/slots`, slot);
  }

  getOrganizations(): Observable<Organization[]> {
    return this.get<Organization[]>('/organizations').pipe(
    );
  }

  getRecommendedDoctors(
    patientId?: string,
    reason?: string,
    date?: string,
    organizationId?: string,
  ): Observable<DoctorRecommendationDTO[]> {
    return this.getDoctors(organizationId).pipe(
      map((doctors: User[]) => {
        if (!doctors || doctors.length === 0) return [];

        const q = (reason || '').toLowerCase().trim();

        // Specialty keyword heuristic mapping
        const isCardio =
          /chest|heart|cardio|blood pressure|hypertension|angioplasty|palpitation|ecg|pulse|vascular/i.test(
            q,
          );
        const isNeuro =
          /headache|migraine|neuro|stroke|brain|seizure|dizziness|cervical|nerve|numbness|spinal/i.test(
            q,
          );
        const isEmer =
          /fever|cough|flu|cold|trauma|emergency|accident|burn|wound|acute|injury|gastritis|rhinitis|vomit/i.test(
            q,
          );
        const isOnco = /cancer|onco|tumor|chemo|biopsy|lump|oncology|radiation/i.test(q);
        const isRad = /x-ray|mri|ct scan|ultrasound|scan|radiology|imaging|fracture/i.test(q);

        const scored: DoctorRecommendationDTO[] = doctors.map(
          (doc: User, idx: number): DoctorRecommendationDTO => {
            const spec = (doc.specialization || doc.specialty || '').toLowerCase();
            let matchScore = 78;
            let matchReason = `Board-certified clinical specialist available for outpatient consultation.`;

            if (isCardio && spec.includes('cardio')) {
              matchScore = 98 - (idx % 2);
              matchReason = `Highest clinical alignment: Senior Cardiologist with specialized expertise in cardiovascular symptoms & diagnostics.`;
            } else if (isNeuro && spec.includes('neuro')) {
              matchScore = 98 - (idx % 2);
              matchReason = `Highest clinical alignment: Senior Neurologist specializing in headache, stroke, and neurological evaluations.`;
            } else if (isOnco && (spec.includes('onco') || spec.includes('cancer'))) {
              matchScore = 98 - (idx % 2);
              matchReason = `Highest clinical alignment: Clinical Oncologist specializing in diagnosis, therapies, and treatment plans.`;
            } else if (
              isEmer &&
              (spec.includes('emerg') || spec.includes('trauma') || spec.includes('general'))
            ) {
              matchScore = 97 - (idx % 2);
              matchReason = `Direct match: Emergency & Acute Care Specialist experienced with rapid triage and symptom resolution.`;
            } else if (isRad && spec.includes('rad')) {
              matchScore = 96 - (idx % 2);
              matchReason = `Diagnostic match: Radiologist specializing in diagnostic medical imaging review.`;
            } else if (spec.includes('general') || spec.includes('medicine')) {
              matchScore = 88;
              matchReason = `General medicine overview and initial clinical assessment.`;
            } else {
              matchScore = Math.max(72, 85 - idx * 3);
              matchReason = `Board-certified physician available for comprehensive outpatient consultation.`;
            }

            const orgList =
              doc.organizations && doc.organizations.length > 0
                ? doc.organizations.map((o: OrganizationContextDTO) => o.name || o.code).join(', ')
                : 'Sentinel Health Network';

            const specialty = doc.specialization || 'Clinical Specialist';

            return {
              doctor: doc,
              matchScore,
              specialtyFitScore: matchScore,
              continuityScore: 90,
              recommendedSpecialty: specialty,
              matchReason: `${matchReason} (Affiliated: ${orgList})`,
              verifiedLicense: true,
              recommendedSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '04:15 PM', '05:30 PM'],
            };
          },
        );

        // Sort by match score descending
        return scored.sort((a, b) => b.matchScore - a.matchScore);
      }),
    );
  }

  private normalizeAppointment(a: any): Appointment {
    if (!a) return a;
    const starts = a.startsAt || a.appointmentDate || new Date().toISOString();

    // Safely parse doctor name, avoiding emails (in case any old data remains)
    let docName = a.doctorName || a.doctor?.fullName;
    if (!docName) {
      docName = 'Attending Physician';
    } else if (!docName.startsWith('Dr.')) {
      docName = 'Dr. ' + docName;
    }

    return {
      ...a,
      appointmentDate: starts,
      startsAt: starts,
      doctorName: docName,
      doctorSpecialization:
        a.doctorSpecialization || a.doctor?.specialization || 'Clinical Medicine',
      status: a.status || 'SCHEDULED',
    };
  }

  getDoctors(organizationId?: string): Observable<User[]> {
    const hasOrgFilter = !!(organizationId && organizationId !== 'ALL');
    const query = hasOrgFilter ? `?organizationId=${encodeURIComponent(organizationId)}` : '';
    return this.get<PractitionerDTO[]>(`/practitioners${query}`).pipe(
      map((list: PractitionerDTO[]) => {
        if (Array.isArray(list) && list.length > 0) {
          const physicians = list.filter(
            (p: PractitionerDTO) => !p.practitionerType || p.practitionerType === 'PHYSICIAN',
          );
          const targetList = physicians.length > 0 ? physicians : list;
          let result: User[] = targetList.map((p: PractitionerDTO): User => {
            const rawName = p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim();
            const cleanName = rawName.replace(/^(Dr\.?\s*)+/i, '');
            const orgContexts: OrganizationContextDTO[] = (p.organizations || []).map(
              (o: PractitionerOrgInfo): OrganizationContextDTO => ({
                id: o.id,
                code: o.code,
                name: o.name,
                departments: [],
              }),
            );

            return {
              id: p.userId || p.id,
              personId: p.personId,
              email: p.email || p.identifier || cleanName.toLowerCase().replace(/\s+/g, '.'),
              fullName: `Dr. ${cleanName}`,
              specialization:
                p.primarySpecialty ||
                (p.specialties && p.specialties.length > 0
                  ? p.specialties[0].specialtyName
                  : 'General Physician'),
              specialty:
                p.primarySpecialty ||
                (p.specialties && p.specialties.length > 0
                  ? p.specialties[0].specialtyName
                  : 'General Physician'),
              organizations: orgContexts,
              roles: ['PHYSICIAN'],
              status: p.status || 'ACTIVE',
            };
          });

          if (hasOrgFilter) {
            result = result.filter((d: User) =>
              d.organizations && d.organizations.length > 0
                ? d.organizations.some(
                  (o: OrganizationContextDTO) =>
                    o.id === organizationId || o.code === organizationId,
                )
                : true,
            );
          }
          return result;
        }
        return [];
      }),
      catchError(() => {
        const userParams = ['role=PHYSICIAN'];
        if (hasOrgFilter) {
          userParams.push(`organizationId=${encodeURIComponent(organizationId!)}`);
        }
        return this.get<User[]>(`/users?${userParams.join('&')}`).pipe(
          map((list: User[]) => {
            if (Array.isArray(list)) {
              let result: User[] = list.map((u: User): User => ({
                ...u,
                fullName: u.fullName
                  ? `Dr. ${u.fullName.replace(/^(Dr\.?\s*)+/i, '')}`
                  : 'Dr. Physician',
                specialization: u.specialization || 'Clinical Medicine',
                organizations: u.organizations || [],
                roles: u.roles || ['PHYSICIAN'],
                status: u.status || 'ACTIVE',
              }));

              if (hasOrgFilter) {
                result = result.filter((d: User) =>
                  d.organizations && d.organizations.length > 0
                    ? d.organizations.some(
                      (o: OrganizationContextDTO) =>
                        o.id === organizationId || o.code === organizationId,
                    )
                    : true,
                );
              }
              return result;
            }
            return [];
          }),

        );
      }),
    );
  }

  getAppointmentNotes(id: string): Observable<AppointmentNote[]> {
    return this.get<AppointmentNote[]>(`/appointments/${id}/notes`);
  }

  addAppointmentNote(id: string, noteType: string, content: string): Observable<AppointmentNote> {
    return this.post<AppointmentNote>(`/appointments/${id}/notes`, { noteType, content });
  }

  generateBilling(id: string, payload: any): Observable<AppointmentBilling> {
    return this.post<AppointmentBilling>(`/appointments/${id}/billing`, payload);
  }

  getBillingDetails(id: string): Observable<AppointmentBilling> {
    return this.get<AppointmentBilling>(`/appointments/${id}/billing`);
  }

  // =========================================================================
  // 15. Billing, Invoices & Ledger
  // =========================================================================
  getPatientInvoices(patientId: string): Observable<Invoice[]> {
    return this.get<Invoice[]>(`/patients/${patientId}/invoices`).pipe(
    );
  }

  getPatientPayments(patientId: string): Observable<Payment[]> {
    return this.get<Payment[]>(`/patients/${patientId}/payments`).pipe(
    );
  }

  createInvoice(invoice: Partial<Invoice>): Observable<Invoice> {
    return this.post<Invoice>('/invoices', invoice);
  }

  recordPayment(payment: Partial<Payment>): Observable<Payment> {
    return this.post<Payment>(`/invoices/${payment.invoiceId || ''}/payments`, payment);
  }

  createBillingAccount(
    patientId: string,
    payload: { accountType?: string; coverageType?: string },
  ): Observable<BillingAccount> {
    return this.post<BillingAccount>(`/patients/${patientId}/billing-accounts`, payload);
  }

  getBillingAccounts(patientId: string): Observable<BillingAccount[]> {
    return this.get<BillingAccount[]>(`/patients/${patientId}/billing-accounts`).pipe(
    );
  }

  getBillingAccount(accountId: string): Observable<BillingAccount> {
    return this.get<BillingAccount>(`/billing-accounts/${accountId}`);
  }

  createAccountInvoice(accountId: string, payload: Partial<Invoice>): Observable<Invoice> {
    return this.post<Invoice>(`/billing-accounts/${accountId}/invoices`, payload);
  }

  getAccountInvoices(accountId: string): Observable<Invoice[]> {
    return this.get<Invoice[]>(`/billing-accounts/${accountId}/invoices`).pipe(
    );
  }

  getInvoice(invoiceId: string): Observable<Invoice> {
    return this.get<Invoice>(`/invoices/${invoiceId}`);
  }

  addInvoiceItem(invoiceId: string, payload: InvoiceItem): Observable<InvoiceItem> {
    return this.post<InvoiceItem>(`/invoices/${invoiceId}/items`, payload);
  }

  finalizeInvoice(invoiceId: string): Observable<Invoice> {
    return this.post<Invoice>(`/invoices/${invoiceId}/finalize`, {});
  }

  recordInvoicePayment(invoiceId: string, payload: Partial<Payment>): Observable<Payment> {
    return this.post<Payment>(`/invoices/${invoiceId}/payments`, payload);
  }

  getInvoicePayments(invoiceId: string): Observable<Payment[]> {
    return this.get<Payment[]>(`/invoices/${invoiceId}/payments`);
  }

  processRefund(paymentId: string, payload: RefundRequestDTO): Observable<Payment> {
    return this.post<Payment>(`/payments/${paymentId}/refund`, payload);
  }

  // =========================================================================
  // 16. Clinical Triage & Nursing Flowsheets
  // =========================================================================
  recordTriage(
    encounterId: string,
    record: TriageEwsRequestDTO | any,
  ): Observable<TriageEwsResponseDTO> {
    return this.post<TriageEwsResponseDTO>(`/encounters/${encounterId}/triage`, {
      chiefComplaint: record.chiefComplaint,
      triagePriority: record.triagePriority || 'ROUTINE',
      vitalsSummary:
        record.vitalsSummary ||
        `BP: ${record.systolicBp || 120}/${record.diastolicBp || 80}, HR: ${record.heartRate || 72}, Temp: ${record.temperature || 98.6}`,
      notes: record.notes,
    });
  }

  getTriage(encounterId: string): Observable<TriageEwsResponseDTO> {
    return this.get<TriageEwsResponseDTO>(`/encounters/${encounterId}/triage`);
  }

  updateTriage(
    encounterId: string,
    record: TriageEwsRequestDTO | any,
  ): Observable<TriageEwsResponseDTO> {
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
          }).pipe(switchMap((enc) => this.recordTriage(enc.id!, record)));
        }),
      );
    }
    return this.post<TriageEwsResponseDTO>('/triage', record);
  }

  getTriageRecordsForPatient(patientId: string): Observable<TriageEwsResponseDTO[]> {
    return this.getEncountersByPatient(patientId).pipe(
      switchMap((encounters) => {
        if (!encounters || encounters.length === 0) return of([]);
        const tasks = encounters.map((e) => this.getTriage(e.id!));
        return forkJoin(tasks).pipe(
          map((results) => results.filter((r): r is TriageEwsResponseDTO => r !== null)),
        );
      }),
    );
  }

  createNursingFlowsheet(
    encounterId: string,
    payload: { shift?: string; notes?: string },
  ): Observable<NursingFlowsheet> {
    return this.post<NursingFlowsheet>(`/encounters/${encounterId}/nursing-flowsheets`, payload);
  }

  getEncounterFlowsheets(encounterId: string): Observable<NursingFlowsheet[]> {
    return this.get<NursingFlowsheet[]>(`/encounters/${encounterId}/nursing-flowsheets`).pipe(
    );
  }

  addFlowsheetEntry(
    flowsheetId: string,
    payload: NursingFlowsheetEntry,
  ): Observable<NursingFlowsheet> {
    return this.post<NursingFlowsheet>(`/nursing-flowsheets/${flowsheetId}/entries`, payload);
  }

  getFlowsheetEntries(flowsheetId: string): Observable<NursingFlowsheetEntry[]> {
    return this.get<NursingFlowsheetEntry[]>(`/nursing-flowsheets/${flowsheetId}/entries`).pipe(
    );
  }

  recordEmarAdministration(emar: EmarRecordRequestDTO | any): Observable<EmarRecordResponseDTO> {
    if (emar.prescriptionId) {
      return this.administerMedication(emar.prescriptionId, emar);
    }
    return this.post<EmarRecordResponseDTO>('/administrations', emar);
  }

  getEmarHistoryForPatient(patientId: string): Observable<EmarRecordResponseDTO[]> {
    return this.getPatientAdministrations(patientId);
  }

  // =========================================================================
  // 17. Compliance Audit Ledger & User RBAC Management
  // =========================================================================
  getUsers(): Observable<User[]> {
    return this.get<User[]>('/users');
  }

  updateUser(id: string, payload: UserUpdateRequestDTO): Observable<User> {
    return this.patch<User>(`/users/${id}`, payload);
  }

  updateUserStatus(id: string, status: string): Observable<User> {
    if (status === 'ACTIVE') {
      return this.post<User>(`/users/${id}/activate`, {});
    }
    return this.post<User>(`/users/${id}/deactivate`, {});
  }

  resetUserPassword(id: string, newPassword?: string): Observable<User> {
    return this.patch<User>(`/users/${id}`, { password: newPassword });
  }

  deleteUser(id: string): Observable<User> {
    return this.post<User>(`/users/${id}/deactivate`, {});
  }

  getAuditLogs(organizationId?: string, search?: string): Observable<AuditLog[]> {
    let url = '/audit-events';
    if (organizationId) {
      url += `?organizationId=${encodeURIComponent(organizationId)}`;
    }
    return this.get<any[]>(url).pipe(
      map((list) => {
        if (!Array.isArray(list)) return [];
        let items: AuditLog[] = list.map((a: any) => ({
          id: a.id,
          organizationId: a.organizationId,
          userId: a.userId,
          patientId: a.patientId,
          encounterId: a.encounterId,
          email: a.email || a.userId || 'SYSTEM_DAEMON',
          userRole: a.userRole || 'SECURITY_STAFF',
          action: a.action || 'AUDIT_LOG_ENTRY',
          resourceType: a.resourceType || a.entityName || 'SECURITY_RESOURCE',
          entityName: a.entityName || a.resourceType || 'SECURITY_RESOURCE',
          resourceId: a.resourceId,
          purposeOfUse: a.purposeOfUse || 'TREATMENT',
          result: a.result || 'SUCCESS',
          ipAddress: a.ipAddress || '127.0.0.1',
          userAgent: a.userAgent,
          details:
            a.details ||
            `${a.action || 'EVENT'} performed on ${a.resourceType || 'RESOURCE'} [Result: ${a.result || 'SUCCESS'}]`,
          occurredAt: a.occurredAt,
          timestamp: a.timestamp || a.occurredAt || new Date().toISOString(),
        }));

        if (search) {
          const q = search.toLowerCase();
          items = items.filter(
            (l) =>
              l.email?.toLowerCase().includes(q) ||
              l.action?.toLowerCase().includes(q) ||
              l.entityName?.toLowerCase().includes(q) ||
              l.details?.toLowerCase().includes(q) ||
              l.ipAddress?.includes(q),
          );
        }

        return items;
      }),
    );
  }

  // =========================================================================
  // 18. HL7 FHIR R4 Interoperability Subsystem
  // =========================================================================
  private readonly fhirUrl = environment.fhirBaseUrl;

  getFhirMetadata(): Observable<FhirCapabilityStatement> {
    return this.http.get<FhirCapabilityStatement>(`${this.fhirUrl}/metadata`);
  }

  getFhirPatients(
    name?: string,
    gender?: string,
    identifier?: string,
  ): Observable<FhirBundle<FhirPatient>> {
    let query = '';
    const params: string[] = [];
    if (name) params.push(`name=${encodeURIComponent(name)}`);
    if (gender) params.push(`gender=${encodeURIComponent(gender)}`);
    if (identifier) params.push(`identifier=${encodeURIComponent(identifier)}`);
    if (params.length > 0) query = '?' + params.join('&');
    return this.http.get<FhirBundle<FhirPatient>>(`${this.fhirUrl}/Patient${query}`);
  }

  getFhirResource(
    resourceType: string,
    patientId?: string,
  ): Observable<FhirBundle<FhirResource> | FhirResource> {
    const query = patientId ? `?patientId=${patientId}` : '';
    return this.http.get<FhirBundle<FhirResource> | FhirResource>(
      `${this.fhirUrl}/${resourceType}${query}`,
    );
  }

  getFhirResourceById(resourceType: string, id: string): Observable<FhirResource> {
    return this.http.get<FhirResource>(`${this.fhirUrl}/${resourceType}/${id}`);
  }

  getFhirPatientEverything(patientId: string): Observable<FhirBundle<FhirResource>> {
    return this.http.get<FhirBundle<FhirResource>>(
      `${this.fhirUrl}/Patient/${patientId}/$everything`,
    );
  }

  createFhirPatient(payload: Partial<FhirPatient>): Observable<FhirPatient> {
    return this.http.post<FhirPatient>(`${this.fhirUrl}/Patient`, payload);
  }

  // =========================================================================
  // 19. Imaging & Radiology (DICOM Studies, Series, Orders, Reports)
  // =========================================================================
  getImagingOrdersByPatient(patientId: string): Observable<ImagingOrder[]> {
    return this.get<ImagingOrder[]>(`/patients/${patientId}/imaging-orders`).pipe(
    );
  }

  getImagingOrdersByEncounter(encounterId: string): Observable<ImagingOrder[]> {
    return this.get<ImagingOrder[]>(`/encounters/${encounterId}/imaging-orders`).pipe(
    );
  }

  getImagingOrderById(orderId: number | string): Observable<ImagingOrder> {
    return this.get<ImagingOrder>(`/imaging-orders/${orderId}`);
  }

  createImagingOrder(
    encounterId: string,
    order: CreateImagingOrderRequest,
  ): Observable<ImagingOrder> {
    return this.post<ImagingOrder>(`/encounters/${encounterId}/imaging-orders`, order);
  }

  cancelImagingOrder(orderId: number | string): Observable<ImagingOrder> {
    return this.post<ImagingOrder>(`/imaging-orders/${orderId}/cancel`, {});
  }

  getImagingStudies(orderId: number | string): Observable<ImagingStudy[]> {
    return this.get<ImagingStudy[]>(`/imaging-orders/${orderId}/studies`).pipe(
    );
  }

  getImagingStudyById(studyId: number | string): Observable<ImagingStudy> {
    return this.get<ImagingStudy>(`/imaging-studies/${studyId}`);
  }

  getImagingSeries(studyId: number | string): Observable<ImagingSeries[]> {
    return this.get<ImagingSeries[]>(`/imaging-studies/${studyId}/series`).pipe(
    );
  }

  getImagingReports(studyId: number | string): Observable<ImagingReport[]> {
    return this.get<ImagingReport[]>(`/imaging-studies/${studyId}/reports`).pipe(
    );
  }

  createImagingReport(
    studyId: number | string,
    report: CreateImagingReportRequest,
  ): Observable<ImagingReport> {
    return this.post<ImagingReport>(`/imaging-studies/${studyId}/reports`, report);
  }

  signImagingReport(reportId: number | string): Observable<ImagingReport> {
    return this.post<ImagingReport>(`/imaging-reports/${reportId}/sign`, {});
  }

  // =========================================================================
  // 20. Surgical & Clinical Procedures
  // =========================================================================
  getProcedureOrdersByPatient(patientId: string): Observable<ProcedureOrder[]> {
    return this.get<ProcedureOrder[]>(`/patients/${patientId}/procedure-orders`).pipe(
    );
  }

  getProcedureOrdersByEncounter(encounterId: string): Observable<ProcedureOrder[]> {
    return this.get<ProcedureOrder[]>(`/encounters/${encounterId}/procedure-orders`).pipe(
    );
  }

  createProcedureOrder(
    encounterId: string,
    payload: CreateProcedureOrderRequest,
  ): Observable<ProcedureOrder> {
    return this.post<ProcedureOrder>(`/encounters/${encounterId}/procedure-orders`, payload);
  }

  performProcedure(
    orderId: number | string,
    payload: PerformProcedureRequest,
  ): Observable<ProcedurePerformance> {
    return this.post<ProcedurePerformance>(`/procedure-orders/${orderId}/perform`, payload);
  }

  getProcedurePerformances(orderId: number | string): Observable<ProcedurePerformance[]> {
    return this.get<ProcedurePerformance[]>(`/procedure-orders/${orderId}/performances`).pipe(
    );
  }

  addProcedureNote(
    performanceId: number | string,
    payload: { noteType: string; content: string },
  ): Observable<ProcedureNote> {
    return this.post<ProcedureNote>(`/procedure-performances/${performanceId}/notes`, payload);
  }

  getProcedureNotes(performanceId: number | string): Observable<ProcedureNote[]> {
    return this.get<ProcedureNote[]>(`/procedure-performances/${performanceId}/notes`).pipe(
    );
  }

  // =========================================================================
  // 21. Informed Consents & Directives
  // =========================================================================
  getConsentTypes(): Observable<ConsentType[]> {
    return this.get<ConsentType[]>('/consent-types');
  }

  createConsentType(payload: Partial<ConsentType>): Observable<ConsentType> {
    return this.post<ConsentType>('/consent-types', payload);
  }

  getPatientConsents(patientId: string): Observable<PatientConsent[]> {
    return this.get<PatientConsent[]>(`/patients/${patientId}/consents`).pipe(
    );
  }

  createPatientConsent(
    patientId: string,
    payload: CreatePatientConsentRequest,
  ): Observable<PatientConsent> {
    return this.post<PatientConsent>(`/patients/${patientId}/consents`, payload);
  }

  revokePatientConsent(consentId: number | string, reason: string): Observable<PatientConsent> {
    return this.post<PatientConsent>(`/patient-consents/${consentId}/revoke`, {
      revocationReason: reason,
    });
  }

  // =========================================================================
  // 22. Clinical Documents, Progress Notes & Discharge Summaries
  // =========================================================================
  getPatientDocuments(patientId: string): Observable<ClinicalDocument[]> {
    return this.get<ClinicalDocument[]>(`/patients/${patientId}/documents`).pipe(
    );
  }

  getEncounterClinicalDocuments(encounterId: string): Observable<ClinicalDocument[]> {
    return this.get<ClinicalDocument[]>(`/encounters/${encounterId}/documents`).pipe(
    );
  }

  createClinicalDocument(
    encounterId: string,
    payload: CreateClinicalDocumentRequest,
  ): Observable<ClinicalDocument> {
    return this.post<ClinicalDocument>(`/encounters/${encounterId}/documents`, payload);
  }

  finalizeClinicalDocument(documentId: number | string): Observable<ClinicalDocument> {
    return this.post<ClinicalDocument>(`/clinical-documents/${documentId}/finalize`, {});
  }

  addDocumentVersion(
    documentId: number | string,
    payload: { content: string; changeSummary?: string },
  ): Observable<DocumentVersion> {
    return this.post<DocumentVersion>(`/clinical-documents/${documentId}/versions`, payload);
  }

  getDocumentVersions(documentId: number | string): Observable<DocumentVersion[]> {
    return this.get<DocumentVersion[]>(`/clinical-documents/${documentId}/versions`).pipe(
    );
  }

  // =========================================================================
  // 23. Care Teams
  // =========================================================================
  getEncounterCareTeam(encounterId: string): Observable<CareTeam> {
    return this.get<CareTeam>(`/encounters/${encounterId}/care-team`).pipe(
    );
  }

  createEncounterCareTeam(encounterId: string): Observable<CareTeam> {
    return this.post<CareTeam>(`/encounters/${encounterId}/care-team`, {});
  }

  addCareTeamMember(
    careTeamId: number | string,
    payload: AddCareTeamMemberRequest,
  ): Observable<CareTeamMember> {
    return this.post<CareTeamMember>(`/care-teams/${careTeamId}/members`, payload);
  }

  removeCareTeamMember(
    careTeamId: number | string,
    memberId: number | string,
  ): Observable<{ success: boolean; message?: string }> {
    return this.delete<{ success: boolean; message?: string }>(
      `/care-teams/${careTeamId}/members/${memberId}`,
    );
  }

  // =========================================================================
  // 24. Insurance Payers, Plans, Authorizations & Claims
  // =========================================================================
  getInsurancePayers(): Observable<InsurancePayer[]> {
    return this.get<InsurancePayer[]>('/insurance-payers');
  }

  createInsurancePayer(payload: Partial<InsurancePayer>): Observable<InsurancePayer> {
    return this.post<InsurancePayer>('/insurance-payers', payload);
  }

  getPayerPlans(payerId: number | string): Observable<InsurancePlan[]> {
    return this.get<InsurancePlan[]>(`/insurance-payers/${payerId}/plans`).pipe(
    );
  }

  createPayerPlan(
    payerId: number | string,
    payload: Partial<InsurancePlan>,
  ): Observable<InsurancePlan> {
    return this.post<InsurancePlan>(`/insurance-payers/${payerId}/plans`, payload);
  }

  getPatientInsurancePolicies(patientId: string): Observable<PatientInsurancePolicy[]> {
    return this.get<PatientInsurancePolicy[]>(`/patients/${patientId}/insurances`).pipe(
    );
  }

  createPatientInsurancePolicy(
    patientId: string,
    payload: Partial<PatientInsurancePolicy>,
  ): Observable<PatientInsurancePolicy> {
    return this.post<PatientInsurancePolicy>(`/patients/${patientId}/insurances`, payload);
  }

  getEncounterAuthorizations(encounterId: string): Observable<InsuranceAuthorization[]> {
    return this.get<InsuranceAuthorization[]>(`/encounters/${encounterId}/authorizations`).pipe(
    );
  }

  requestAuthorization(
    encounterId: string,
    payload: CreateInsuranceAuthorizationRequest,
  ): Observable<InsuranceAuthorization> {
    return this.post<InsuranceAuthorization>(`/encounters/${encounterId}/authorizations`, payload);
  }

  updateAuthorization(
    authId: number | string,
    payload: Partial<InsuranceAuthorization>,
  ): Observable<InsuranceAuthorization> {
    return this.patch<InsuranceAuthorization>(`/insurance-authorizations/${authId}`, payload);
  }

  getEncounterClaims(encounterId: string): Observable<InsuranceClaim[]> {
    return this.get<InsuranceClaim[]>(`/encounters/${encounterId}/claims`).pipe(
    );
  }

  createInsuranceClaim(
    encounterId: string,
    payload: CreateInsuranceClaimRequest,
  ): Observable<InsuranceClaim> {
    return this.post<InsuranceClaim>(`/encounters/${encounterId}/claims`, payload);
  }

  submitInsuranceClaim(claimId: number | string): Observable<InsuranceClaim> {
    return this.post<InsuranceClaim>(`/insurance-claims/${claimId}/submit`, {});
  }

  updateInsuranceClaim(
    claimId: number | string,
    payload: Partial<InsuranceClaim>,
  ): Observable<InsuranceClaim> {
    return this.patch<InsuranceClaim>(`/insurance-claims/${claimId}`, payload);
  }

  getAllClaims(): Observable<InsuranceClaim[]> {
    return this.get<InsuranceClaim[]>('/insurance-claims');
  }

  getPatientClaims(patientId: string): Observable<InsuranceClaim[]> {
    return this.get<InsuranceClaim[]>(`/patients/${patientId}/claims`).pipe(
    );
  }

  // =========================================================================
  // 25. Organization Chargemasters & Price Lists
  // =========================================================================
  getOrganizationPriceLists(organizationId: string): Observable<PriceList[]> {
    return this.get<PriceList[]>(`/organizations/${organizationId}/price-lists`).pipe(
    );
  }

  createPriceList(organizationId: string, payload: Partial<PriceList>): Observable<PriceList> {
    return this.post<PriceList>(`/organizations/${organizationId}/price-lists`, payload);
  }

  getPriceListItems(priceListId: number | string): Observable<PriceListItem[]> {
    return this.get<PriceListItem[]>(`/price-lists/${priceListId}/items`).pipe(
    );
  }

  addPriceListItem(
    priceListId: number | string,
    payload: Partial<PriceListItem>,
  ): Observable<PriceListItem> {
    return this.post<PriceListItem>(`/price-lists/${priceListId}/items`, payload);
  }

  // =========================================================================
  // 26. Tenancy Hierarchy (Departments, Wards, Rooms, Beds)
  // =========================================================================
  getDepartments(organizationId: string): Observable<Department[]> {
    return this.get<Department[]>(`/organizations/${organizationId}/departments`).pipe(
    );
  }

  getDepartmentsByOrganization(organizationId: string): Observable<Department[]> {
    return this.getDepartments(organizationId);
  }

  createDepartment(organizationId: string, payload: Partial<Department>): Observable<Department> {
    return this.post<Department>(`/organizations/${organizationId}/departments`, payload);
  }

  getWards(departmentId: string): Observable<Ward[]> {
    return this.get<Ward[]>(`/departments/${departmentId}/wards`);
  }

  createWard(departmentId: string, payload: Partial<Ward>): Observable<Ward> {
    return this.post<Ward>(`/departments/${departmentId}/wards`, payload);
  }

  getRooms(wardId: string): Observable<Room[]> {
    return this.get<Room[]>(`/wards/${wardId}/rooms`);
  }

  createRoom(wardId: string, payload: Partial<Room>): Observable<Room> {
    return this.post<Room>(`/wards/${wardId}/rooms`, payload);
  }

  // =========================================================================
  // 27. Security Policies (ABAC), RBAC Roles & Security Events
  // =========================================================================
  getAbacPolicies(): Observable<AbacPolicy[]> {
    return this.get<AbacPolicy[]>('/abac-policies');
  }

  createAbacPolicy(payload: CreateAbacPolicyRequest): Observable<AbacPolicy> {
    return this.post<AbacPolicy>('/abac-policies', payload);
  }

  updateAbacPolicy(
    policyId: number | string,
    payload: Partial<AbacPolicy>,
  ): Observable<AbacPolicy> {
    return this.patch<AbacPolicy>(`/abac-policies/${policyId}`, payload);
  }

  getRbacRoles(): Observable<RbacRole[]> {
    return this.get<RbacRole[]>('/roles');
  }

  createRbacRole(payload: { name: string; description?: string }): Observable<RbacRole> {
    return this.post<RbacRole>('/roles', payload);
  }

  getRolePermissions(roleId: number | string): Observable<string[]> {
    return this.get<string[]>(`/roles/${roleId}/permissions`);
  }

  assignRolePermissions(roleId: number | string, permissions: string[]): Observable<RbacRole> {
    return this.post<RbacRole>(`/roles/${roleId}/permissions`, { permissions });
  }

  getSecurityEvents(): Observable<SecurityEventLog[]> {
    return this.get<SecurityEventLog[]>('/security-events');
  }

  // =========================================================================
  // 28. Terminology Engine & Medical Code Search
  // =========================================================================
  getCodeSystems(): Observable<CodeSystem[]> {
    return this.get<CodeSystem[]>('/code-systems');
  }

  searchTerminology(query: string, system?: string): Observable<TerminologySearchResult[]> {
    const params: string[] = [`q=${encodeURIComponent(query)}`];
    if (system) params.push(`system=${encodeURIComponent(system)}`);
    return this.get<TerminologySearchResult[]>(`/terminology/search?${params.join('&')}`).pipe(
    );
  }

  // =========================================================================
  // 29. Platform Operator Management (Super Admin SaaS)
  // =========================================================================
  getPlatformOrganizations(): Observable<Organization[]> {
    return this.get<Organization[]>('/organizations');
  }

  createPlatformOrganization(payload: Partial<Organization>): Observable<Organization> {
    return this.post<Organization>('/organizations', payload);
  }

  activatePlatformOrganization(id: string): Observable<Organization> {
    return this.patch<Organization>(`/organizations/${id}`, { status: 'ACTIVE' });
  }

  suspendPlatformOrganization(id: string): Observable<Organization> {
    return this.patch<Organization>(`/organizations/${id}`, { status: 'SUSPENDED' });
  }

  getPlatformUsers(): Observable<User[]> {
    return this.get<User[]>('/users');
  }

  forcePasswordResetPlatformUser(id: string | number): Observable<User> {
    return this.patch<User>(`/users/${id}`, { passwordResetRequired: true }).pipe(
      catchError(() => this.post<User>(`/platform/users/${id}/force-password-reset`, {})),
    );
  }

  getPlatformAuditEvents(query?: string): Observable<AuditLog[]> {
    const qs = query ? `?query=${encodeURIComponent(query)}` : '';
    return this.get<AuditLog[]>(`/audit-events${qs}`).pipe(
      catchError(() => this.get<AuditLog[]>(`/audit-logs${qs}`)),
    );
  }

  getPlatformSecurityEvents(): Observable<SecurityEventLog[]> {
    return this.get<SecurityEventLog[]>('/security-events');
  }

  getPlatformHealth(): Observable<{
    status: string;
    uptimeSeconds?: number;
    services?: Record<string, any>;
  }> {
    return this.get<{ status: string; uptimeSeconds?: number; services?: Record<string, any> }>(
      '/platform/health',
    );
  }

  // =========================================================================
  // 30. Clinical Pharmacy & Dispensing Engine (Pharmacist)
  // =========================================================================
  getPharmacyMedicationOrders(): Observable<MedicationOrder[]> {
    return this.get<MedicationOrder[]>('/prescriptions');
  }

  verifyPharmacyOrder(orderId: string, notes?: string): Observable<MedicationOrder> {
    return this.post<MedicationOrder>('/prescriptions/' + orderId + '/verify', { notes });
  }

  rejectPharmacyOrder(orderId: string, reason: string): Observable<MedicationOrder> {
    return this.post<MedicationOrder>('/prescriptions/' + orderId + '/reject', { reason });
  }

  requestPharmacyClarification(
    orderId: string,
    clarificationText: string,
  ): Observable<MedicationOrder> {
    return this.post<MedicationOrder>('/prescriptions/' + orderId + '/reject', {
      reason: clarificationText,
    });
  }

  dispensePharmacyOrder(
    orderId: string,
    payload: { batchId?: string; quantity: number; notes?: string },
  ): Observable<DispensationRecord> {
    return this.post<DispensationRecord>('/prescriptions/' + orderId + '/dispense', payload);
  }

  searchMedications(query: string = ''): Observable<MedicationCatalogItem[]> {
    const params = query ? `?query=${encodeURIComponent(query)}` : '';
    return this.get<MedicationCatalogItem[]>(`/medications/search${params}`).pipe(
      catchError(() =>
        this.get<MedicationCatalogItem[]>('/medications'),
      ),
    );
  }

  getPharmacyInventory(): Observable<InventoryItem[]> {
    return this.get<InventoryItem[]>('/pharmacy/inventory').pipe(
      catchError(() =>
        this.searchMedications('').pipe(
          map((meds: MedicationCatalogItem[]) =>
            (meds || []).map(
              (m: MedicationCatalogItem) =>
                ({
                  id: m.id || m.code || '',
                  medicationName: m.name || m.medicationName || 'Medication',
                  genericName: m.genericName || m.name,
                  dosageForm: m.form || m.dosageForm || 'Tablet',
                  strength: m.strength || 'Standard',
                  category: m.category || 'THERAPEUTIC',
                  totalQuantityOnHand: m.stockQuantity || 0,
                  reorderLevel: m.reorderThreshold || 50,
                  unitOfMeasure: 'Units',
                  unitPrice: m.unitPrice || 0,
                  batches: m.batches || [],
                }) as InventoryItem,
            ),
          ),

        ),
      ),
    );
  }

  getMedicationBatches(medicationName?: string): Observable<MedicationBatch[]> {
    return this.get<MedicationBatch[]>('/pharmacy/batches').pipe(
      catchError(() =>
        this.getPharmacyInventory().pipe(
          map((items: InventoryItem[]) => {
            const allBatches = items.flatMap((i) => i.batches || []);
            if (medicationName) {
              const q = medicationName.toLowerCase();
              return allBatches.filter((b) => b.medicationName.toLowerCase().includes(q));
            }
            return allBatches;
          }),
        ),
      ),
    );
  }

  receiveStockBatch(payload: StockReceiptDTO): Observable<InventoryItem> {
    return this.post<InventoryItem>('/pharmacy/inventory/receipts', payload);
  }

  adjustStockBatch(payload: StockAdjustmentDTO): Observable<InventoryItem> {
    return this.post<InventoryItem>('/pharmacy/inventory/adjustments', payload);
  }

  // =========================================================================
  // 31. Financial Revenue & Billing Accounts (Billing Staff)
  // =========================================================================
  getAllBillingAccounts(): Observable<BillingAccount[]> {
    return this.get<BillingAccount[]>('/billing-accounts');
  }

  getAllInvoices(): Observable<Invoice[]> {
    return this.get<Invoice[]>('/invoices');
  }

  getAllChargeItems(): Observable<ChargeItem[]> {
    return this.get<ChargeItem[]>('/charge-items');
  }

  voidInvoice(invoiceId: string): Observable<Invoice> {
    return this.post<Invoice>(`/invoices/${invoiceId}/void`, {});
  }

  confirmAppointment(id: string): Observable<Appointment> {
    return this.updateAppointmentStatus(id, 'CONFIRMED');
  }

  markNoShowAppointment(id: string): Observable<Appointment> {
    return this.updateAppointmentStatus(id, 'NO_SHOW');
  }
}
