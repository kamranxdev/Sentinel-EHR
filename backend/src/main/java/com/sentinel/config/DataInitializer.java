package com.sentinel.config;

import com.sentinel.audit.entity.AuditLog;
import com.sentinel.audit.repository.AuditLogRepository;
import com.sentinel.billing.entity.*;
import com.sentinel.billing.repository.*;
import com.sentinel.clinical.entity.*;
import com.sentinel.clinical.repository.*;
import com.sentinel.consent.entity.*;
import com.sentinel.consent.repository.*;
import com.sentinel.documents.entity.*;
import com.sentinel.documents.repository.*;
import com.sentinel.identity.entity.*;
import com.sentinel.identity.repository.*;
import com.sentinel.imaging.entity.*;
import com.sentinel.imaging.repository.*;
import com.sentinel.insurance.entity.*;
import com.sentinel.insurance.entity.InsuranceClaim;
import com.sentinel.insurance.repository.*;
import com.sentinel.insurance.repository.InsuranceClaimRepository;
import com.sentinel.laboratory.entity.*;
import com.sentinel.laboratory.repository.*;
import com.sentinel.patient.entity.*;
import com.sentinel.patient.repository.*;
import com.sentinel.pharmacy.entity.*;
import com.sentinel.pharmacy.repository.*;
import com.sentinel.procedure.entity.*;
import com.sentinel.procedure.repository.*;
import com.sentinel.scheduling.entity.*;
import com.sentinel.scheduling.repository.*;
import com.sentinel.security.entity.*;
import com.sentinel.security.repository.*;
import com.sentinel.tenancy.entity.*;
import com.sentinel.tenancy.repository.*;
import com.sentinel.terminology.entity.*;
import com.sentinel.terminology.repository.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.*;

@Component
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    // 1. Terminology
    private final CodeSystemRepository codeSystemRepository;
    private final TerminologyCodeRepository terminologyCodeRepository;
    private final TerminologyUnitRepository terminologyUnitRepository;

    // 2. Tenancy
    private final OrganizationRepository organizationRepository;
    private final DepartmentRepository departmentRepository;
    private final WardRepository wardRepository;
    private final RoomRepository roomRepository;
    private final BedRepository bedRepository;

    // 3. Security
    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final AbacPolicyRepository abacPolicyRepository;
    private final BreakGlassRepository breakGlassRepository;
    private final SecurityEventRepository securityEventRepository;

    // 4. Identity
    private final PersonRepository personRepository;
    private final UserRepository userRepository;
    private final UserOrganizationRepository userOrganizationRepository;
    private final UserDepartmentRepository userDepartmentRepository;
    private final PractitionerRepository practitionerRepository;
    private final PractitionerSpecialtyRepository practitionerSpecialtyRepository;
    private final PractitionerLicenseRepository practitionerLicenseRepository;

    // 5. Patient
    private final PatientRepository patientRepository;
    private final PatientOrganizationRepository patientOrganizationRepository;
    private final PatientDemographicsRepository patientDemographicsRepository;
    private final PatientAddressRepository patientAddressRepository;
    private final PatientPhoneNumberRepository patientPhoneNumberRepository;
    private final PatientEmailAddressRepository patientEmailAddressRepository;
    private final EmergencyContactRepository emergencyContactRepository;
    private final PatientMedicalAlertRepository patientMedicalAlertRepository;
    private final PatientConditionRepository patientConditionRepository;
    private final PatientMedicalHistoryRepository patientMedicalHistoryRepository;
    private final PatientSurgicalHistoryRepository patientSurgicalHistoryRepository;
    private final PatientFamilyHistoryRepository patientFamilyHistoryRepository;
    private final PatientSocialHistoryRepository patientSocialHistoryRepository;
    private final PatientSubstanceUseRepository patientSubstanceUseRepository;
    private final PatientDietaryHistoryRepository patientDietaryHistoryRepository;
    private final PatientCommunicationPreferencesRepository patientCommunicationPreferencesRepository;
    private final PatientContactRepository patientContactRepository;
    private final PatientIdentifierRepository patientIdentifierRepository;

    // 6. Clinical
    private final EncounterRepository encounterRepository;
    private final EncounterLocationRepository encounterLocationRepository;
    private final AdmissionRepository admissionRepository;
    private final VitalsRepository vitalsRepository;
    private final TriageEwsRecordRepository triageEwsRecordRepository;
    private final AllergyRepository allergyRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final ProblemListRepository problemListRepository;
    private final ClinicalObservationRepository clinicalObservationRepository;
    private final ClinicalDocumentRepository clinicalDocumentRepository;
    private final ClinicalDocumentVersionRepository clinicalDocumentVersionRepository;
    private final NursingFlowsheetRepository nursingFlowsheetRepository;
    private final NursingFlowsheetEntryRepository nursingFlowsheetEntryRepository;
    private final CareTeamRepository careTeamRepository;
    private final CareTeamMemberRepository careTeamMemberRepository;
    private final TransferRepository transferRepository;
    private final DischargeRepository dischargeRepository;

    // 7. Laboratory
    private final LabTestCatalogRepository labTestCatalogRepository;
    private final LabOrderRepository labOrderRepository;
    private final LabOrderItemRepository labOrderItemRepository;
    private final SpecimenRepository specimenRepository;
    private final SpecimenCollectionRepository specimenCollectionRepository;
    private final LabResultRepository labResultRepository;
    private final LabResultComponentRepository labResultComponentRepository;

    // 8. Pharmacy
    private final MedicationRepository medicationRepository;
    private final MedicationProductRepository medicationProductRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final MedicationOrderDoseRepository medicationOrderDoseRepository;
    private final MedicationAdministrationRepository medicationAdministrationRepository;
    private final MedicationReconciliationRepository medicationReconciliationRepository;

    // 9. Procedure
    private final ProcedureCatalogRepository procedureCatalogRepository;
    private final ProcedureOrderRepository procedureOrderRepository;
    private final ProcedurePerformanceRepository procedurePerformanceRepository;
    private final ProcedureParticipantRepository procedureParticipantRepository;
    private final ProcedureNoteRepository procedureNoteRepository;

    // 10. Imaging
    private final ImagingOrderRepository imagingOrderRepository;
    private final ImagingStudyRepository imagingStudyRepository;
    private final ImagingSeriesRepository imagingSeriesRepository;
    private final ImagingInstanceRepository imagingInstanceRepository;
    private final ImagingReportRepository imagingReportRepository;
    private final ImagingReportVersionRepository imagingReportVersionRepository;

    // 11. Scheduling
    private final AppointmentTypeRepository appointmentTypeRepository;
    private final ScheduleSlotRepository scheduleSlotRepository;
    private final AppointmentRepository appointmentRepository;
    private final AppointmentParticipantRepository appointmentParticipantRepository;
    private final AppointmentStatusHistoryRepository appointmentStatusHistoryRepository;
    private final AppointmentNoteRepository appointmentNoteRepository;
    private final AppointmentCancellationRepository appointmentCancellationRepository;
    private final AppointmentRescheduleRepository appointmentRescheduleRepository;

    // 12. Billing
    private final PriceListRepository priceListRepository;
    private final PriceListItemRepository priceListItemRepository;
    private final BillingAccountRepository billingAccountRepository;
    private final ChargeItemRepository chargeItemRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentAllocationRepository paymentAllocationRepository;
    private final RefundRepository refundRepository;

    // 13. Insurance
    private final InsurancePayerRepository insurancePayerRepository;
    private final InsurancePlanRepository insurancePlanRepository;
    private final PatientInsuranceRepository patientInsuranceRepository;
    private final InsuranceVerificationRepository insuranceVerificationRepository;
    private final InsuranceAuthorizationRepository insuranceAuthorizationRepository;
    private final InsuranceClaimRepository insuranceClaimRepository;
    private final InsuranceClaimItemRepository insuranceClaimItemRepository;

    // 14. Consent
    private final ConsentTypeRepository consentTypeRepository;
    private final PatientConsentRepository patientConsentRepository;
    private final ConsentVersionRepository consentVersionRepository;

    // 15. Documents
    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository documentVersionRepository;
    private final DocumentLinkRepository documentLinkRepository;

    // 16. Audit
    private final AuditLogRepository auditLogRepository;

    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            CodeSystemRepository codeSystemRepository,
            TerminologyCodeRepository terminologyCodeRepository,
            TerminologyUnitRepository terminologyUnitRepository,
            OrganizationRepository organizationRepository,
            DepartmentRepository departmentRepository,
            WardRepository wardRepository,
            RoomRepository roomRepository,
            BedRepository bedRepository,
            PermissionRepository permissionRepository,
            RoleRepository roleRepository,
            AbacPolicyRepository abacPolicyRepository,
            BreakGlassRepository breakGlassRepository,
            SecurityEventRepository securityEventRepository,
            PersonRepository personRepository,
            UserRepository userRepository,
            UserOrganizationRepository userOrganizationRepository,
            UserDepartmentRepository userDepartmentRepository,
            PractitionerRepository practitionerRepository,
            PractitionerSpecialtyRepository practitionerSpecialtyRepository,
            PractitionerLicenseRepository practitionerLicenseRepository,
            PatientRepository patientRepository,
            PatientOrganizationRepository patientOrganizationRepository,
            PatientDemographicsRepository patientDemographicsRepository,
            PatientAddressRepository patientAddressRepository,
            PatientPhoneNumberRepository patientPhoneNumberRepository,
            PatientEmailAddressRepository patientEmailAddressRepository,
            EmergencyContactRepository emergencyContactRepository,
            PatientMedicalAlertRepository patientMedicalAlertRepository,
            PatientConditionRepository patientConditionRepository,
            PatientMedicalHistoryRepository patientMedicalHistoryRepository,
            PatientSurgicalHistoryRepository patientSurgicalHistoryRepository,
            PatientFamilyHistoryRepository patientFamilyHistoryRepository,
            PatientSocialHistoryRepository patientSocialHistoryRepository,
            PatientSubstanceUseRepository patientSubstanceUseRepository,
            PatientDietaryHistoryRepository patientDietaryHistoryRepository,
            PatientCommunicationPreferencesRepository patientCommunicationPreferencesRepository,
            PatientContactRepository patientContactRepository,
            PatientIdentifierRepository patientIdentifierRepository,
            EncounterRepository encounterRepository,
            EncounterLocationRepository encounterLocationRepository,
            AdmissionRepository admissionRepository,
            VitalsRepository vitalsRepository,
            TriageEwsRecordRepository triageEwsRecordRepository,
            AllergyRepository allergyRepository,
            DiagnosisRepository diagnosisRepository,
            ProblemListRepository problemListRepository,
            ClinicalObservationRepository clinicalObservationRepository,
            ClinicalDocumentRepository clinicalDocumentRepository,
            ClinicalDocumentVersionRepository clinicalDocumentVersionRepository,
            NursingFlowsheetRepository nursingFlowsheetRepository,
            NursingFlowsheetEntryRepository nursingFlowsheetEntryRepository,
            CareTeamRepository careTeamRepository,
            CareTeamMemberRepository careTeamMemberRepository,
            TransferRepository transferRepository,
            DischargeRepository dischargeRepository,
            LabTestCatalogRepository labTestCatalogRepository,
            LabOrderRepository labOrderRepository,
            LabOrderItemRepository labOrderItemRepository,
            SpecimenRepository specimenRepository,
            SpecimenCollectionRepository specimenCollectionRepository,
            LabResultRepository labResultRepository,
            LabResultComponentRepository labResultComponentRepository,
            MedicationRepository medicationRepository,
            MedicationProductRepository medicationProductRepository,
            PrescriptionRepository prescriptionRepository,
            MedicationOrderDoseRepository medicationOrderDoseRepository,
            MedicationAdministrationRepository medicationAdministrationRepository,
            MedicationReconciliationRepository medicationReconciliationRepository,
            ProcedureCatalogRepository procedureCatalogRepository,
            ProcedureOrderRepository procedureOrderRepository,
            ProcedurePerformanceRepository procedurePerformanceRepository,
            ProcedureParticipantRepository procedureParticipantRepository,
            ProcedureNoteRepository procedureNoteRepository,
            ImagingOrderRepository imagingOrderRepository,
            ImagingStudyRepository imagingStudyRepository,
            ImagingSeriesRepository imagingSeriesRepository,
            ImagingInstanceRepository imagingInstanceRepository,
            ImagingReportRepository imagingReportRepository,
            ImagingReportVersionRepository imagingReportVersionRepository,
            AppointmentTypeRepository appointmentTypeRepository,
            ScheduleSlotRepository scheduleSlotRepository,
            AppointmentRepository appointmentRepository,
            AppointmentParticipantRepository appointmentParticipantRepository,
            AppointmentStatusHistoryRepository appointmentStatusHistoryRepository,
            AppointmentNoteRepository appointmentNoteRepository,
            AppointmentCancellationRepository appointmentCancellationRepository,
            AppointmentRescheduleRepository appointmentRescheduleRepository,
            PriceListRepository priceListRepository,
            PriceListItemRepository priceListItemRepository,
            BillingAccountRepository billingAccountRepository,
            ChargeItemRepository chargeItemRepository,
            InvoiceRepository invoiceRepository,
            InvoiceItemRepository invoiceItemRepository,
            PaymentRepository paymentRepository,
            PaymentAllocationRepository paymentAllocationRepository,
            RefundRepository refundRepository,
            InsurancePayerRepository insurancePayerRepository,
            InsurancePlanRepository insurancePlanRepository,
            PatientInsuranceRepository patientInsuranceRepository,
            InsuranceVerificationRepository insuranceVerificationRepository,
            InsuranceAuthorizationRepository insuranceAuthorizationRepository,
            InsuranceClaimRepository insuranceClaimRepository,
            InsuranceClaimItemRepository insuranceClaimItemRepository,
            ConsentTypeRepository consentTypeRepository,
            PatientConsentRepository patientConsentRepository,
            ConsentVersionRepository consentVersionRepository,
            DocumentRepository documentRepository,
            DocumentVersionRepository documentVersionRepository,
            DocumentLinkRepository documentLinkRepository,
            AuditLogRepository auditLogRepository,
            PasswordEncoder passwordEncoder) {
        this.codeSystemRepository = codeSystemRepository;
        this.terminologyCodeRepository = terminologyCodeRepository;
        this.terminologyUnitRepository = terminologyUnitRepository;
        this.organizationRepository = organizationRepository;
        this.departmentRepository = departmentRepository;
        this.wardRepository = wardRepository;
        this.roomRepository = roomRepository;
        this.bedRepository = bedRepository;
        this.permissionRepository = permissionRepository;
        this.roleRepository = roleRepository;
        this.abacPolicyRepository = abacPolicyRepository;
        this.breakGlassRepository = breakGlassRepository;
        this.securityEventRepository = securityEventRepository;
        this.personRepository = personRepository;
        this.userRepository = userRepository;
        this.userOrganizationRepository = userOrganizationRepository;
        this.userDepartmentRepository = userDepartmentRepository;
        this.practitionerRepository = practitionerRepository;
        this.practitionerSpecialtyRepository = practitionerSpecialtyRepository;
        this.practitionerLicenseRepository = practitionerLicenseRepository;
        this.patientRepository = patientRepository;
        this.patientOrganizationRepository = patientOrganizationRepository;
        this.patientDemographicsRepository = patientDemographicsRepository;
        this.patientAddressRepository = patientAddressRepository;
        this.patientPhoneNumberRepository = patientPhoneNumberRepository;
        this.patientEmailAddressRepository = patientEmailAddressRepository;
        this.emergencyContactRepository = emergencyContactRepository;
        this.patientMedicalAlertRepository = patientMedicalAlertRepository;
        this.patientConditionRepository = patientConditionRepository;
        this.patientMedicalHistoryRepository = patientMedicalHistoryRepository;
        this.patientSurgicalHistoryRepository = patientSurgicalHistoryRepository;
        this.patientFamilyHistoryRepository = patientFamilyHistoryRepository;
        this.patientSocialHistoryRepository = patientSocialHistoryRepository;
        this.patientSubstanceUseRepository = patientSubstanceUseRepository;
        this.patientDietaryHistoryRepository = patientDietaryHistoryRepository;
        this.patientCommunicationPreferencesRepository = patientCommunicationPreferencesRepository;
        this.patientContactRepository = patientContactRepository;
        this.patientIdentifierRepository = patientIdentifierRepository;
        this.encounterRepository = encounterRepository;
        this.encounterLocationRepository = encounterLocationRepository;
        this.admissionRepository = admissionRepository;
        this.vitalsRepository = vitalsRepository;
        this.triageEwsRecordRepository = triageEwsRecordRepository;
        this.allergyRepository = allergyRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.problemListRepository = problemListRepository;
        this.clinicalObservationRepository = clinicalObservationRepository;
        this.clinicalDocumentRepository = clinicalDocumentRepository;
        this.clinicalDocumentVersionRepository = clinicalDocumentVersionRepository;
        this.nursingFlowsheetRepository = nursingFlowsheetRepository;
        this.nursingFlowsheetEntryRepository = nursingFlowsheetEntryRepository;
        this.careTeamRepository = careTeamRepository;
        this.careTeamMemberRepository = careTeamMemberRepository;
        this.transferRepository = transferRepository;
        this.dischargeRepository = dischargeRepository;
        this.labTestCatalogRepository = labTestCatalogRepository;
        this.labOrderRepository = labOrderRepository;
        this.labOrderItemRepository = labOrderItemRepository;
        this.specimenRepository = specimenRepository;
        this.specimenCollectionRepository = specimenCollectionRepository;
        this.labResultRepository = labResultRepository;
        this.labResultComponentRepository = labResultComponentRepository;
        this.medicationRepository = medicationRepository;
        this.medicationProductRepository = medicationProductRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.medicationOrderDoseRepository = medicationOrderDoseRepository;
        this.medicationAdministrationRepository = medicationAdministrationRepository;
        this.medicationReconciliationRepository = medicationReconciliationRepository;
        this.procedureCatalogRepository = procedureCatalogRepository;
        this.procedureOrderRepository = procedureOrderRepository;
        this.procedurePerformanceRepository = procedurePerformanceRepository;
        this.procedureParticipantRepository = procedureParticipantRepository;
        this.procedureNoteRepository = procedureNoteRepository;
        this.imagingOrderRepository = imagingOrderRepository;
        this.imagingStudyRepository = imagingStudyRepository;
        this.imagingSeriesRepository = imagingSeriesRepository;
        this.imagingInstanceRepository = imagingInstanceRepository;
        this.imagingReportRepository = imagingReportRepository;
        this.imagingReportVersionRepository = imagingReportVersionRepository;
        this.appointmentTypeRepository = appointmentTypeRepository;
        this.scheduleSlotRepository = scheduleSlotRepository;
        this.appointmentRepository = appointmentRepository;
        this.appointmentParticipantRepository = appointmentParticipantRepository;
        this.appointmentStatusHistoryRepository = appointmentStatusHistoryRepository;
        this.appointmentNoteRepository = appointmentNoteRepository;
        this.appointmentCancellationRepository = appointmentCancellationRepository;
        this.appointmentRescheduleRepository = appointmentRescheduleRepository;
        this.priceListRepository = priceListRepository;
        this.priceListItemRepository = priceListItemRepository;
        this.billingAccountRepository = billingAccountRepository;
        this.chargeItemRepository = chargeItemRepository;
        this.invoiceRepository = invoiceRepository;
        this.invoiceItemRepository = invoiceItemRepository;
        this.paymentRepository = paymentRepository;
        this.paymentAllocationRepository = paymentAllocationRepository;
        this.refundRepository = refundRepository;
        this.insurancePayerRepository = insurancePayerRepository;
        this.insurancePlanRepository = insurancePlanRepository;
        this.patientInsuranceRepository = patientInsuranceRepository;
        this.insuranceVerificationRepository = insuranceVerificationRepository;
        this.insuranceAuthorizationRepository = insuranceAuthorizationRepository;
        this.insuranceClaimRepository = insuranceClaimRepository;
        this.insuranceClaimItemRepository = insuranceClaimItemRepository;
        this.consentTypeRepository = consentTypeRepository;
        this.patientConsentRepository = patientConsentRepository;
        this.consentVersionRepository = consentVersionRepository;
        this.documentRepository = documentRepository;
        this.documentVersionRepository = documentVersionRepository;
        this.documentLinkRepository = documentLinkRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("Starting comprehensive Sentinel EHR database initialization...");

        // 1. Terminology (Code Systems, Codes, Units)
        TerminologyContext terminology = initTerminology();

        // 2. Tenancy Hierarchy (Organizations, Departments, Wards, Rooms, Beds)
        TenancyContext tenancy = initTenancy();

        // 3. Security & Authorization (Permissions, Canonical Roles, ABAC Policies)
        Map<String, Permission> permissions = initPermissions();
        Map<String, Role> roles = initRoles(permissions);
        initAbacPolicies();

        // 4. Identity & Staff Users (Person, User, Practitioners, Licenses,
        // Specialties, User-Org/Dept)
        IdentityContext identity = initIdentity(roles, tenancy);

        // 5. Patients & Complete Demographics / Histories / Alerts / Contacts
        List<PatientContext> patients = initPatients(tenancy, identity);

        // 6. Clinical Encounters, Admissions, Vitals, Triage, Care Teams, Notes,
        // Flowsheets, Transfers, Discharges
        ClinicalContext clinical = initClinical(tenancy, identity, patients, terminology);

        // 7. Laboratory Test Catalog, Orders, Specimen Collection, Results & Components
        initLaboratory(tenancy, identity, patients, clinical);

        // 8. Pharmacy Catalog, Products, Prescriptions, Dosing, eMAR Administrations,
        // Reconciliation
        initPharmacy(tenancy, identity, patients, clinical);

        // 9. Procedures Catalog, Orders, Performances, Participants, Operative Notes
        initProcedures(tenancy, identity, patients, clinical);

        // 10. Imaging Orders, DICOM Studies, Series, Instances, Radiology Reports &
        // Versions
        initImaging(tenancy, identity, patients, clinical);

        // 11. Scheduling Appointment Types, Slots, Multi-stage Appointments, Status
        // History, Notes, Reschedules, Cancellations
        initScheduling(tenancy, identity, patients);

        // 12. Billing Price Lists, Items, Billing Accounts, Charge Items, Invoices,
        // Items, Payments, Allocations, Refunds
        initBilling(tenancy, identity, patients, clinical);

        // 13. Insurance Payers, Plans, Patient Coverage, Verifications, Prior
        // Authorizations, Claims & Claim Items
        initInsurance(tenancy, identity, patients, clinical);

        // 14. Consent Types, Electronic Documents, Versioning, Patient Consents
        initConsentAndDocuments(tenancy, identity, patients, clinical);

        // 15. Security Events & Audit Logs
        initSecurityAndAudit(tenancy, identity, patients, clinical);

        log.info(
                "Sentinel EHR database initialization completed successfully with 100% relational integrity across all schemas!");
    }

    // =========================================================================
    // 1. TERMINOLOGY
    // =========================================================================
    private static class TerminologyContext {
        CodeSystem icd10;
        CodeSystem snomed;
        CodeSystem loinc;
        CodeSystem rxnorm;
        CodeSystem ucum;
    }

    private TerminologyContext initTerminology() {
        TerminologyContext ctx = new TerminologyContext();

        ctx.icd10 = codeSystemRepository.findByCode("ICD-10").orElseGet(() -> {
            CodeSystem cs = new CodeSystem();
            cs.setCode("ICD-10");
            cs.setName("International Classification of Diseases, 10th Revision");
            cs.setUri("http://hl7.org/fhir/sid/icd-10");
            cs.setVersion("2019");
            return codeSystemRepository.save(cs);
        });

        ctx.snomed = codeSystemRepository.findByCode("SNOMED-CT").orElseGet(() -> {
            CodeSystem cs = new CodeSystem();
            cs.setCode("SNOMED-CT");
            cs.setName("Systematized Nomenclature of Medicine - Clinical Terms");
            cs.setUri("http://snomed.info/sct");
            cs.setVersion("2024-03");
            return codeSystemRepository.save(cs);
        });

        ctx.loinc = codeSystemRepository.findByCode("LOINC").orElseGet(() -> {
            CodeSystem cs = new CodeSystem();
            cs.setCode("LOINC");
            cs.setName("Logical Observation Identifiers Names and Codes");
            cs.setUri("http://loinc.org");
            cs.setVersion("2.76");
            return codeSystemRepository.save(cs);
        });

        ctx.rxnorm = codeSystemRepository.findByCode("RxNorm").orElseGet(() -> {
            CodeSystem cs = new CodeSystem();
            cs.setCode("RxNorm");
            cs.setName("RxNorm Normalized Medication Vocabulary");
            cs.setUri("http://www.nlm.nih.gov/research/umls/rxnorm");
            cs.setVersion("2024-05");
            return codeSystemRepository.save(cs);
        });

        ctx.ucum = codeSystemRepository.findByCode("UCUM").orElseGet(() -> {
            CodeSystem cs = new CodeSystem();
            cs.setCode("UCUM");
            cs.setName("Unified Code for Units of Measure");
            cs.setUri("http://unitsofmeasure.org");
            cs.setVersion("2.1");
            return codeSystemRepository.save(cs);
        });

        // Terminology Codes
        if (terminologyCodeRepository.count() == 0) {
            saveCode(ctx.icd10, "I21.0", "ST elevation myocardial infarction (STEMI) of anterior wall");
            saveCode(ctx.icd10, "I10", "Essential (primary) hypertension");
            saveCode(ctx.icd10, "E11.9", "Type 2 diabetes mellitus without complications");
            saveCode(ctx.icd10, "G44.2", "Tension-type headache");
            saveCode(ctx.icd10, "J45.9", "Other and unspecified asthma");
            saveCode(ctx.icd10, "K35.80", "Unspecified acute appendicitis");

            saveCode(ctx.snomed, "22298006", "Myocardial infarction (disorder)");
            saveCode(ctx.snomed, "38341003", "Hypertensive disorder, systemic arterial (disorder)");
            saveCode(ctx.snomed, "73211009", "Diabetes mellitus (disorder)");
            saveCode(ctx.snomed, "415070008", "Percutaneous coronary intervention (procedure)");
            saveCode(ctx.snomed, "268400002", "12 lead electrocardiogram (procedure)");

            saveCode(ctx.loinc, "49563-0", "Cardiac troponin I [Mass/volume] in Serum or Plasma");
            saveCode(ctx.loinc, "4548-4", "Hemoglobin A1c/Hemoglobin.total in Blood");
            saveCode(ctx.loinc, "58410-2", "Complete blood count panel - Blood by Automated count");
            saveCode(ctx.loinc, "85354-9", "Blood pressure panel with all children optional");
            saveCode(ctx.loinc, "8867-4", "Heart rate");
            saveCode(ctx.loinc, "2708-6", "Oxygen saturation in Arterial blood by Pulse oximetry");
        }

        // Units of Measure
        if (terminologyUnitRepository.count() == 0) {
            saveUnit("mmHg", "Millimeters of Mercury", "mm[Hg]");
            saveUnit("bpm", "Beats Per Minute", "/min");
            saveUnit("%", "Percent", "%");
            saveUnit("mg/dL", "Milligrams per Deciliter", "mg/dL");
            saveUnit("g/dL", "Grams per Deciliter", "g/dL");
            saveUnit("degC", "Degrees Celsius", "Cel");
            saveUnit("pg/mL", "Picograms per Milliliter", "pg/mL");
            saveUnit("kg", "Kilograms", "kg");
            saveUnit("cm", "Centimeters", "cm");
            saveUnit("mL", "Milliliters", "mL");
        }

        return ctx;
    }

    private void saveCode(CodeSystem cs, String code, String display) {
        TerminologyCode tc = new TerminologyCode();
        tc.setCodeSystem(cs);
        tc.setCode(code);
        tc.setDisplay(display);
        tc.setActive(true);
        tc.setValidFrom(LocalDate.of(2020, 1, 1));
        terminologyCodeRepository.save(tc);
    }

    private void saveUnit(String code, String display, String ucum) {
        TerminologyUnit tu = new TerminologyUnit();
        tu.setCode(code);
        tu.setDisplay(display);
        tu.setUcumCode(ucum);
        terminologyUnitRepository.save(tu);
    }

    // =========================================================================
    // 2. TENANCY HIERARCHY
    // =========================================================================
    public static class TenancyContext {
        public Organization aiims;
        public Organization aiimsGorakhpur;
        public Organization apollo;
        public Organization maxHealthcare;

        public Department cardio;
        public Department neuro;
        public Department emer;
        public Department genmed;
        public Department rad;
        public Department path;

        public Department apolloCardio;
        public Department apolloOnco;
        public Department apolloEmer;

        public Department maxCardio;
        public Department maxGenMed;
        public Department maxEmer;

        public Ward cardWard;
        public Ward ccu;
        public Ward neuroWard;
        public Ward emerBay;

        public Room room101;
        public Room roomCcu01;
        public Room room201;
        public Room roomEr01;

        public Bed bed101_1;
        public Bed bed101_2;
        public Bed bedCcu1;
        public Bed bed201_1;
        public Bed bedEr1;
    }

    private TenancyContext initTenancy() {
        TenancyContext ctx = new TenancyContext();

        // Organizations
        ctx.aiims = organizationRepository.findByCode("AIIMS-DEL").orElseGet(() -> {
            Organization o = new Organization("AIIMS-DEL", "AIIMS New Delhi");
            o.setLegalName("All India Institute of Medical Sciences");
            o.setOrganizationType("HOSPITAL");
            o.setTimezone("Asia/Kolkata");
            o.setCountryCode("IN");
            o.setPhone("+91-11-26588500");
            o.setEmail("director@aiims.edu");
            o.setWebsite("https://www.aiims.edu");
            o.setAddressLine1("Sri Aurobindo Marg, Ansari Nagar");
            o.setCity("New Delhi");
            o.setState("Delhi");
            o.setPostalCode("110029");
            o.setStatus("ACTIVE");
            return organizationRepository.save(o);
        });

        ctx.aiimsGorakhpur = organizationRepository.findByCode("AIIMS-GKP").orElseGet(() -> {
            Organization o = new Organization("AIIMS-GKP", "AIIMS Gorakhpur");
            o.setLegalName("All India Institute of Medical Sciences, Gorakhpur");
            o.setOrganizationType("HOSPITAL");
            o.setTimezone("Asia/Kolkata");
            o.setCountryCode("IN");
            o.setPhone("+91-551-2205501");
            o.setEmail("admin@aiimsgorakhpur.edu.in");
            o.setWebsite("https://aiimsgorakhpur.edu.in");
            o.setAddressLine1("Kunraghat, Gorakhpur");
            o.setCity("Gorakhpur");
            o.setState("Uttar Pradesh");
            o.setPostalCode("273008");
            o.setStatus("ACTIVE");
            return organizationRepository.save(o);
        });

        ctx.apollo = organizationRepository.findByCode("APOLLO-MUM").orElseGet(() -> {
            Organization o = new Organization("APOLLO-MUM", "Apollo Hospitals Mumbai");
            o.setLegalName("Apollo Hospitals Enterprise Ltd - Mumbai");
            o.setOrganizationType("HOSPITAL");
            o.setTimezone("Asia/Kolkata");
            o.setCountryCode("IN");
            o.setPhone("+91-22-66920000");
            o.setEmail("admin@apollomumbai.com");
            o.setWebsite("https://www.apollohospitals.com");
            o.setAddressLine1("Plot # 13, Parsik Hill Rd, Sector 23, CBD Belapur");
            o.setCity("Navi Mumbai");
            o.setState("Maharashtra");
            o.setPostalCode("400614");
            o.setStatus("ACTIVE");
            return organizationRepository.save(o);
        });

        ctx.maxHealthcare = organizationRepository.findByCode("MAX-DEL").orElseGet(() -> {
            Organization o = new Organization("MAX-DEL", "Max Super Speciality Hospital");
            o.setLegalName("Max Healthcare Institute Limited");
            o.setOrganizationType("HOSPITAL");
            o.setTimezone("Asia/Kolkata");
            o.setCountryCode("IN");
            o.setPhone("+91-11-26515050");
            o.setEmail("contact@maxhealthcare.com");
            o.setWebsite("https://www.maxhealthcare.in");
            o.setAddressLine1("1, 2, Press Enclave Marg, Saket");
            o.setCity("New Delhi");
            o.setState("Delhi");
            o.setPostalCode("110017");
            o.setStatus("ACTIVE");
            return organizationRepository.save(o);
        });

        // AIIMS Departments
        ctx.cardio = departmentRepository.findByOrganizationIdAndCode(ctx.aiims.getId(), "CARD").orElseGet(() -> {
            Department d = new Department();
            d.setOrganization(ctx.aiims);
            d.setCode("CARD");
            d.setName("Department of Cardiology");
            d.setDepartmentType("CLINICAL");
            d.setStatus("ACTIVE");
            return departmentRepository.save(d);
        });

        ctx.neuro = departmentRepository.findByOrganizationIdAndCode(ctx.aiims.getId(), "NEURO").orElseGet(() -> {
            Department d = new Department();
            d.setOrganization(ctx.aiims);
            d.setCode("NEURO");
            d.setName("Department of Neurology");
            d.setDepartmentType("CLINICAL");
            d.setStatus("ACTIVE");
            return departmentRepository.save(d);
        });

        ctx.emer = departmentRepository.findByOrganizationIdAndCode(ctx.aiims.getId(), "EMER").orElseGet(() -> {
            Department d = new Department();
            d.setOrganization(ctx.aiims);
            d.setCode("EMER");
            d.setName("Emergency & Critical Care Medicine");
            d.setDepartmentType("EMERGENCY");
            d.setStatus("ACTIVE");
            return departmentRepository.save(d);
        });

        ctx.genmed = departmentRepository.findByOrganizationIdAndCode(ctx.aiims.getId(), "GENMED").orElseGet(() -> {
            Department d = new Department();
            d.setOrganization(ctx.aiims);
            d.setCode("GENMED");
            d.setName("General Internal Medicine");
            d.setDepartmentType("CLINICAL");
            d.setStatus("ACTIVE");
            return departmentRepository.save(d);
        });

        ctx.rad = departmentRepository.findByOrganizationIdAndCode(ctx.aiims.getId(), "RAD").orElseGet(() -> {
            Department d = new Department();
            d.setOrganization(ctx.aiims);
            d.setCode("RAD");
            d.setName("Radiodiagnosis & Imaging");
            d.setDepartmentType("DIAGNOSTIC");
            d.setStatus("ACTIVE");
            return departmentRepository.save(d);
        });

        ctx.path = departmentRepository.findByOrganizationIdAndCode(ctx.aiims.getId(), "PATH").orElseGet(() -> {
            Department d = new Department();
            d.setOrganization(ctx.aiims);
            d.setCode("PATH");
            d.setName("Pathology & Clinical Biochemistry");
            d.setDepartmentType("LABORATORY");
            d.setStatus("ACTIVE");
            return departmentRepository.save(d);
        });

        // Apollo Departments
        ctx.apolloCardio = departmentRepository.findByOrganizationIdAndCode(ctx.apollo.getId(), "CARD").orElseGet(() -> {
            Department d = new Department();
            d.setOrganization(ctx.apollo);
            d.setCode("CARD");
            d.setName("Cardiology & Cath Lab");
            d.setDepartmentType("CLINICAL");
            d.setStatus("ACTIVE");
            return departmentRepository.save(d);
        });

        ctx.apolloOnco = departmentRepository.findByOrganizationIdAndCode(ctx.apollo.getId(), "ONCO").orElseGet(() -> {
            Department d = new Department();
            d.setOrganization(ctx.apollo);
            d.setCode("ONCO");
            d.setName("Medical Oncology & Cancer Center");
            d.setDepartmentType("CLINICAL");
            d.setStatus("ACTIVE");
            return departmentRepository.save(d);
        });

        ctx.apolloEmer = departmentRepository.findByOrganizationIdAndCode(ctx.apollo.getId(), "EMER").orElseGet(() -> {
            Department d = new Department();
            d.setOrganization(ctx.apollo);
            d.setCode("EMER");
            d.setName("Emergency & Trauma Center");
            d.setDepartmentType("EMERGENCY");
            d.setStatus("ACTIVE");
            return departmentRepository.save(d);
        });

        // Max Healthcare Departments
        ctx.maxCardio = departmentRepository.findByOrganizationIdAndCode(ctx.maxHealthcare.getId(), "CARD").orElseGet(() -> {
            Department d = new Department();
            d.setOrganization(ctx.maxHealthcare);
            d.setCode("CARD");
            d.setName("Cardiology Institute");
            d.setDepartmentType("CLINICAL");
            d.setStatus("ACTIVE");
            return departmentRepository.save(d);
        });

        ctx.maxGenMed = departmentRepository.findByOrganizationIdAndCode(ctx.maxHealthcare.getId(), "GENMED").orElseGet(() -> {
            Department d = new Department();
            d.setOrganization(ctx.maxHealthcare);
            d.setCode("GENMED");
            d.setName("Internal Medicine & Outpatient");
            d.setDepartmentType("CLINICAL");
            d.setStatus("ACTIVE");
            return departmentRepository.save(d);
        });

        ctx.maxEmer = departmentRepository.findByOrganizationIdAndCode(ctx.maxHealthcare.getId(), "EMER").orElseGet(() -> {
            Department d = new Department();
            d.setOrganization(ctx.maxHealthcare);
            d.setCode("EMER");
            d.setName("24x7 Emergency Care Unit");
            d.setDepartmentType("EMERGENCY");
            d.setStatus("ACTIVE");
            return departmentRepository.save(d);
        });

        // Wards
        ctx.cardWard = wardRepository.findByOrganizationId(ctx.aiims.getId()).stream()
                .filter(w -> "CARD-W1".equals(w.getCode())).findFirst().orElseGet(() -> {
                    Ward w = new Ward();
                    w.setOrganization(ctx.aiims);
                    w.setDepartment(ctx.cardio);
                    w.setCode("CARD-W1");
                    w.setName("Cardiology Step-Down Ward");
                    w.setWardType("GENERAL");
                    w.setGenderPolicy("MIXED");
                    w.setStatus("ACTIVE");
                    return wardRepository.save(w);
                });

        ctx.ccu = wardRepository.findByOrganizationId(ctx.aiims.getId()).stream()
                .filter(w -> "CARD-CCU".equals(w.getCode())).findFirst().orElseGet(() -> {
                    Ward w = new Ward();
                    w.setOrganization(ctx.aiims);
                    w.setDepartment(ctx.cardio);
                    w.setCode("CARD-CCU");
                    w.setName("Coronary Intensive Care Unit (CCU)");
                    w.setWardType("ICU");
                    w.setGenderPolicy("MIXED");
                    w.setStatus("ACTIVE");
                    return wardRepository.save(w);
                });

        ctx.neuroWard = wardRepository.findByOrganizationId(ctx.aiims.getId()).stream()
                .filter(w -> "NEURO-W1".equals(w.getCode())).findFirst().orElseGet(() -> {
                    Ward w = new Ward();
                    w.setOrganization(ctx.aiims);
                    w.setDepartment(ctx.neuro);
                    w.setCode("NEURO-W1");
                    w.setName("Neurology Inpatient Ward");
                    w.setWardType("GENERAL");
                    w.setGenderPolicy("MIXED");
                    w.setStatus("ACTIVE");
                    return wardRepository.save(w);
                });

        ctx.emerBay = wardRepository.findByOrganizationId(ctx.aiims.getId()).stream()
                .filter(w -> "EMER-TB".equals(w.getCode())).findFirst().orElseGet(() -> {
                    Ward w = new Ward();
                    w.setOrganization(ctx.aiims);
                    w.setDepartment(ctx.emer);
                    w.setCode("EMER-TB");
                    w.setName("Emergency Resuscitation & Triage Bay");
                    w.setWardType("EMERGENCY");
                    w.setGenderPolicy("MIXED");
                    w.setStatus("ACTIVE");
                    return wardRepository.save(w);
                });

        // Rooms
        ctx.room101 = roomRepository.findByWardIdAndRoomNumber(ctx.cardWard.getId(), "101").orElseGet(() -> {
            Room r = new Room();
            r.setOrganization(ctx.aiims);
            r.setWard(ctx.cardWard);
            r.setRoomNumber("101");
            r.setRoomType("GENERAL");
            r.setFloor("1");
            r.setStatus("ACTIVE");
            return roomRepository.save(r);
        });

        ctx.roomCcu01 = roomRepository.findByWardIdAndRoomNumber(ctx.ccu.getId(), "CCU-01").orElseGet(() -> {
            Room r = new Room();
            r.setOrganization(ctx.aiims);
            r.setWard(ctx.ccu);
            r.setRoomNumber("CCU-01");
            r.setRoomType("ICU");
            r.setFloor("2");
            r.setStatus("ACTIVE");
            return roomRepository.save(r);
        });

        ctx.room201 = roomRepository.findByWardIdAndRoomNumber(ctx.neuroWard.getId(), "201").orElseGet(() -> {
            Room r = new Room();
            r.setOrganization(ctx.aiims);
            r.setWard(ctx.neuroWard);
            r.setRoomNumber("201");
            r.setRoomType("SEMI_PRIVATE");
            r.setFloor("2");
            r.setStatus("ACTIVE");
            return roomRepository.save(r);
        });

        ctx.roomEr01 = roomRepository.findByWardIdAndRoomNumber(ctx.emerBay.getId(), "ER-01").orElseGet(() -> {
            Room r = new Room();
            r.setOrganization(ctx.aiims);
            r.setWard(ctx.emerBay);
            r.setRoomNumber("ER-01");
            r.setRoomType("TRAUMA");
            r.setFloor("G");
            r.setStatus("ACTIVE");
            return roomRepository.save(r);
        });

        // Beds
        ctx.bed101_1 = bedRepository.findByBedCode("B101-1").orElseGet(() -> {
            Bed b = new Bed();
            b.setOrganization(ctx.aiims);
            b.setWard(ctx.cardWard);
            b.setRoom(ctx.room101);
            b.setBedCode("B101-1");
            b.setBedNumber("101-1");
            b.setBedType("STANDARD");
            b.setStatus("AVAILABLE");
            return bedRepository.save(b);
        });

        ctx.bed101_2 = bedRepository.findByBedCode("B101-2").orElseGet(() -> {
            Bed b = new Bed();
            b.setOrganization(ctx.aiims);
            b.setWard(ctx.cardWard);
            b.setRoom(ctx.room101);
            b.setBedCode("B101-2");
            b.setBedNumber("101-2");
            b.setBedType("STANDARD");
            b.setStatus("AVAILABLE");
            return bedRepository.save(b);
        });

        ctx.bedCcu1 = bedRepository.findByBedCode("B-CCU-1").orElseGet(() -> {
            Bed b = new Bed();
            b.setOrganization(ctx.aiims);
            b.setWard(ctx.ccu);
            b.setRoom(ctx.roomCcu01);
            b.setBedCode("B-CCU-1");
            b.setBedNumber("CCU-1");
            b.setBedType("ICU");
            b.setStatus("OCCUPIED");
            return bedRepository.save(b);
        });

        ctx.bed201_1 = bedRepository.findByBedCode("B201-1").orElseGet(() -> {
            Bed b = new Bed();
            b.setOrganization(ctx.aiims);
            b.setWard(ctx.neuroWard);
            b.setRoom(ctx.room201);
            b.setBedCode("B201-1");
            b.setBedNumber("201-1");
            b.setBedType("STANDARD");
            b.setStatus("AVAILABLE");
            return bedRepository.save(b);
        });

        ctx.bedEr1 = bedRepository.findByBedCode("B-ER-1").orElseGet(() -> {
            Bed b = new Bed();
            b.setOrganization(ctx.aiims);
            b.setWard(ctx.emerBay);
            b.setRoom(ctx.roomEr01);
            b.setBedCode("B-ER-1");
            b.setBedNumber("ER-1");
            b.setBedType("EMERGENCY");
            b.setStatus("AVAILABLE");
            return bedRepository.save(b);
        });

        return ctx;
    }

    // =========================================================================
    // 3. SECURITY & ROLES
    // =========================================================================
    private Map<String, Permission> initPermissions() {
        String[][] permDefs = {
            {"PATIENT_READ", "Read Patient Demographics", "PATIENT"},
            {"PATIENT_CREATE", "Register New Patient", "PATIENT"},
            {"PATIENT_UPDATE", "Update Patient Details", "PATIENT"},
            {"PATIENT_UPDATE_DEMOGRAPHICS", "Update Patient Demographics", "PATIENT"},
            {"PATIENT_UPDATE_CLINICAL", "Update Patient Clinical Info", "PATIENT"},
            {"MPI_SEARCH", "Master Patient Index Search", "PATIENT"},
            {"MPI_MERGE_REQUEST", "Request Patient Merge", "PATIENT"},

            {"ALLERGY_READ", "Read Allergy Records", "CLINICAL"},
            {"ALLERGY_CREATE", "Create Allergy Record", "CLINICAL"},
            {"ALLERGY_UPDATE", "Update Allergy Record", "CLINICAL"},
            {"ALLERGY_UPDATE_STATUS", "Update Allergy Status", "CLINICAL"},

            {"DIAGNOSIS_READ", "Read Diagnoses", "CLINICAL"},
            {"DIAGNOSIS_CREATE", "Create Diagnosis", "CLINICAL"},
            {"DIAGNOSIS_UPDATE", "Update Diagnosis", "CLINICAL"},

            {"VITALS_READ", "Read Vitals", "CLINICAL"},
            {"VITALS_CREATE", "Record Vitals", "CLINICAL"},

            {"ENCOUNTER_READ", "Read Encounters", "CLINICAL"},
            {"ENCOUNTER_CREATE", "Create Encounter", "CLINICAL"},
            {"ENCOUNTER_UPDATE", "Update Encounter", "CLINICAL"},

            {"CLINICAL_NOTE_READ", "Read Clinical Documents", "CLINICAL"},
            {"CLINICAL_NOTE_CREATE", "Create Clinical Document", "CLINICAL"},

            {"PRESCRIPTION_READ", "Read Prescriptions", "PHARMACY"},
            {"PRESCRIPTION_CREATE", "Create Prescription", "PHARMACY"},
            {"PRESCRIPTION_UPDATE", "Update Prescription", "PHARMACY"},
            {"PRESCRIPTION_UPDATE_STATUS", "Update Prescription Status", "PHARMACY"},
            {"MEDICATION_DISPENSE", "Dispense Medication", "PHARMACY"},
            {"MAR_READ", "Read Medication Administration Records", "PHARMACY"},
            {"MAR_ADMINISTER", "Administer Medication (eMAR)", "PHARMACY"},

            {"LAB_ORDER_CREATE", "Order Lab Tests", "LABORATORY"},
            {"LAB_RESULT_READ", "Read Lab Results", "LABORATORY"},
            {"LAB_RESULT_CREATE", "Submit Lab Results", "LABORATORY"},

            {"PROCEDURE_READ", "Read Procedures", "PROCEDURE"},
            {"PROCEDURE_ORDER", "Order Surgical Procedure", "PROCEDURE"},
            {"PROCEDURE_PERFORM", "Document Procedure Execution", "PROCEDURE"},

            {"IMAGING_READ", "Read Imaging Studies & DICOM", "IMAGING"},
            {"IMAGING_ORDER", "Order Imaging Diagnostic Study", "IMAGING"},
            {"IMAGING_REPORT", "Generate Radiologist Report", "IMAGING"},

            {"APPOINTMENT_READ", "Read Appointments", "SCHEDULING"},
            {"APPOINTMENT_CREATE", "Create Appointment", "SCHEDULING"},
            {"APPOINTMENT_UPDATE", "Update Appointment", "SCHEDULING"},
            {"APPOINTMENT_SCHEDULE", "Schedule Appointment", "SCHEDULING"},
            {"APPOINTMENT_STATUS_UPDATE", "Update Appointment Status", "SCHEDULING"},
            {"APPOINTMENT_CHECKIN", "Patient Check-in", "SCHEDULING"},
            {"APPOINTMENT_TRIAGE", "Triage Patient", "SCHEDULING"},
            {"APPOINTMENT_DOCTOR_CONSULT", "Doctor Consultation", "SCHEDULING"},
            {"APPOINTMENT_BILLING_GENERATE", "Generate Billing", "SCHEDULING"},
            {"APPOINTMENT_NOTES_ADD", "Add Appointment Notes", "SCHEDULING"},
            {"APPOINTMENT_CANCEL", "Cancel Appointment", "SCHEDULING"},

            {"INVOICE_READ", "Read Invoices", "BILLING"},
            {"INVOICE_CREATE", "Create Invoice", "BILLING"},
            {"BILLING_READ", "Read Billing Accounts", "BILLING"},
            {"BILLING_WRITE", "Manage Billing Accounts", "BILLING"},
            {"PAYMENT_CAPTURE", "Record Patient Payment", "BILLING"},
            {"REFUND_PROCESS", "Process Financial Refund", "BILLING"},

            {"INSURANCE_READ", "Read Insurance Policies & Claims", "INSURANCE"},
            {"INSURANCE_CLAIM_CREATE", "Submit Insurance Claim", "INSURANCE"},
            {"INSURANCE_VERIFY", "Verify Real-time Eligibility", "INSURANCE"},

            {"CONSENT_READ", "Read Patient Consents", "CONSENT"},
            {"CONSENT_MANAGE", "Grant or Revoke Patient Consents", "CONSENT"},

            {"DOCUMENT_READ", "Read Attached Documents", "DOCUMENT"},
            {"DOCUMENT_UPLOAD", "Upload Clinical Document", "DOCUMENT"},

            {"TENANCY_READ", "Read Tenancy & Facilities", "ADMIN"},
            {"TENANCY_WRITE", "Manage Tenancy & Facilities", "ADMIN"},
            {"PRACTITIONER_READ", "Read Practitioners", "ADMIN"},
            {"PRACTITIONER_WRITE", "Manage Practitioners", "ADMIN"},
            {"ADMIN_USER_MANAGE", "Manage User Accounts", "ADMIN"},
            {"ADMIN_FHIR_INGEST", "Ingest FHIR Bundles", "ADMIN"},
            {"AUDIT_LOG_READ", "Read Security Audit Logs", "ADMIN"},
            {"FHIR_QUERY", "Execute FHIR Queries", "ADMIN"}
        };

        Map<String, Permission> map = new HashMap<>();
        for (String[] def : permDefs) {
            String code = def[0];
            String name = def[1];
            String cat = def[2];
            Permission perm = permissionRepository.findByCode(code)
                .orElseGet(() -> permissionRepository.save(new Permission(code, name, cat, name)));
            map.put(code, perm);
        }
        return map;
    }

    private Map<String, Role> initRoles(Map<String, Permission> permissions) {
        String[] canonicalRoles = {
            "SUPER_ADMIN", "ORGANIZATION_ADMIN", "PHYSICIAN", "NURSE", "RECEPTIONIST",
            "LAB_TECHNICIAN", "PHARMACIST", "RADIOLOGIST", "BILLING_STAFF", "PATIENT"
        };

        Map<String, Role> map = new HashMap<>();
        for (String roleName : canonicalRoles) {
            Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(new Role(roleName, roleName + " Role")));

            // Assign proper sets of permissions
            Set<Permission> rolePerms = new HashSet<>();
            if (roleName.equals("SUPER_ADMIN") || roleName.equals("ORGANIZATION_ADMIN")) {
                rolePerms.addAll(permissions.values());
            } else if (roleName.equals("PHYSICIAN")) {
                assignPermsByPrefix(rolePerms, permissions, "PATIENT_", "ALLERGY_", "DIAGNOSIS_", "VITALS_", "ENCOUNTER_", "CLINICAL_NOTE_", "PRESCRIPTION_", "LAB_ORDER_", "LAB_RESULT_READ", "PROCEDURE_", "IMAGING_ORDER", "IMAGING_READ", "APPOINTMENT_");
            } else if (roleName.equals("NURSE")) {
                assignPermsByPrefix(rolePerms, permissions, "PATIENT_READ", "VITALS_", "ALLERGY_READ", "DIAGNOSIS_READ", "ENCOUNTER_READ", "MAR_", "LAB_ORDER_CREATE", "LAB_RESULT_READ", "APPOINTMENT_TRIAGE", "APPOINTMENT_CHECKIN");
            } else if (roleName.equals("PHARMACIST")) {
                assignPermsByPrefix(rolePerms, permissions, "PATIENT_READ", "PRESCRIPTION_", "MEDICATION_DISPENSE", "MAR_READ");
            } else if (roleName.equals("LAB_TECHNICIAN")) {
                assignPermsByPrefix(rolePerms, permissions, "PATIENT_READ", "LAB_RESULT_", "LAB_ORDER_");
            } else if (roleName.equals("RADIOLOGIST")) {
                assignPermsByPrefix(rolePerms, permissions, "PATIENT_READ", "IMAGING_", "ENCOUNTER_READ");
            } else if (roleName.equals("RECEPTIONIST")) {
                assignPermsByPrefix(rolePerms, permissions, "PATIENT_", "MPI_", "APPOINTMENT_", "INVOICE_READ", "CONSENT_");
            } else if (roleName.equals("BILLING_STAFF")) {
                assignPermsByPrefix(rolePerms, permissions, "PATIENT_READ", "INVOICE_", "BILLING_", "PAYMENT_", "REFUND_", "INSURANCE_");
            } else if (roleName.equals("PATIENT")) {
                assignPermsByPrefix(rolePerms, permissions, "PATIENT_READ", "APPOINTMENT_READ", "APPOINTMENT_CREATE", "INVOICE_READ", "CONSENT_READ");
            }

            role.setPermissions(rolePerms);
            roleRepository.save(role);
            map.put(roleName, role);
        }
        return map;
    }

    private void assignPermsByPrefix(Set<Permission> target, Map<String, Permission> source, String... prefixes) {
        for (Permission p : source.values()) {
            for (String prefix : prefixes) {
                if (p.getCode().startsWith(prefix) || p.getCode().equals(prefix)) {
                    target.add(p);
                    break;
                }
            }
        }
    }

    private void initAbacPolicies() {
        if (abacPolicyRepository.count() == 0) {
            AbacPolicy p1 = new AbacPolicy();
            p1.setName("Department Isolation Policy");
            p1.setDescription("Restricts patient chart viewing to attending department clinicians");
            p1.setSubjectRole("PHYSICIAN");
            p1.setResourceType("PATIENT_CHART");
            p1.setAction("READ");
            p1.setConstraintExpression("user.departmentId == patient.departmentId");
            p1.setActive(true);
            abacPolicyRepository.save(p1);

            AbacPolicy p2 = new AbacPolicy();
            p2.setName("Emergency Break-Glass Policy");
            p2.setDescription("Permits override access to clinical records during triage emergencies");
            p2.setSubjectRole("PHYSICIAN");
            p2.setResourceType("PATIENT_CHART");
            p2.setAction("BREAK_GLASS");
            p2.setConstraintExpression("request.reason != null && request.emergency == true");
            p2.setActive(true);
            abacPolicyRepository.save(p2);

            AbacPolicy p3 = new AbacPolicy();
            p3.setName("ABDM Export Policy");
            p3.setDescription("Requires explicit granted ABDM consent before FHIR bundle export");
            p3.setSubjectRole("PHYSICIAN");
            p3.setResourceType("ABDM_BUNDLE");
            p3.setAction("EXPORT");
            p3.setConstraintExpression("patient.hasActiveConsent('ABDM_DATA_SHARE') == true");
            p3.setActive(true);
            abacPolicyRepository.save(p3);
        }
    }

    // =========================================================================
    // 4. IDENTITY & STAFF USERS
    // =========================================================================
    public static class IdentityContext {
        public User admin;
        public User arjun;
        public User priya;
        public User rajesh;
        public User vikramRad;
        public User sunita;
        public User rahul;
        public User sarita;
        public User amit;
        public User anitaPharm;
        public User vikas;
        public User orgAdminVikram;

        public User siddharthDoc;
        public User meeraNurse;
        public User rohanRec;
        public User poojaPharm;
        public User kunalLab;
        public User ananyaBilling;

        public User nehaOrgAdmin;
        public User kabirDoc;
        public User kavitaNurse;
        public User manishRec;

        public User rameshUser;
        public User anitaUser;
        public User sureshUser;
        public User priyankaUser;
        public User sunilUser;
        public User deepikaUser;
        public User azharUser;

        public Practitioner arjunPrac;
        public Practitioner priyaPrac;
        public Practitioner rajeshPrac;
        public Practitioner vikramPrac;
        public Practitioner sunitaPrac;
        public Practitioner rahulPrac;
        public Practitioner siddharthPrac;
        public Practitioner kabirPrac;
    }

    private IdentityContext initIdentity(Map<String, Role> roles, TenancyContext tenancy) {
        String defaultPass = passwordEncoder.encode("Sentinel@123");
        IdentityContext ctx = new IdentityContext();

        // 1. Admin
        ctx.admin = createStaffUser("admin@sentinel.local", defaultPass, "System", "Administrator", "MALE", LocalDate.of(1980, 1, 1), roles.get("SUPER_ADMIN"));

        // 2. Dr. Arjun Sharma (Multi-tenant Cardiologist: AIIMS + Apollo Mumbai + Max Healthcare)
        ctx.arjun = createStaffUser("arjun.sharma@aiims.edu", defaultPass, "Arjun", "Sharma", "MALE", LocalDate.of(1982, 6, 15), roles.get("PHYSICIAN"));
        linkStaffToTenancy(ctx.arjun, tenancy.aiims, tenancy.cardio, "EMP-AIIMS-CARD-01", "FULL_TIME");
        linkStaffToTenancy(ctx.arjun, tenancy.apollo, tenancy.apolloCardio, "EMP-APL-CARD-02", "CONSULTANT");
        linkStaffToTenancy(ctx.arjun, tenancy.maxHealthcare, tenancy.maxCardio, "EMP-MAX-CARD-01", "VISITING");
        ctx.arjunPrac = createPractitioner(ctx.arjun.getPerson(), "MCI-2010-12345", "PHYSICIAN", "Cardiology", "DMC-DL-11029", "Delhi Medical Council", "Interventional Cardiology", "CARD_INTERV");

        // 3. Dr. Priya Kapoor (Multi-tenant Neurologist: AIIMS + Max Healthcare)
        ctx.priya = createStaffUser("priya.kapoor@aiims.edu", defaultPass, "Priya", "Kapoor", "FEMALE", LocalDate.of(1988, 3, 22), roles.get("PHYSICIAN"));
        linkStaffToTenancy(ctx.priya, tenancy.aiims, tenancy.neuro, "EMP-AIIMS-NEURO-01", "FULL_TIME");
        linkStaffToTenancy(ctx.priya, tenancy.maxHealthcare, tenancy.maxGenMed, "EMP-MAX-NEURO-02", "CONSULTANT");
        ctx.priyaPrac = createPractitioner(ctx.priya.getPerson(), "MCI-2015-67890", "PHYSICIAN", "Neurology", "DMC-DL-18842", "Delhi Medical Council", "Clinical Neurology & Stroke", "NEURO_STROKE");

        // 4. Dr. Rajesh Patel (Multi-tenant Emergency: AIIMS + Apollo)
        ctx.rajesh = createStaffUser("rajesh.patel@aiims.edu", defaultPass, "Rajesh", "Patel", "MALE", LocalDate.of(1978, 11, 8), roles.get("PHYSICIAN"));
        linkStaffToTenancy(ctx.rajesh, tenancy.aiims, tenancy.emer, "EMP-AIIMS-EMER-01", "FULL_TIME");
        linkStaffToTenancy(ctx.rajesh, tenancy.apollo, tenancy.apolloEmer, "EMP-APL-EMER-02", "VISITING");
        ctx.rajeshPrac = createPractitioner(ctx.rajesh.getPerson(), "MCI-2008-33445", "PHYSICIAN", "Emergency Medicine", "DMC-DL-09912", "Delhi Medical Council", "Trauma & Resuscitation", "EMER_TRAUMA");

        // 5. Dr. Vikram Sethi (Radiologist)
        ctx.vikramRad = createStaffUser("vikram.sethi@aiims.edu", defaultPass, "Vikram", "Sethi", "MALE", LocalDate.of(1984, 5, 12), roles.get("RADIOLOGIST"));
        linkStaffToTenancy(ctx.vikramRad, tenancy.aiims, tenancy.rad, "EMP-AIIMS-RAD-01", "FULL_TIME");
        ctx.vikramPrac = createPractitioner(ctx.vikramRad.getPerson(), "MCI-2012-77889", "PHYSICIAN", "Radiology", "DMC-DL-14401", "Delhi Medical Council", "Diagnostic Neuroradiology", "RAD_DIAG");

        // 6. Nurse Sunita Verma (CCU Senior Nurse)
        ctx.sunita = createStaffUser("sunita.verma@aiims.edu", defaultPass, "Sunita", "Verma", "FEMALE", LocalDate.of(1985, 7, 30), roles.get("NURSE"));
        linkStaffToTenancy(ctx.sunita, tenancy.aiims, tenancy.cardio, "EMP-AIIMS-NUR-01", "FULL_TIME");
        ctx.sunitaPrac = createPractitioner(ctx.sunita.getPerson(), "INC-2006-55555", "NURSE", "Critical Care Nursing", "DNC-NUR-5501", "Delhi Nursing Council", "Cardiac Intensive Care", "NUR_CCU");

        // 7. Nurse Rahul Nair (Emergency / Triage Nurse)
        ctx.rahul = createStaffUser("rahul.nair@aiims.edu", defaultPass, "Rahul", "Nair", "MALE", LocalDate.of(1991, 9, 10), roles.get("NURSE"));
        linkStaffToTenancy(ctx.rahul, tenancy.aiims, tenancy.emer, "EMP-AIIMS-NUR-02", "FULL_TIME");
        ctx.rahulPrac = createPractitioner(ctx.rahul.getPerson(), "INC-2014-99881", "NURSE", "Emergency Nursing", "DNC-NUR-8820", "Delhi Nursing Council", "Emergency Triage", "NUR_EMER");

        // 8. Front Desk Receptionist Sarita Gupta (AIIMS)
        ctx.sarita = createStaffUser("sarita.gupta@aiims.edu", defaultPass, "Sarita", "Gupta", "FEMALE", LocalDate.of(1992, 9, 14), roles.get("RECEPTIONIST"));
        linkStaffToTenancy(ctx.sarita, tenancy.aiims, tenancy.genmed, "EMP-AIIMS-REC-01", "FULL_TIME");

        // 9. Senior Lab Technologist Amit Roy (AIIMS)
        ctx.amit = createStaffUser("amit.roy@aiims.edu", defaultPass, "Amit", "Roy", "MALE", LocalDate.of(1989, 4, 18), roles.get("LAB_TECHNICIAN"));
        linkStaffToTenancy(ctx.amit, tenancy.aiims, tenancy.path, "EMP-AIIMS-LAB-01", "FULL_TIME");

        // 10. Chief Pharmacist Anita Deshmukh (AIIMS)
        ctx.anitaPharm = createStaffUser("anita.deshmukh@aiims.edu", defaultPass, "Anita", "Deshmukh", "FEMALE", LocalDate.of(1986, 12, 5), roles.get("PHARMACIST"));
        linkStaffToTenancy(ctx.anitaPharm, tenancy.aiims, tenancy.cardio, "EMP-AIIMS-PHARM-01", "FULL_TIME");

        // 11. Financial Officer Vikas Mehta (AIIMS)
        ctx.vikas = createStaffUser("vikas.mehta@aiims.edu", defaultPass, "Vikas", "Mehta", "MALE", LocalDate.of(1984, 8, 27), roles.get("BILLING_STAFF"));
        linkStaffToTenancy(ctx.vikas, tenancy.aiims, tenancy.genmed, "EMP-AIIMS-FIN-01", "FULL_TIME");

        // 13. Apollo Hospitals Mumbai Staff Seeding
        ctx.orgAdminVikram = createStaffUser("vikram.singh@apollo.com", defaultPass, "Vikram", "Singh", "MALE", LocalDate.of(1975, 1, 20), roles.get("ORGANIZATION_ADMIN"));
        linkStaffToTenancy(ctx.orgAdminVikram, tenancy.apollo, null, "EMP-APL-MUM-01", "FULL_TIME");

        ctx.siddharthDoc = createStaffUser("siddharth.m@apollo.com", defaultPass, "Siddharth", "Mukherjee", "MALE", LocalDate.of(1980, 5, 14), roles.get("PHYSICIAN"));
        linkStaffToTenancy(ctx.siddharthDoc, tenancy.apollo, tenancy.apolloOnco, "EMP-APL-ONCO-01", "FULL_TIME");
        ctx.siddharthPrac = createPractitioner(ctx.siddharthDoc.getPerson(), "MCI-2009-44112", "PHYSICIAN", "Medical Oncology", "MMC-MH-44112", "Maharashtra Medical Council", "Clinical Oncology", "ONCO_CLIN");

        // 14. Max Healthcare Saket Staff Seeding
        ctx.nehaOrgAdmin = createStaffUser("neha.singhal@maxhealthcare.com", defaultPass, "Neha", "Singhal", "FEMALE", LocalDate.of(1977, 4, 18), roles.get("ORGANIZATION_ADMIN"));
        linkStaffToTenancy(ctx.nehaOrgAdmin, tenancy.maxHealthcare, null, "EMP-MAX-ADM-01", "FULL_TIME");

        ctx.kabirDoc = createStaffUser("kabir.anand@maxhealthcare.com", defaultPass, "Kabir", "Anand", "MALE", LocalDate.of(1983, 7, 29), roles.get("PHYSICIAN"));
        linkStaffToTenancy(ctx.kabirDoc, tenancy.maxHealthcare, tenancy.maxCardio, "EMP-MAX-CARD-02", "FULL_TIME");
        ctx.kabirPrac = createPractitioner(ctx.kabirDoc.getPerson(), "MCI-2011-99882", "PHYSICIAN", "Cardiology", "DMC-DL-23091", "Delhi Medical Council", "Interventional Cardiology", "CARD_INTERV");

        ctx.kavitaNurse = createStaffUser("kavita.joshi@maxhealthcare.com", defaultPass, "Kavita", "Joshi", "FEMALE", LocalDate.of(1989, 1, 14), roles.get("NURSE"));
        linkStaffToTenancy(ctx.kavitaNurse, tenancy.maxHealthcare, tenancy.maxEmer, "EMP-MAX-NUR-01", "FULL_TIME");

        ctx.manishRec = createStaffUser("manish.verma@maxhealthcare.com", defaultPass, "Manish", "Verma", "MALE", LocalDate.of(1994, 3, 5), roles.get("RECEPTIONIST"));
        linkStaffToTenancy(ctx.manishRec, tenancy.maxHealthcare, tenancy.maxGenMed, "EMP-MAX-REC-01", "FULL_TIME");

        // 15. Patient Portal Accounts
        ctx.rameshUser = createStaffUser("ramesh.kumar@gmail.com", defaultPass, "Ramesh", "Kumar", "MALE", LocalDate.of(1960, 4, 10), roles.get("PATIENT"));
        ctx.anitaUser = createStaffUser("anita.sharma@gmail.com", defaultPass, "Anita", "Sharma", "FEMALE", LocalDate.of(1975, 9, 25), roles.get("PATIENT"));
        ctx.sureshUser = createStaffUser("suresh.naidu95@gmail.com", defaultPass, "Suresh", "Naidu", "MALE", LocalDate.of(1995, 2, 28), roles.get("PATIENT"));
        ctx.priyankaUser = createStaffUser("priyanka.sen@gmail.com", defaultPass, "Priyanka", "Sen", "FEMALE", LocalDate.of(1992, 11, 15), roles.get("PATIENT"));
        ctx.sunilUser = createStaffUser("sunil.chawla@gmail.com", defaultPass, "Sunil", "Chawla", "MALE", LocalDate.of(1968, 6, 20), roles.get("PATIENT"));
        ctx.deepikaUser = createStaffUser("deepika.p@gmail.com", defaultPass, "Deepika", "Padukone", "FEMALE", LocalDate.of(1986, 1, 5), roles.get("PATIENT"));
        ctx.azharUser = createStaffUser("mohammed.azhar.dev@gmail.com", defaultPass, "Mohammed", "Azhar", "MALE", LocalDate.of(1988, 12, 3), roles.get("PATIENT"));

        return ctx;
    }

    private User createStaffUser(String email, String passwordHash, String first, String last, String sex, LocalDate dob, Role role) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            Person p = new Person();
            p.setFirstName(first);
            p.setLastName(last);
            p.setSexAtBirth(sex);
            p.setDateOfBirth(dob);
            p.setNationality("Indian");
            p.setPreferredLanguage("English, Hindi");
            p.setCreatedAt(OffsetDateTime.now());
            p.setUpdatedAt(OffsetDateTime.now());
            p = personRepository.save(p);

            User u = new User();
            u.setEmail(email);
            u.setPassword(passwordHash);
            u.setPerson(p);
            u.setStatus("ACTIVE");
            u.setMfaEnabled(false);
            u.setCreatedAt(OffsetDateTime.now());
            u.setUpdatedAt(OffsetDateTime.now());
            if (role != null) {
                u.getRoles().add(role);
            }
            return userRepository.save(u);
        });
    }

    private void linkStaffToTenancy(User user, Organization org, Department dept, String empCode, String empType) {
        if (org != null) {
            userOrganizationRepository.findByUserIdAndOrganizationId(user.getId(), org.getId()).orElseGet(() -> {
                UserOrganization uo = new UserOrganization();
                uo.setUser(user);
                uo.setOrganization(org);
                uo.setEmployeeCode(empCode);
                uo.setEmploymentType(empType);
                uo.setStatus("ACTIVE");
                uo.setJoinedAt(LocalDate.of(2021, 1, 15));
                return userOrganizationRepository.save(uo);
            });
        }
        if (dept != null) {
            userDepartmentRepository.findByUserIdAndDepartmentId(user.getId(), dept.getId()).orElseGet(() -> {
                UserDepartment ud = new UserDepartment(user, dept);
                return userDepartmentRepository.save(ud);
            });
        }
    }

    private Practitioner createPractitioner(Person person, String identifier, String type, String primarySpecialty, String licenseNo, String authority, String subSpecialtyName, String subSpecialtyCode) {
        return practitionerRepository.findByIdentifier(identifier).orElseGet(() -> {
            Practitioner p = new Practitioner();
            p.setPerson(person);
            p.setIdentifier(identifier);
            p.setPractitionerType(type);
            p.setPrimarySpecialty(primarySpecialty);
            p.setStatus("ACTIVE");
            p.setCreatedAt(OffsetDateTime.now());
            p.setUpdatedAt(OffsetDateTime.now());
            p = practitionerRepository.save(p);

            // License
            PractitionerLicense lic = new PractitionerLicense();
            lic.setPractitioner(p);
            lic.setLicenseNumber(licenseNo);
            lic.setIssuingAuthority(authority);
            lic.setState("Delhi");
            lic.setValidFrom(LocalDate.of(2015, 1, 1));
            lic.setValidTo(LocalDate.of(2030, 12, 31));
            practitionerLicenseRepository.save(lic);

            // Specialty
            PractitionerSpecialty spec = new PractitionerSpecialty();
            spec.setPractitioner(p);
            spec.setSpecialtyCode(subSpecialtyCode);
            spec.setSpecialtyName(subSpecialtyName);
            spec.setIsPrimary(true);
            practitionerSpecialtyRepository.save(spec);

            return p;
        });
    }

    // =========================================================================
    // 5. PATIENTS & DEMOGRAPHICS
    // =========================================================================
    public static class PatientContext {
        public Patient patient;
        public String mrn;
        public Person person;
        public Organization organization;
    }

    private List<PatientContext> initPatients(TenancyContext tenancy, IdentityContext identity) {
        List<PatientContext> list = new ArrayList<>();

        Object[][] patientDefs = {
            // --- AIIMS NEW DELHI PATIENTS ---
            {
                "Ramesh", "Kumar", "MALE", LocalDate.of(1960, 4, 10), "AIIMS-2024-001001", tenancy.aiims,
                "B+", "POSITIVE", "Asian Indian", "Hindu", "Retired Govt Officer",
                "B-42, Gulmohar Park", "Near Community Center", "New Delhi", "Delhi", "110049",
                "+91-9810011001", "ramesh.kumar@gmail.com",
                "Meera Kumar", "SPOUSE", "+91-9810011002", "meera.kumar@gmail.com",
                "Severe Penicillin Anaphylaxis", "Penicillin G", "HIGH",
                "Essential Hypertension (2010), Prior TIA (2018)", "Appendectomy (1995)", "Father had CAD / MI at age 55 (deceased)",
                "Ex-smoker (15 pack-years, quit 2015)", "NO", "WHATSAPP", "Hindi, English"
            },
            {
                "Anita", "Sharma", "FEMALE", LocalDate.of(1975, 9, 25), "AIIMS-2024-001002", tenancy.aiims,
                "O+", "POSITIVE", "Asian Indian", "Hindu", "Senior High School Teacher",
                "Flat 304, Green Valley Apts", "Pocket D, Mayur Vihar Phase 2", "New Delhi", "Delhi", "110091",
                "+91-9820022002", "anita.sharma@gmail.com",
                "Ravi Sharma", "SPOUSE", "+91-9820022003", "ravi.sharma75@gmail.com",
                "Peanut Allergy with Bronchospasm", "Peanuts", "MODERATE",
                "Chronic Tension Headaches, Mild Cervical Spondylosis", "Cholecystectomy (2020)", "Mother had Hypertension",
                "Non-smoker, Social Alcohol (<1 unit/month)", "YES", "EMAIL", "English, Hindi"
            },
            {
                "Mohammed", "Azhar", "MALE", LocalDate.of(1988, 12, 3), "AIIMS-2024-001003", tenancy.aiims,
                "A+", "POSITIVE", "Asian Indian", "Muslim", "Lead Software Architect",
                "Tower 4, 1202, Cyber City Enclave", "Sector 62", "Noida", "Uttar Pradesh", "201301",
                "+91-9830033003", "mohammed.azhar.dev@gmail.com",
                "Fatima Azhar", "SPOUSE", "+91-9830033004", "fatima.azhar@gmail.com",
                "Sulfa Drugs Rash", "Sulfamethoxazole", "LOW",
                "Type 2 Diabetes Mellitus (2021), Dyslipidemia", "None", "Strong family history of Type 2 Diabetes in both parents",
                "Non-smoker, Non-drinker", "NO", "SMS", "English, Urdu"
            },
            {
                "Lakshmi", "Iyer", "FEMALE", LocalDate.of(1950, 7, 18), "AIIMS-2024-001004", tenancy.aiims,
                "AB-", "NEGATIVE", "Asian Indian", "Hindu", "Retired Bank Officer",
                "House 18, Block C, Chittaranjan Park", "Near Kali Mandir", "New Delhi", "Delhi", "110019",
                "+91-9840044004", "lakshmi.iyer1950@gmail.com",
                "Gita Iyer", "DAUGHTER", "+91-9840044005", "gita.iyer@gmail.com",
                "Contrast Media Allergy (Iodinated)", "Omnipaque", "MODERATE",
                "Osteoarthritis Bilateral Knees, Bronchial Asthma", "Total Knee Replacement Right (2019)", "Mother had Osteoporosis",
                "Non-smoker, Vegetarian diet", "YES", "PHONE", "Tamil, English, Hindi"
            },
            {
                "Arun", "Gupta", "MALE", LocalDate.of(1972, 3, 15), "AIIMS-2024-001005", tenancy.aiims,
                "O+", "POSITIVE", "Asian Indian", "Hindu", "Chartered Accountant",
                "C-12, Hauz Khas Enclave", "Near Aurobindo Market", "New Delhi", "Delhi", "110016",
                "+91-9811122334", "arun.gupta@gmail.com",
                "Pooja Gupta", "SPOUSE", "+91-9811122335", "pooja.gupta@gmail.com",
                "Aspirin Induced Bronchospasm", "Aspirin", "HIGH",
                "Coronary Artery Disease, Dyslipidemia", "Angioplasty (2022)", "Father had Myocardial Infarction at 60",
                "Non-smoker", "YES", "EMAIL", "English, Hindi"
            },

            // --- APOLLO HOSPITALS MUMBAI PATIENTS ---
            {
                "Suresh", "Naidu", "MALE", LocalDate.of(1995, 2, 28), "APL-2024-005001", tenancy.apollo,
                "O-", "NEGATIVE", "Asian Indian", "Hindu", "Postgraduate Student",
                "Room 402, PG Hostel, Sector 15", "CBD Belapur", "Navi Mumbai", "Maharashtra", "400614",
                "+91-9850055005", "suresh.naidu95@gmail.com",
                "Lata Naidu", "PARENT", "+91-9850055006", "lata.naidu@gmail.com",
                "NSAID Induced Gastritis", "Ibuprofen", "LOW",
                "Seasonal Allergic Rhinitis", "None", "No known chronic illnesses in first-degree relatives",
                "Occasional tobacco use, gym enthusiast", "NO", "WHATSAPP", "English, Telugu, Marathi"
            },
            {
                "Priyanka", "Sen", "FEMALE", LocalDate.of(1992, 11, 15), "APL-2024-005002", tenancy.apollo,
                "A+", "POSITIVE", "Asian Indian", "Hindu", "Marketing Executive",
                "A-502, Palm Beach Residency", "Sector 19D, Vashi", "Navi Mumbai", "Maharashtra", "400703",
                "+91-9820055112", "priyanka.sen@gmail.com",
                "Rahul Sen", "SPOUSE", "+91-9820055113", "rahul.sen@gmail.com",
                "Latex Contact Dermatitis", "Latex", "MODERATE",
                "Migraine with Aura, Iron Deficiency Anemia", "None", "Mother has Thyroid Disorder",
                "Non-smoker, Vegetarian", "YES", "EMAIL", "English, Bengali, Hindi"
            },
            {
                "Rohan", "Verma", "MALE", LocalDate.of(1985, 8, 20), "APL-2024-005003", tenancy.apollo,
                "B+", "POSITIVE", "Asian Indian", "Hindu", "Financial Analyst",
                "Flat 101, Sea View Towers", "Nerul West", "Navi Mumbai", "Maharashtra", "400706",
                "+91-9833344556", "rohan.verma@gmail.com",
                "Smita Verma", "SPOUSE", "+91-9833344557", "smita.verma@gmail.com",
                "Ciprofloxacin Allergic Rash", "Ciprofloxacin", "MODERATE",
                "Stage 1 Hypertension, Fatty Liver Grade 1", "None", "Father has Diabetes",
                "Occasional Alcohol", "NO", "SMS", "English, Hindi"
            },

            // --- MAX HEALTHCARE SAKET PATIENTS ---
            {
                "Sunil", "Chawla", "MALE", LocalDate.of(1968, 6, 20), "MAX-2024-009001", tenancy.maxHealthcare,
                "AB+", "POSITIVE", "Asian Indian", "Hindu", "Business Owner",
                "M-45, Greater Kailash 2", "M Block Market", "New Delhi", "Delhi", "110048",
                "+91-9818822334", "sunil.chawla@gmail.com",
                "Kavita Chawla", "SPOUSE", "+91-9818822335", "kavita.chawla@gmail.com",
                "Codeine Nausea & Vomiting", "Codeine", "LOW",
                "Type 2 Diabetes Mellitus, Mild Nephropathy", "Hernia Repair (2016)", "Both parents had Diabetes",
                "Non-smoker", "YES", "WHATSAPP", "English, Hindi, Punjabi"
            },
            {
                "Deepika", "Padukone", "FEMALE", LocalDate.of(1986, 1, 5), "MAX-2024-009002", tenancy.maxHealthcare,
                "O+", "POSITIVE", "Asian Indian", "Hindu", "Creative Producer",
                "Villa 14, Westend Greens", "Near Rajokri", "New Delhi", "Delhi", "110037",
                "+91-9811998877", "deepika.p@gmail.com",
                "Ranveer Singh", "SPOUSE", "+91-9811998878", "ranveer.s@gmail.com",
                "Dust Mite & Pollen Allergy", "Pollen / Dust", "LOW",
                "Cervical Neck Strain, Vitamin D Deficiency", "None", "No significant family illnesses",
                "Non-smoker, Yoga Practitioner", "YES", "EMAIL", "English, Hindi, Kannada"
            }
        };

        for (int i = 0; i < patientDefs.length; i++) {
            Object[] pRow = patientDefs[i];
            String firstName = (String) pRow[0];
            String lastName = (String) pRow[1];
            String sex = (String) pRow[2];
            LocalDate dob = (LocalDate) pRow[3];
            String mrn = (String) pRow[4];
            Organization org = (Organization) pRow[5];

            // Re-use Person from user if matched, otherwise create
            String pEmail = (String) pRow[17];
            Person pPerson;
            Optional<User> matchedUser = userRepository.findByEmail(pEmail);
            if (matchedUser.isPresent() && matchedUser.get().getPerson() != null) {
                pPerson = matchedUser.get().getPerson();
            } else {
                Person newPerson = new Person(firstName, lastName, sex, dob);
                newPerson.setNationality("Indian");
                newPerson.setPreferredLanguage((String) pRow[31]);
                pPerson = personRepository.save(newPerson);
            }

            Patient patient = patientRepository.findByPersonId(pPerson.getId()).orElseGet(() -> {
                Patient p = new Patient();
                p.setPerson(pPerson);
                p.setStatus("ACTIVE");
                p.setCreatedAt(OffsetDateTime.now());
                p.setUpdatedAt(OffsetDateTime.now());
                return patientRepository.save(p);
            });

            // Patient Org (MRN)
            patientOrganizationRepository.findByPatientIdAndOrganizationId(patient.getId(), org.getId()).orElseGet(() -> {
                PatientOrganization po = new PatientOrganization();
                po.setPatient(patient);
                po.setOrganization(org);
                po.setMrn(mrn);
                po.setPatientStatus("ACTIVE");
                po.setRegisteredAt(OffsetDateTime.now().minusMonths(6));
                return patientOrganizationRepository.save(po);
            });

            // Demographics
            if (patientDemographicsRepository.findByPatientId(patient.getId()).isEmpty()) {
                PatientDemographics demo = new PatientDemographics();
                demo.setPatient(patient);
                demo.setBloodGroup((String) pRow[6]);
                demo.setRhFactor((String) pRow[7]);
                demo.setRace((String) pRow[8]);
                demo.setEthnicity((String) pRow[8]);
                demo.setReligion((String) pRow[9]);
                patientDemographicsRepository.save(demo);
            }

            // Address
            if (patientAddressRepository.findByPatientId(patient.getId()).isEmpty()) {
                PatientAddress addr = new PatientAddress();
                addr.setPatient(patient);
                addr.setAddressType("HOME");
                addr.setAddressLine1((String) pRow[11]);
                addr.setAddressLine2((String) pRow[12]);
                addr.setCity((String) pRow[13]);
                addr.setState((String) pRow[14]);
                addr.setPostalCode((String) pRow[15]);
                addr.setCountryCode("IN");
                addr.setIsPrimary(true);
                patientAddressRepository.save(addr);
            }

            // Phone
            if (patientPhoneNumberRepository.findByPatientId(patient.getId()).isEmpty()) {
                PatientPhoneNumber phone = new PatientPhoneNumber();
                phone.setPatient(patient);
                phone.setPhoneType("MOBILE");
                phone.setPhoneNumber((String) pRow[16]);
                phone.setIsPrimary(true);
                patientPhoneNumberRepository.save(phone);
            }

            // Email
            if (patientEmailAddressRepository.findByPatientId(patient.getId()).isEmpty()) {
                PatientEmailAddress email = new PatientEmailAddress();
                email.setPatient(patient);
                email.setEmailType("PERSONAL");
                email.setEmail((String) pRow[17]);
                email.setIsPrimary(true);
                patientEmailAddressRepository.save(email);
            }

            // Emergency Contact
            if (emergencyContactRepository.findByPatientId(patient.getId()).isEmpty()) {
                EmergencyContact ec = new EmergencyContact((String) pRow[18], (String) pRow[19], (String) pRow[20]);
                ec.setPatient(patient);
                ec.setEmail((String) pRow[21]);
                ec.setAddress(pRow[11] + ", " + pRow[13]);
                ec.setIsPrimary(true);
                ec.setCanMakeMedicalDecisions(true);
                emergencyContactRepository.save(ec);
            }

            // Medical Alert
            if (patientMedicalAlertRepository.findByPatientId(patient.getId()).isEmpty()) {
                PatientMedicalAlert alert = new PatientMedicalAlert();
                alert.setPatient(patient);
                alert.setAlertType("ALLERGY");
                alert.setAlertMessage((String) pRow[22]);
                alert.setSeverity((String) pRow[24]);
                alert.setActive(true);
                patientMedicalAlertRepository.save(alert);
            }

            // Medical History
            if (patientMedicalHistoryRepository.findByPatientId(patient.getId()).isEmpty()) {
                PatientMedicalHistory medHist = new PatientMedicalHistory();
                medHist.setPatient(patient);
                medHist.setPastMedicalHistory((String) pRow[25]);
                medHist.setPastSurgicalHistory((String) pRow[26]);
                medHist.setFamilyHistory((String) pRow[27]);
                medHist.setSocialHistory((String) pRow[28]);
                medHist.setUpdatedAt(OffsetDateTime.now());
                patientMedicalHistoryRepository.save(medHist);
            }

            // Surgical History item
            if (patientSurgicalHistoryRepository.findByPatientId(patient.getId()).isEmpty()) {
                PatientSurgicalHistory surg = new PatientSurgicalHistory();
                surg.setPatient(patient);
                surg.setProcedureName((String) pRow[26]);
                surg.setProcedureCode("SURG-GEN-01");
                surg.setPerformedAt(LocalDate.of(2020, 5, 10));
                surg.setHospitalName(org.getName());
                surg.setSurgeonName("Dr. Ashok Seth");
                surg.setComplications("None noted. Uneventful post-operative recovery.");
                surg.setNotes("Laparoscopic approach completed successfully.");
                patientSurgicalHistoryRepository.save(surg);
            }

            // Family History item
            if (patientFamilyHistoryRepository.findByPatientId(patient.getId()).isEmpty()) {
                PatientFamilyHistory fam = new PatientFamilyHistory();
                fam.setPatient(patient);
                fam.setRelationship("FATHER");
                fam.setConditionName("Coronary Artery Disease");
                fam.setConditionCode("I25.1");
                fam.setAgeAtOnset(55);
                fam.setDeceased(true);
                fam.setCauseOfDeath("Acute Myocardial Infarction");
                fam.setNotes("First-degree relative with premature cardiovascular disease");
                patientFamilyHistoryRepository.save(fam);
            }

            // Social History
            if (patientSocialHistoryRepository.findByPatientId(patient.getId()).isEmpty()) {
                PatientSocialHistory soc = new PatientSocialHistory();
                soc.setPatient(patient);
                soc.setSmokingStatus("FORMER_SMOKER");
                soc.setSmokingQuantity("10 cigarettes/day");
                soc.setSmokingStartDate(LocalDate.of(1985, 1, 1));
                soc.setSmokingQuitDate(LocalDate.of(2015, 6, 1));
                soc.setAlcoholStatus("NONE");
                soc.setExerciseFrequency("3 times/week brisk walking");
                soc.setOccupation((String) pRow[10]);
                soc.setLivingSituation("Lives with spouse in independent apartment");
                soc.setNotes("Good social support system");
                soc.setRecordedAt(OffsetDateTime.now());
                patientSocialHistoryRepository.save(soc);
            }

            // Substance Use
            if (patientSubstanceUseRepository.findByPatientId(patient.getId()).isEmpty()) {
                PatientSubstanceUse sub = new PatientSubstanceUse();
                sub.setPatient(patient);
                sub.setSubstanceName("Tobacco");
                sub.setStatus("QUIT");
                sub.setRoute("INHALATION");
                sub.setFrequency("NONE");
                sub.setQuantity("0");
                sub.setStartDate(LocalDate.of(1985, 1, 1));
                sub.setEndDate(LocalDate.of(2015, 6, 1));
                sub.setNotes("Tobacco cessation counseling completed");
                patientSubstanceUseRepository.save(sub);
            }

            // Dietary History
            if (patientDietaryHistoryRepository.findByPatientId(patient.getId()).isEmpty()) {
                PatientDietaryHistory diet = new PatientDietaryHistory();
                diet.setPatient(patient);
                diet.setDietType("CARDIAC_DIABETIC");
                diet.setDietaryRestrictions("Low sodium (<2g/day), Low glycemic index, Low saturated fat");
                diet.setFoodPreferences("Vegetarian with dairy and legumes");
                diet.setNutritionalNotes("Advised balanced Mediterranean-style Indian diet");
                diet.setRecordedAt(OffsetDateTime.now());
                patientDietaryHistoryRepository.save(diet);
            }

            // Communication Preferences
            if (patientCommunicationPreferencesRepository.findByPatientId(patient.getId()).isEmpty()) {
                PatientCommunicationPreferences comm = new PatientCommunicationPreferences();
                comm.setPatient(patient);
                comm.setPreferredChannel((String) pRow[30]);
                comm.setAllowSms(true);
                comm.setAllowEmail(true);
                comm.setAllowPhone(true);
                comm.setAllowWhatsapp(true);
                comm.setLanguage((String) pRow[31]);
                patientCommunicationPreferencesRepository.save(comm);
            }

            // Patient Identifier (ABHA & Aadhaar Token)
            if (patientIdentifierRepository.findByPatientId(patient.getId()).isEmpty()) {
                PatientIdentifier abhaId = new PatientIdentifier();
                abhaId.setPatient(patient);
                abhaId.setIdentifierType("ABHA_NUMBER");
                abhaId.setIdentifierValue("91-4920-1849-" + String.format("%04d", 1000 + i));
                abhaId.setIssuingAuthority("National Health Authority (NHA)");
                abhaId.setIsPrimary(true);
                patientIdentifierRepository.save(abhaId);

                PatientIdentifier abhaAddr = new PatientIdentifier();
                abhaAddr.setPatient(patient);
                abhaAddr.setIdentifierType("ABHA_ADDRESS");
                abhaAddr.setIdentifierValue(firstName.toLowerCase() + "." + lastName.toLowerCase() + "@sbx");
                abhaAddr.setIssuingAuthority("ABDM Sandbox Gateway");
                abhaAddr.setIsPrimary(false);
                patientIdentifierRepository.save(abhaAddr);
            }

            PatientContext pctx = new PatientContext();
            pctx.patient = patient;
            pctx.mrn = mrn;
            pctx.person = pPerson;
            pctx.organization = org;
            list.add(pctx);
        }

        return list;
    }

    // =========================================================================
    // 6. CLINICAL ENCOUNTERS, DIAGNOSES, VITALS, NOTES & FLOWSHEETS
    // =========================================================================
    public static class ClinicalContext {
        public Encounter encRamesh;
        public Encounter encAnita;
        public Encounter encAzhar;
        public Encounter encLakshmi;
        public Encounter encSuresh;
        public CareTeam cardioTeam;
    }

    private ClinicalContext initClinical(TenancyContext tenancy, IdentityContext identity, List<PatientContext> patients, TerminologyContext terminology) {
        ClinicalContext ctx = new ClinicalContext();
        if (patients.isEmpty() || encounterRepository.count() > 0) {
            List<Encounter> existing = encounterRepository.findAll();
            if (!existing.isEmpty()) {
                ctx.encRamesh = existing.get(0);
            }
            return ctx;
        }

        PatientContext pRamesh = patients.get(0);
        PatientContext pAnita = patients.get(1);
        PatientContext pAzhar = patients.get(2);
        PatientContext pLakshmi = patients.get(3);
        PatientContext pSuresh = patients.get(4);

        // 1. Encounter 1: Ramesh Kumar (Inpatient STEMI in CCU)
        ctx.encRamesh = new Encounter();
        ctx.encRamesh.setOrganization(tenancy.aiims);
        ctx.encRamesh.setDepartment(tenancy.cardio);
        ctx.encRamesh.setPatient(pRamesh.patient);
        ctx.encRamesh.setCreatedBy(identity.arjun);
        ctx.encRamesh.setEncounterNumber("ENC-2024-001001");
        ctx.encRamesh.setEncounterType("INPATIENT");
        ctx.encRamesh.setStatus("IN_PROGRESS");
        ctx.encRamesh.setChiefComplaint("Severe retrosternal chest pain with left arm radiation, diaphoresis, and nausea x 3 hours");
        ctx.encRamesh.setReasonForVisit("Acute Coronary Syndrome / ST Elevation Myocardial Infarction");
        ctx.encRamesh.setAdmissionSource("EMERGENCY_DEPARTMENT");
        ctx.encRamesh.setAdmissionType("EMERGENCY");
        ctx.encRamesh.setAcuity("LEVEL_1_RESUSCITATION");
        ctx.encRamesh.setStartedAt(OffsetDateTime.now().minusDays(1));
        ctx.encRamesh = encounterRepository.save(ctx.encRamesh);

        // Admission record for Ramesh
        Admission admRamesh = new Admission();
        admRamesh.setEncounter(ctx.encRamesh);
        admRamesh.setPatient(pRamesh.patient);
        admRamesh.setAdmissionSource("EMERGENCY_ROOM");
        admRamesh.setAdmitReason("Anterior Wall STEMI with acute hemodynamic instability");
        admRamesh.setAdmittedAt(OffsetDateTime.now().minusDays(1));
        admissionRepository.save(admRamesh);

        // Bed Location
        EncounterLocation locRamesh = new EncounterLocation();
        locRamesh.setEncounter(ctx.encRamesh);
        locRamesh.setBed(tenancy.bedCcu1);
        locRamesh.setStartTime(OffsetDateTime.now().minusDays(1));
        locRamesh.setStatus("ACTIVE");
        encounterLocationRepository.save(locRamesh);

        // Vitals Set 1 (Emergency Arrival)
        Vitals v1 = new Vitals();
        v1.setOrganization(tenancy.aiims);
        v1.setPatient(pRamesh.patient);
        v1.setEncounter(ctx.encRamesh);
        v1.setRecordedBy(identity.sunita);
        v1.setRecordedAt(OffsetDateTime.now().minusDays(1));
        v1.setSystolicBp(new BigDecimal("154"));
        v1.setDiastolicBp(new BigDecimal("98"));
        v1.setMeanArterialPressure(new BigDecimal("116.7"));
        v1.setHeartRate(new BigDecimal("104"));
        v1.setRespiratoryRate(new BigDecimal("22"));
        v1.setTemperature(new BigDecimal("37.2"));
        v1.setTemperatureUnit("C");
        v1.setOxygenSaturation(new BigDecimal("93.5"));
        v1.setHeightCm(new BigDecimal("172.0"));
        v1.setWeightKg(new BigDecimal("78.5"));
        v1.setBloodGlucose(new BigDecimal("165.0"));
        v1.setGlucoseUnit("mg/dL");
        v1.setPainScore(new BigDecimal("9"));
        v1.setPosition("SUPINE");
        v1.setOxygenDeliveryMethod("NASAL_CANNULA_4L");
        v1.setNotes("Tachycardic, cool clammy extremities, continuous ECG monitoring started");
        vitalsRepository.save(v1);

        // Vitals Set 2 (Post-PCI Stabilization)
        Vitals v2 = new Vitals();
        v2.setOrganization(tenancy.aiims);
        v2.setPatient(pRamesh.patient);
        v2.setEncounter(ctx.encRamesh);
        v2.setRecordedBy(identity.sunita);
        v2.setRecordedAt(OffsetDateTime.now().minusHours(4));
        v2.setSystolicBp(new BigDecimal("122"));
        v2.setDiastolicBp(new BigDecimal("78"));
        v2.setMeanArterialPressure(new BigDecimal("92.7"));
        v2.setHeartRate(new BigDecimal("72"));
        v2.setRespiratoryRate(new BigDecimal("16"));
        v2.setTemperature(new BigDecimal("36.8"));
        v2.setTemperatureUnit("C");
        v2.setOxygenSaturation(new BigDecimal("98.5"));
        v2.setPainScore(new BigDecimal("1"));
        v2.setPosition("SEMI_FOWLER");
        v2.setOxygenDeliveryMethod("ROOM_AIR");
        v2.setNotes("Post-stenting hemodynamically stable. Pain reduced to 1/10.");
        vitalsRepository.save(v2);

        // Triage EWS Record
        TriageEwsRecord triage = new TriageEwsRecord();
        triage.setPatient(pRamesh.patient);
        triage.setRecordedBy(identity.rahul);
        triage.setChiefComplaint("Crushing chest pain radiating to left shoulder and jaw");
        triage.setTriagePriority("EMERGENT");
        triage.setVitalsSummary("BP 154/98, HR 104, RR 22, SpO2 93%, NEWS2 Score: 6 (HIGH RISK)");
        triage.setNotes("Immediate ECG activated Cath Lab STEMI pathway. Dual antiplatelets loaded.");
        triage.setRecordedAt(OffsetDateTime.now().minusDays(1));
        triageEwsRecordRepository.save(triage);

        // Allergies
        Allergy al1 = new Allergy();
        al1.setPatient(pRamesh.patient);
        al1.setOrganization(tenancy.aiims);
        al1.setAllergenName("Penicillin");
        al1.setAllergenCode("70618");
        al1.setCategory("DRUG");
        al1.setReaction("Anaphylaxis, severe facial angioedema and bronchospasm");
        al1.setSeverity("SEVERE");
        al1.setStatus("ACTIVE");
        al1.setVerificationStatus("CONFIRMED");
        al1.setOnsetDate(LocalDate.of(2012, 4, 15));
        al1.setRecordedBy(identity.arjun);
        al1.setNotes("Documented severe hypersensitivity reaction. Avoid all beta-lactams without allergy testing.");
        allergyRepository.save(al1);

        // Diagnoses
        Diagnosis d1 = new Diagnosis();
        d1.setPatient(pRamesh.patient);
        d1.setDoctor(identity.arjun);
        d1.setConditionName("ST elevation myocardial infarction (STEMI) — anterior wall");
        d1.setIcdCode("I21.0");
        d1.setSnomedCode("22298006");
        d1.setStatus("active");
        d1.setOnsetDate(OffsetDateTime.now().minusDays(1));
        d1.setNotes("Primary culprit lesion in proximal LAD artery, successfully treated with 3.0x18mm DES.");
        diagnosisRepository.save(d1);

        Diagnosis d2 = new Diagnosis();
        d2.setPatient(pRamesh.patient);
        d2.setDoctor(identity.arjun);
        d2.setConditionName("Essential (primary) hypertension");
        d2.setIcdCode("I10");
        d2.setSnomedCode("38341003");
        d2.setStatus("active");
        d2.setOnsetDate(OffsetDateTime.now().minusYears(14));
        d2.setNotes("Longstanding systemic hypertension on regular antihypertensive therapy.");
        diagnosisRepository.save(d2);

        // Problem List
        ProblemList pl1 = new ProblemList();
        pl1.setOrganization(tenancy.aiims);
        pl1.setPatient(pRamesh.patient);
        pl1.setRecordedBy(identity.arjun);
        pl1.setProblemName("Acute Coronary Syndrome (STEMI)");
        pl1.setCode("I21.0");
        pl1.setCodeSystem("ICD-10");
        pl1.setStatus("ACTIVE");
        pl1.setOnsetDate(LocalDate.now().minusDays(1));
        pl1.setNotes("Status post emergency primary PCI to proximal LAD");
        problemListRepository.save(pl1);

        // Clinical Observations
        ClinicalObservation obs1 = new ClinicalObservation();
        obs1.setPatient(pRamesh.patient);
        obs1.setEncounter(ctx.encRamesh);
        obs1.setRecordedBy(identity.sunita);
        obs1.setObservationCode("GLASGOW_COMA_SCALE");
        obs1.setObservationName("Glasgow Coma Scale Total Score");
        obs1.setValueString("15");
        obs1.setValueUnit("points");
        obs1.setStatus("FINAL");
        obs1.setObservedAt(OffsetDateTime.now().minusHours(8));
        clinicalObservationRepository.save(obs1);

        // Clinical Note (SOAP Note)
        ClinicalDocument doc1 = new ClinicalDocument();
        doc1.setOrganization(tenancy.aiims);
        doc1.setPatient(pRamesh.patient);
        doc1.setEncounter(ctx.encRamesh);
        doc1.setAuthorUser(identity.arjun);
        doc1.setDocumentType("PROGRESS_NOTE");
        doc1.setTitle("Cardiology CCU Inpatient Progress Note — Day 1");
        doc1.setStatus("FINAL");
        doc1.setAuthoredAt(OffsetDateTime.now().minusHours(3));
        doc1 = clinicalDocumentRepository.save(doc1);

        ClinicalDocumentVersion doc1Ver = new ClinicalDocumentVersion();
        doc1Ver.setDocument(doc1);
        doc1Ver.setVersionNumber(1);
        doc1Ver.setAuthoredBy(identity.arjun);
        doc1Ver.setAuthoredAt(OffsetDateTime.now().minusHours(3));
        doc1Ver.setContent("SUBJECTIVE: 64yo male s/p primary PCI to proximal LAD (3.0x18mm Xience DES). Patient reports complete resolution of chest pain. Tolerating oral fluids well.\n"
                + "OBJECTIVE: BP 122/78, HR 72 NSR, SpO2 98% RA. Lungs clear bilaterally. Radial puncture site clean, intact, soft, no hematoma. Distal radial pulse 2+.\n"
                + "ASSESSMENT: Anterior STEMI successfully revascularized with TIMI-3 distal flow. Hemodynamically stable. Peak Troponin-I: 450 pg/mL.\n"
                + "PLAN: Continue DAPT (Aspirin 75mg + Ticagrelor 90mg BD), High-intensity statin (Atorvastatin 80mg), Metoprolol 50mg OD, Ramipril 2.5mg OD. Plan step-down transfer tomorrow.");
        clinicalDocumentVersionRepository.save(doc1Ver);

        // Nursing Flowsheet
        NursingFlowsheet flowsheet = new NursingFlowsheet();
        flowsheet.setPatient(pRamesh.patient);
        flowsheet.setEncounter(ctx.encRamesh);
        flowsheet.setRecordedBy(identity.sunita);
        flowsheet.setFlowsheetType("ICU_INTAKE_OUTPUT");
        flowsheet.setStatus("COMPLETED");
        flowsheet.setRecordedAt(OffsetDateTime.now().minusHours(2));
        flowsheet = nursingFlowsheetRepository.save(flowsheet);

        saveFlowsheetEntry(flowsheet, "IV_FLUIDS_ML", "1000");
        saveFlowsheetEntry(flowsheet, "ORAL_FLUIDS_ML", "600");
        saveFlowsheetEntry(flowsheet, "URINE_OUTPUT_ML", "1250");
        saveFlowsheetEntry(flowsheet, "NET_BALANCE_ML", "+350");
        saveFlowsheetEntry(flowsheet, "RADIAL_DRESSING_STATUS", "DRY_AND_INTACT");

        // Care Team
        ctx.cardioTeam = new CareTeam();
        ctx.cardioTeam.setOrganization(tenancy.aiims);
        ctx.cardioTeam.setPatient(pRamesh.patient);
        ctx.cardioTeam.setEncounter(ctx.encRamesh);
        ctx.cardioTeam.setName("AIIMS Acute Coronary Care Team");
        ctx.cardioTeam.setStatus("ACTIVE");
        ctx.cardioTeam = careTeamRepository.save(ctx.cardioTeam);

        CareTeamMember ctm1 = new CareTeamMember();
        ctm1.setCareTeam(ctx.cardioTeam);
        ctm1.setPractitioner(identity.arjunPrac);
        ctm1.setUser(identity.arjun);
        ctm1.setRole("ATTENDING_CARDIOLOGIST");
        ctm1.setStartedAt(OffsetDateTime.now().minusDays(1));
        careTeamMemberRepository.save(ctm1);

        CareTeamMember ctm2 = new CareTeamMember();
        ctm2.setCareTeam(ctx.cardioTeam);
        ctm2.setPractitioner(identity.sunitaPrac);
        ctm2.setUser(identity.sunita);
        ctm2.setRole("PRIMARY_ICU_NURSE");
        ctm2.setStartedAt(OffsetDateTime.now().minusDays(1));
        careTeamMemberRepository.save(ctm2);

        // Transfer Record (Emergency Bay to CCU)
        Transfer tr = new Transfer();
        tr.setEncounter(ctx.encRamesh);
        tr.setOrganization(tenancy.aiims);
        tr.setFromDepartment(tenancy.emer);
        tr.setFromWard(tenancy.emerBay);
        tr.setFromBed(tenancy.bedEr1);
        tr.setToDepartment(tenancy.cardio);
        tr.setToWard(tenancy.ccu);
        tr.setToBed(tenancy.bedCcu1);
        tr.setTransferredBy(identity.rahul);
        tr.setTransferredAt(OffsetDateTime.now().minusDays(1).plusHours(2));
        tr.setReason("Post-Cath Lab PCI transfer for continuous CCU hemodynamic monitoring");
        transferRepository.save(tr);

        // 2. Encounter 2: Anita Sharma (Completed Outpatient Neurology consult)
        ctx.encAnita = new Encounter();
        ctx.encAnita.setOrganization(tenancy.aiims);
        ctx.encAnita.setDepartment(tenancy.neuro);
        ctx.encAnita.setPatient(pAnita.patient);
        ctx.encAnita.setCreatedBy(identity.priya);
        ctx.encAnita.setEncounterNumber("ENC-2024-001002");
        ctx.encAnita.setEncounterType("OUTPATIENT");
        ctx.encAnita.setStatus("COMPLETED");
        ctx.encAnita.setChiefComplaint("Chronic bilateral throbbing tension headaches increasing in frequency over 4 months");
        ctx.encAnita.setReasonForVisit("Neurological evaluation for refractory headache disorder");
        ctx.encAnita.setStartedAt(OffsetDateTime.now().minusDays(3).withHour(10).withMinute(0));
        ctx.encAnita.setEndedAt(OffsetDateTime.now().minusDays(3).withHour(10).withMinute(45));
        ctx.encAnita.setDisposition("DISCHARGED_HOME");
        ctx.encAnita = encounterRepository.save(ctx.encAnita);

        // Discharge summary for Anita
        Discharge dschAnita = new Discharge();
        dschAnita.setEncounter(ctx.encAnita);
        dschAnita.setPatient(pAnita.patient);
        dschAnita.setDischargeDisposition("HOME");
        dschAnita.setDischargeSummary("Advised lifestyle modifications, adequate hydration, stress mitigation. Started Propranolol 40mg OD prophylaxis.");
        dschAnita.setDischargedAt(OffsetDateTime.now().minusDays(3).withHour(10).withMinute(45));
        dischargeRepository.save(dschAnita);

        // 3. Encounter 3: Mohammed Azhar (General Medicine Outpatient)
        ctx.encAzhar = new Encounter();
        ctx.encAzhar.setOrganization(tenancy.aiims);
        ctx.encAzhar.setDepartment(tenancy.genmed);
        ctx.encAzhar.setPatient(pAzhar.patient);
        ctx.encAzhar.setCreatedBy(identity.rajesh);
        ctx.encAzhar.setEncounterNumber("ENC-2024-001003");
        ctx.encAzhar.setEncounterType("OUTPATIENT");
        ctx.encAzhar.setStatus("IN_PROGRESS");
        ctx.encAzhar.setChiefComplaint("Routine quarterly diabetic follow-up and glycemic optimization");
        ctx.encAzhar.setStartedAt(OffsetDateTime.now().minusHours(2));
        ctx.encAzhar = encounterRepository.save(ctx.encAzhar);

        // 4. Encounter 4: Lakshmi Iyer
        ctx.encLakshmi = new Encounter();
        ctx.encLakshmi.setOrganization(tenancy.aiims);
        ctx.encLakshmi.setDepartment(tenancy.genmed);
        ctx.encLakshmi.setPatient(pLakshmi.patient);
        ctx.encLakshmi.setCreatedBy(identity.rajesh);
        ctx.encLakshmi.setEncounterNumber("ENC-2024-001004");
        ctx.encLakshmi.setEncounterType("INPATIENT");
        ctx.encLakshmi.setStatus("COMPLETED");
        ctx.encLakshmi.setChiefComplaint("Acute wheezing and productive cough in known asthma patient");
        ctx.encLakshmi.setStartedAt(OffsetDateTime.now().minusDays(7));
        ctx.encLakshmi.setEndedAt(OffsetDateTime.now().minusDays(5));
        ctx.encLakshmi.setDisposition("DISCHARGED_HOME");
        ctx.encLakshmi = encounterRepository.save(ctx.encLakshmi);

        // 5. Encounter 5: Suresh Naidu (Apollo Emergency)
        ctx.encSuresh = new Encounter();
        ctx.encSuresh.setOrganization(tenancy.apollo);
        ctx.encSuresh.setDepartment(null);
        ctx.encSuresh.setPatient(pSuresh.patient);
        ctx.encSuresh.setCreatedBy(identity.orgAdminVikram);
        ctx.encSuresh.setEncounterNumber("ENC-2024-005001");
        ctx.encSuresh.setEncounterType("EMERGENCY");
        ctx.encSuresh.setStatus("COMPLETED");
        ctx.encSuresh.setChiefComplaint("Right lower quadrant abdominal pain with low grade fever");
        ctx.encSuresh.setStartedAt(OffsetDateTime.now().minusDays(2));
        ctx.encSuresh.setEndedAt(OffsetDateTime.now().minusDays(2).plusHours(4));
        ctx.encSuresh = encounterRepository.save(ctx.encSuresh);

        return ctx;
    }

    private void saveFlowsheetEntry(NursingFlowsheet flowsheet, String key, String value) {
        NursingFlowsheetEntry entry = new NursingFlowsheetEntry();
        entry.setFlowsheet(flowsheet);
        entry.setItemKey(key);
        entry.setItemValue(value);
        nursingFlowsheetEntryRepository.save(entry);
    }

    // =========================================================================
    // 7. LABORATORY
    // =========================================================================
    private void initLaboratory(TenancyContext tenancy, IdentityContext identity, List<PatientContext> patients, ClinicalContext clinical) {
        if (patients.isEmpty() || labOrderRepository.count() > 0) return;

        // Lab Catalog
        LabTestCatalog catTrop = saveLabCatalog("TROP-I", "Troponin-I High Sensitivity", "49563-0", "CARDIAC", "0 - 14", "pg/mL");
        LabTestCatalog catCbc = saveLabCatalog("CBC", "Complete Blood Count Panel", "58410-2", "HEMATOLOGY", "Standard", "Various");
        LabTestCatalog catHba1c = saveLabCatalog("HBA1C", "Glycated Hemoglobin (HbA1c)", "4548-4", "BIOCHEMISTRY", "4.0 - 5.6", "%");
        LabTestCatalog catLipid = saveLabCatalog("LIPID", "Comprehensive Lipid Profile", "24331-1", "BIOCHEMISTRY", "Standard", "mg/dL");

        PatientContext pRamesh = patients.get(0);
        PatientContext pAzhar = patients.get(2);

        // Lab Order 1: STAT Cardiac Enzymes for Ramesh Kumar
        LabOrder ordTrop = new LabOrder();
        ordTrop.setPatient(pRamesh.patient);
        ordTrop.setEncounter(clinical.encRamesh);
        ordTrop.setOrderingProvider(identity.arjun);
        ordTrop.setTestName("Troponin-I High Sensitivity (STAT)");
        ordTrop.setLoincCode("49563-0");
        ordTrop.setCategory("CARDIAC");
        ordTrop.setStatus("COMPLETED");
        ordTrop.setSpecimenBarcode("BAR-LAB-2024-88001");
        ordTrop.setOrderedAt(LocalDateTime.now().minusDays(1));
        ordTrop.setSpecimenCollectedAt(LocalDateTime.now().minusDays(1).plusMinutes(15));
        ordTrop.setInProcessAt(LocalDateTime.now().minusDays(1).plusMinutes(30));
        ordTrop.setResultedAt(LocalDateTime.now().minusDays(1).plusHours(1));
        ordTrop.setReviewedAt(LocalDateTime.now().minusDays(1).plusHours(1).plusMinutes(10));
        ordTrop.setReviewedBy(identity.arjun);
        ordTrop.setClinicalNotes("STAT troponin in acute crushing chest pain suspicious for STEMI");
        ordTrop = labOrderRepository.save(ordTrop);

        LabOrderItem item1 = new LabOrderItem();
        item1.setLabOrder(ordTrop);
        item1.setTestCode("TROP-I");
        item1.setTestName("High Sensitivity Troponin I");
        item1.setStatus("COMPLETED");
        labOrderItemRepository.save(item1);

        // Specimen Record
        Specimen sp1 = new Specimen();
        sp1.setOrganization(tenancy.aiims);
        sp1.setPatient(pRamesh.patient);
        sp1.setSpecimenType("VENOUS_WHOLE_BLOOD");
        sp1.setAccessionNumber("ACC-2024-88001");
        sp1.setBarcode("BAR-LAB-2024-88001");
        sp1.setStatus("PROCESSED");
        sp1.setCollectedAt(OffsetDateTime.now().minusDays(1).plusMinutes(15));
        sp1.setReceivedAt(OffsetDateTime.now().minusDays(1).plusMinutes(25));
        sp1.setCollectedBy(identity.sunita);
        sp1 = specimenRepository.save(sp1);

        SpecimenCollection sc1 = new SpecimenCollection();
        sc1.setSpecimen(sp1);
        sc1.setCollectionMethod("VENIPUNCTURE");
        sc1.setCollectionSite("Left Antecubital Fossa");
        sc1.setContainer("EDTA_LAVENDER_TUBE_4ML");
        sc1.setCollectedAt(OffsetDateTime.now().minusDays(1).plusMinutes(15));
        sc1.setCollectedBy(identity.sunita);
        specimenCollectionRepository.save(sc1);

        // Result Record
        LabResult resTrop = new LabResult();
        resTrop.setLabOrder(ordTrop);
        resTrop.setPatient(pRamesh.patient);
        resTrop.setTestCode("TROP-I");
        resTrop.setTestName("Troponin-I High Sensitivity");
        resTrop.setResultValue("450.0");
        resTrop.setUnit("pg/mL");
        resTrop.setReferenceRange("0 - 14 pg/mL");
        resTrop.setAbnormalFlag("HIGH");
        resTrop.setIsCritical(true);
        resTrop.setStatus("FINAL");
        resTrop.setResultAt(OffsetDateTime.now().minusDays(1).plusHours(1));
        resTrop = labResultRepository.save(resTrop);

        LabResultComponent rc1 = new LabResultComponent();
        rc1.setLabResult(resTrop);
        rc1.setCode("49563-0");
        rc1.setCodeSystem("LOINC");
        rc1.setName("Troponin I.cardiac [Mass/volume] in Serum or Plasma by High sensitivity method");
        rc1.setValueNumeric(new BigDecimal("450.0"));
        rc1.setValueText("450.0");
        rc1.setUnit("pg/mL");
        rc1.setReferenceLow(new BigDecimal("0.0"));
        rc1.setReferenceHigh(new BigDecimal("14.0"));
        rc1.setAbnormalFlag("CRITICAL_HIGH");
        rc1.setCritical(true);
        rc1.setInterpretation("Severely elevated cardiac biomarker consistent with acute myocardial infarction");
        labResultComponentRepository.save(rc1);

        // Lab Order 2: HbA1c for Mohammed Azhar
        LabOrder ordHba1c = new LabOrder();
        ordHba1c.setPatient(pAzhar.patient);
        ordHba1c.setEncounter(clinical.encAzhar);
        ordHba1c.setOrderingProvider(identity.rajesh);
        ordHba1c.setTestName("Glycated Hemoglobin (HbA1c)");
        ordHba1c.setLoincCode("4548-4");
        ordHba1c.setCategory("BIOCHEMISTRY");
        ordHba1c.setStatus("COMPLETED");
        ordHba1c.setSpecimenBarcode("BAR-LAB-2024-88002");
        ordHba1c.setOrderedAt(LocalDateTime.now().minusHours(2));
        ordHba1c.setResultedAt(LocalDateTime.now().minusHours(1));
        ordHba1c.setReviewedAt(LocalDateTime.now().minusMinutes(30));
        ordHba1c.setReviewedBy(identity.rajesh);
        ordHba1c.setClinicalNotes("Routine quarterly monitoring for Type 2 Diabetes Mellitus");
        ordHba1c = labOrderRepository.save(ordHba1c);

        LabResult resHba1c = new LabResult();
        resHba1c.setLabOrder(ordHba1c);
        resHba1c.setPatient(pAzhar.patient);
        resHba1c.setTestCode("HBA1C");
        resHba1c.setTestName("Hemoglobin A1c / Total Hemoglobin");
        resHba1c.setResultValue("7.6");
        resHba1c.setUnit("%");
        resHba1c.setReferenceRange("4.0 - 5.6 %");
        resHba1c.setAbnormalFlag("HIGH");
        resHba1c.setIsCritical(false);
        resHba1c.setStatus("FINAL");
        resHba1c.setResultAt(OffsetDateTime.now().minusHours(1));
        labResultRepository.save(resHba1c);
    }

    private LabTestCatalog saveLabCatalog(String code, String name, String loinc, String category, String range, String unit) {
        return labTestCatalogRepository.findByTestCode(code).orElseGet(() -> {
            LabTestCatalog c = new LabTestCatalog();
            c.setTestCode(code);
            c.setTestName(name);
            c.setLoincCode(loinc);
            c.setCategory(category);
            c.setReferenceRange(range);
            c.setUnit(unit);
            return labTestCatalogRepository.save(c);
        });
    }

    // =========================================================================
    // 8. PHARMACY & eMAR
    // =========================================================================
    private void initPharmacy(TenancyContext tenancy, IdentityContext identity, List<PatientContext> patients, ClinicalContext clinical) {
        if (medicationRepository.count() == 0) {
            String[][] meds = {
                {"Aspirin", "Disprin", "TABLET", "75 mg", "Sun Pharma", "10 tablets in blister strip", "NDC-001"},
                {"Atorvastatin", "Lipitor", "TABLET", "40 mg", "Pfizer Inc", "14 tablets in foil pack", "NDC-002"},
                {"Metoprolol succinate", "Betaloc ZOK", "TABLET", "50 mg", "AstraZeneca", "30 extended release tablets", "NDC-003"},
                {"Ticagrelor", "Brilinta", "TABLET", "90 mg", "AstraZeneca", "14 film-coated tablets", "NDC-004"},
                {"Enoxaparin", "Clexane", "INJECTION", "40 mg/0.4ml", "Sanofi India", "Pre-filled syringe 0.4 mL", "NDC-005"},
                {"Metformin", "Glucophage", "TABLET", "500 mg", "Merck KGaA", "20 sustained release tablets", "NDC-006"},
                {"Pantoprazole", "Pantocid IV", "INJECTION", "40 mg", "Sun Pharma", "Vial with sterile water for injection", "NDC-007"},
                {"Paracetamol", "Calpol", "TABLET", "500 mg", "GSK India", "15 tablets strip", "NDC-008"}
            };
            for (String[] m : meds) {
                Medication med = new Medication();
                med.setName(m[0]);
                med.setGenericName(m[1]);
                med.setForm(m[2]);
                med.setStrength(m[3]);
                med = medicationRepository.save(med);

                MedicationProduct prod = new MedicationProduct();
                prod.setMedication(med);
                prod.setManufacturer(m[4]);
                prod.setPackageDescription(m[5]);
                prod.setProductCode(m[6]);
                medicationProductRepository.save(prod);
            }
        }

        if (patients.isEmpty() || prescriptionRepository.count() > 0) return;

        PatientContext pRamesh = patients.get(0);
        PatientContext pAzhar = patients.get(2);

        // Prescription 1: Aspirin 75mg OD
        Prescription rx1 = new Prescription();
        rx1.setOrganization(tenancy.aiims);
        rx1.setPatient(pRamesh.patient);
        rx1.setEncounter(clinical.encRamesh);
        rx1.setDoctor(identity.arjun);
        rx1.setStatus("ACTIVE");
        rx1.setIndication("Post-PCI STEMI secondary prevention Dual Antiplatelet Therapy");
        rx1.setInstructions("Take 1 tablet (75 mg) by mouth once daily with or after breakfast");
        rx1.setMedicationName("Aspirin 75mg");
        rx1.setRxNormCode("1191");
        rx1.setDosage("75mg");
        rx1.setRoute("Oral");
        rx1.setFrequency("Once Daily (OD)");
        rx1.setDurationDays(365);
        rx1.setRefills(3);
        rx1.setPrescribedAt(OffsetDateTime.now().minusDays(1));
        rx1.setStartAt(OffsetDateTime.now().minusDays(1));
        rx1 = prescriptionRepository.save(rx1);

        MedicationOrderDose dose1 = new MedicationOrderDose();
        dose1.setMedicationOrder(rx1);
        dose1.setDose(new BigDecimal("75.0"));
        dose1.setDoseUnit("mg");
        dose1.setRoute("ORAL");
        dose1.setFrequency("ONCE_DAILY");
        dose1.setIsPrn(false);
        medicationOrderDoseRepository.save(dose1);

        // Prescription 2: Atorvastatin 40mg HS
        Prescription rx2 = new Prescription();
        rx2.setOrganization(tenancy.aiims);
        rx2.setPatient(pRamesh.patient);
        rx2.setEncounter(clinical.encRamesh);
        rx2.setDoctor(identity.arjun);
        rx2.setStatus("ACTIVE");
        rx2.setIndication("High intensity statin lipid lowering therapy post ACS");
        rx2.setInstructions("Take 1 tablet (40 mg) at bedtime");
        rx2.setMedicationName("Atorvastatin 40mg");
        rx2.setRxNormCode("314076");
        rx2.setDosage("40mg");
        rx2.setRoute("Oral");
        rx2.setFrequency("Once Nightly (HS)");
        rx2.setDurationDays(365);
        rx2.setRefills(3);
        rx2.setPrescribedAt(OffsetDateTime.now().minusDays(1));
        rx2.setStartAt(OffsetDateTime.now().minusDays(1));
        rx2 = prescriptionRepository.save(rx2);

        MedicationOrderDose dose2 = new MedicationOrderDose();
        dose2.setMedicationOrder(rx2);
        dose2.setDose(new BigDecimal("40.0"));
        dose2.setDoseUnit("mg");
        dose2.setRoute("ORAL");
        dose2.setFrequency("AT_BEDTIME");
        dose2.setIsPrn(false);
        medicationOrderDoseRepository.save(dose2);

        // eMAR Administration by Nurse Sunita
        MedicationAdministration admin1 = new MedicationAdministration();
        admin1.setPatient(pRamesh.patient);
        admin1.setPrescription(rx1);
        admin1.setAdministeredBy(identity.sunita);
        admin1.setMedicationName("Aspirin");
        admin1.setDose("75 mg");
        admin1.setRoute("ORAL");
        admin1.setStatus("COMPLETED");
        admin1.setAdministeredAt(OffsetDateTime.now().minusHours(6));
        medicationAdministrationRepository.save(admin1);

        // Medication Reconciliation record
        MedicationReconciliation recon = new MedicationReconciliation();
        recon.setPatient(pRamesh.patient);
        recon.setEncounter(clinical.encRamesh);
        recon.setMedicationName("Amlodipine");
        recon.setDose("5 mg");
        recon.setRoute("ORAL");
        recon.setFrequency("OD");
        recon.setStatus("CONTINUED");
        recon.setSource("PATIENT_HOME_MEDICATION_LIST");
        recon.setReconciledBy(identity.anitaPharm);
        recon.setReconciledAt(OffsetDateTime.now().minusDays(1));
        medicationReconciliationRepository.save(recon);
    }

    // =========================================================================
    // 9. PROCEDURES
    // =========================================================================
    private void initProcedures(TenancyContext tenancy, IdentityContext identity, List<PatientContext> patients, ClinicalContext clinical) {
        if (procedureCatalogRepository.count() == 0) {
            saveProcCatalog("92928", "CPT", "Percutaneous transcatheter placement of intracoronary stent(s)", true);
            saveProcCatalog("93000", "CPT", "Electrocardiogram, routine ECG with at least 12 leads", true);
            saveProcCatalog("93306", "CPT", "Echocardiography, transthoracic, real-time with image documentation", true);
            saveProcCatalog("43235", "CPT", "Upper gastrointestinal endoscopy, diagnostic", true);
            saveProcCatalog("62270", "CPT", "Diagnostic lumbar puncture", true);
        }

        if (patients.isEmpty() || procedureOrderRepository.count() > 0) return;

        PatientContext pRamesh = patients.get(0);

        // Procedure Order: Urgent PCI for Ramesh Kumar
        ProcedureOrder procOrder = new ProcedureOrder();
        procOrder.setPatient(pRamesh.patient);
        procOrder.setEncounter(clinical.encRamesh);
        procOrder.setOrderingProvider(identity.arjun);
        procOrder.setProcedureName("Percutaneous Coronary Intervention (PCI) with Drug-Eluting Stent (DES)");
        procOrder.setSnomedCode("415070008");
        procOrder.setCptCode("92928");
        procOrder.setStatus("COMPLETED");
        procOrder.setProceduralist(identity.arjun);
        procOrder.setOrderedAt(LocalDateTime.now().minusDays(1));
        procOrder.setScheduledAt(LocalDateTime.now().minusDays(1).plusMinutes(30));
        procOrder.setPerformedAt(LocalDateTime.now().minusDays(1).plusHours(1));
        procOrder.setDocumentedAt(LocalDateTime.now().minusDays(1).plusHours(2));
        procOrder.setOperativeReport("Successful primary angioplasty to proximal LAD with 3.0x18mm DES. Pre-procedure 99% stenosis with TIMI-0 flow, post-stenting 0% residual stenosis with TIMI-3 distal run-off.");
        procOrder = procedureOrderRepository.save(procOrder);

        // Procedure Performance
        ProcedurePerformance perf = new ProcedurePerformance();
        perf.setOrganization(tenancy.aiims);
        perf.setPatient(pRamesh.patient);
        perf.setEncounter(clinical.encRamesh);
        perf.setProcedureOrder(procOrder);
        perf.setPerformedBy(identity.arjunPrac);
        perf.setPerformedAt(OffsetDateTime.now().minusDays(1).plusHours(1));
        perf.setStatus("COMPLETED");
        perf.setFindings("Right radial access 6F sheath. Left coronary angiogram demonstrated dominant left system with acute thrombotic 99% occlusion of proximal LAD. LCx normal, RCA mild luminal irregularities.");
        perf.setComplications("None. Zero dissection, zero thrombosis, radial artery patent.");
        perf = procedurePerformanceRepository.save(perf);

        // Procedure Participants
        ProcedureParticipant part1 = new ProcedureParticipant();
        part1.setPerformance(perf);
        part1.setPractitioner(identity.arjunPrac);
        part1.setRole("PRIMARY_SURGEON_INTERVENTIONALIST");
        procedureParticipantRepository.save(part1);

        ProcedureParticipant part2 = new ProcedureParticipant();
        part2.setPerformance(perf);
        part2.setPractitioner(identity.sunitaPrac);
        part2.setRole("SCRUB_NURSE");
        procedureParticipantRepository.save(part2);

        // Procedure Operative Note
        ProcedureNote pNote = new ProcedureNote();
        pNote.setPerformance(perf);
        pNote.setNoteType("OPERATIVE_REPORT");
        pNote.setContent("INDICATION: Acute anterior STEMI within 3 hours of symptom onset.\n"
                + "PROCEDURE: Right radial artery cannulated with 6F Glidesheath. 6F EBU 3.5 guide catheter engaged LMCA. Sion Blue wire crossed LAD lesion. Predilated with 2.5x12mm Sapphire balloon at 12 atm. 3.0x18mm Xience Sierra DES deployed at 14 atm. Post-dilated with 3.25x10mm NC balloon at 18 atm.\n"
                + "RESULT: Excellent angiographic result with TIMI 3 distal flow and complete ST-segment resolution on surface ECG.");
        pNote.setCreatedBy(identity.arjun);
        pNote.setCreatedAt(OffsetDateTime.now().minusDays(1).plusHours(2));
        procedureNoteRepository.save(pNote);
    }

    private void saveProcCatalog(String code, String codeSystem, String name, boolean active) {
        ProcedureCatalog c = new ProcedureCatalog();
        c.setCode(code);
        c.setCodeSystem(codeSystem);
        c.setName(name);
        c.setActive(active);
        procedureCatalogRepository.save(c);
    }

    // =========================================================================
    // 10. IMAGING & DICOM
    // =========================================================================
    private void initImaging(TenancyContext tenancy, IdentityContext identity, List<PatientContext> patients, ClinicalContext clinical) {
        if (patients.isEmpty() || imagingOrderRepository.count() > 0) return;

        PatientContext pRamesh = patients.get(0);

        // Imaging Order 1: Chest X-Ray PA
        ImagingOrder imgOrd1 = new ImagingOrder();
        imgOrd1.setPatient(pRamesh.patient);
        imgOrd1.setEncounter(clinical.encRamesh);
        imgOrd1.setOrderingProvider(identity.arjun);
        imgOrd1.setModality("CR");
        imgOrd1.setProcedureName("Chest Radiograph PA View (Bedside)");
        imgOrd1.setCptCode("71045");
        imgOrd1.setStatus("COMPLETED");
        imgOrd1.setDicomStudyInstanceUid("1.2.840.113619.2.55.1.20240819.1001");
        imgOrd1.setRadiologist(identity.vikramRad);
        imgOrd1.setOrderedAt(LocalDateTime.now().minusDays(1));
        imgOrd1.setScheduledAt(LocalDateTime.now().minusDays(1).plusMinutes(10));
        imgOrd1.setPerformedAt(LocalDateTime.now().minusDays(1).plusMinutes(25));
        imgOrd1.setReportGeneratedAt(LocalDateTime.now().minusDays(1).plusHours(1));
        imgOrd1.setReviewedAt(LocalDateTime.now().minusDays(1).plusHours(1).plusMinutes(15));
        imgOrd1.setRadiologistReport("FINDINGS: Heart size mildly enlarged. No pulmonary congestion or pleural effusion.");
        imgOrd1 = imagingOrderRepository.save(imgOrd1);

        // DICOM Study
        ImagingStudy study1 = new ImagingStudy();
        study1.setOrganization(tenancy.aiims);
        study1.setPatient(pRamesh.patient);
        study1.setImagingOrder(imgOrd1);
        study1.setAccessionNumber("ACC-RAD-2024-001001");
        study1.setStudyInstanceUid("1.2.840.113619.2.55.1.20240819.1001");
        study1.setModality("CR");
        study1.setPerformedAt(OffsetDateTime.now().minusDays(1).plusMinutes(25));
        study1.setPacsReference("/pacs/studies/20240819_1001");
        study1.setStatus("COMPLETED");
        study1 = imagingStudyRepository.save(study1);

        // DICOM Series
        ImagingSeries series1 = new ImagingSeries();
        series1.setStudy(study1);
        series1.setSeriesInstanceUid("1.2.840.113619.2.55.1.20240819.1001.1");
        series1.setModality("CR");
        series1.setSeriesNumber(1);
        series1.setDescription("Chest PA Bedside Exposure");
        series1 = imagingSeriesRepository.save(series1);

        // DICOM Instance
        ImagingInstance inst1 = new ImagingInstance();
        inst1.setSeries(series1);
        inst1.setSopInstanceUid("1.2.840.113619.2.55.1.20240819.1001.1.1");
        inst1.setInstanceNumber(1);
        inst1.setObjectReference("/pacs/dicom/2024/08/19/study_1001_s1_i1.dcm");
        imagingInstanceRepository.save(inst1);

        // Diagnostic Report
        ImagingReport rep1 = new ImagingReport();
        rep1.setStudy(study1);
        rep1.setRadiologist(identity.vikramPrac);
        rep1.setReportStatus("FINAL");
        rep1.setFindings("Cardiac silhouette demonstrates mild borderline cardiomegaly. Pulmonary vasculature is normal. Lung fields are clear of consolidation, pneumothorax, or acute vascular congestion. Costophrenic angles are sharp.");
        rep1.setImpression("1. Mild borderline cardiomegaly.\n2. No acute pulmonary edema or focal parenchymal consolidation.");
        rep1.setReportedAt(OffsetDateTime.now().minusDays(1).plusHours(1));
        rep1 = imagingReportRepository.save(rep1);

        ImagingReportVersion repVer1 = new ImagingReportVersion();
        repVer1.setReport(rep1);
        repVer1.setVersionNumber(1);
        repVer1.setContent(rep1.getFindings() + "\n\nIMPRESSION:\n" + rep1.getImpression());
        repVer1.setCreatedBy(identity.vikramRad);
        repVer1.setCreatedAt(OffsetDateTime.now().minusDays(1).plusHours(1));
        imagingReportVersionRepository.save(repVer1);
    }

    // =========================================================================
    // 11. APPOINTMENTS & SCHEDULING
    // =========================================================================
    private void initScheduling(TenancyContext tenancy, IdentityContext identity, List<PatientContext> patients) {
        if (appointmentTypeRepository.count() == 0) {
            saveApptType("NEW_CONSULT", "New Patient Consultation", 30, "Comprehensive intake and clinical assessment");
            saveApptType("FOLLOW_UP", "Follow-up Consultation", 15, "Review of test results and treatment response");
            saveApptType("POST_OP", "Post-Procedure / Post-Op Review", 20, "Evaluation of wound healing and functional recovery");
            saveApptType("EMERGENCY", "Emergency Triage Slot", 45, "Urgent emergency room evaluation");
            saveApptType("TELEHEALTH", "Telehealth Video Consultation", 20, "Remote follow-up consultation");
        }

        // Schedule Slots for Dr. Arjun & Dr. Priya
        if (scheduleSlotRepository.count() == 0) {
            ScheduleSlot s1 = new ScheduleSlot();
            s1.setPractitioner(identity.arjun);
            s1.setStartTime(OffsetDateTime.now().plusDays(1).withHour(9).withMinute(0));
            s1.setEndTime(OffsetDateTime.now().plusDays(1).withHour(9).withMinute(30));
            s1.setStatus("BOOKED");
            scheduleSlotRepository.save(s1);

            ScheduleSlot s2 = new ScheduleSlot();
            s2.setPractitioner(identity.arjun);
            s2.setStartTime(OffsetDateTime.now().plusDays(1).withHour(9).withMinute(30));
            s2.setEndTime(OffsetDateTime.now().plusDays(1).withHour(10).withMinute(0));
            s2.setStatus("FREE");
            scheduleSlotRepository.save(s2);

            ScheduleSlot s3 = new ScheduleSlot();
            s3.setPractitioner(identity.priya);
            s3.setStartTime(OffsetDateTime.now().plusDays(2).withHour(10).withMinute(0));
            s3.setEndTime(OffsetDateTime.now().plusDays(2).withHour(10).withMinute(30));
            s3.setStatus("BOOKED");
            scheduleSlotRepository.save(s3);
        }

        if (patients.size() < 2 || appointmentRepository.count() > 0) return;

        PatientContext pRamesh = patients.get(0);
        PatientContext pAnita = patients.get(1);
        PatientContext pSuresh = patients.get(4);

        // Appointment 1: Anita Sharma (Scheduled Neurology follow-up)
        Appointment appt1 = new Appointment();
        appt1.setOrganization(tenancy.aiims);
        appt1.setDepartment(tenancy.neuro);
        appt1.setPatient(pAnita.patient);
        appt1.setCreatedBy(identity.priya);
        appt1.setStatus("SCHEDULED");
        appt1.setReason("Follow-up evaluation for chronic tension headaches and response to Propranolol");
        appt1.setNotes("Review headache diary and check sitting/standing BP");
        appt1.setStartsAt(OffsetDateTime.now().plusDays(2).withHour(10).withMinute(0));
        appt1.setEndsAt(OffsetDateTime.now().plusDays(2).withHour(10).withMinute(30));
        appt1 = appointmentRepository.save(appt1);

        AppointmentParticipant part1 = new AppointmentParticipant();
        part1.setAppointment(appt1);
        part1.setPractitioner(identity.priyaPrac);
        part1.setUser(identity.priya);
        part1.setParticipantType("ATTENDING_PHYSICIAN");
        appointmentParticipantRepository.save(part1);

        AppointmentStatusHistory ash1 = new AppointmentStatusHistory();
        ash1.setAppointment(appt1);
        ash1.setOldStatus(null);
        ash1.setNewStatus("SCHEDULED");
        ash1.setChangedBy(identity.sarita);
        ash1.setChangedAt(OffsetDateTime.now().minusDays(1));
        ash1.setReason("Patient booked routine appointment via front desk");
        appointmentStatusHistoryRepository.save(ash1);

        AppointmentNote aNote1 = new AppointmentNote();
        aNote1.setAppointment(appt1);
        aNote1.setAuthor(identity.sarita);
        aNote1.setAuthorName("Sarita Gupta");
        aNote1.setAuthorRole("ROLE_RECEPTIONIST");
        aNote1.setNoteType("RECEPTIONIST_ADMIN");
        aNote1.setContent("Patient confirmed SMS reminder. Advised to bring previous brain MRI film.");
        appointmentNoteRepository.save(aNote1);

        // Appointment 2: Ramesh Kumar (Post-PCI 2-week Cardiology Follow-up)
        Appointment appt2 = new Appointment();
        appt2.setOrganization(tenancy.aiims);
        appt2.setDepartment(tenancy.cardio);
        appt2.setPatient(pRamesh.patient);
        appt2.setCreatedBy(identity.arjun);
        appt2.setStatus("CONFIRMED");
        appt2.setReason("Post-PCI STEMI 2-week clinical review, ECG, and medication tolerance assessment");
        appt2.setStartsAt(OffsetDateTime.now().plusDays(14).withHour(11).withMinute(0));
        appt2.setEndsAt(OffsetDateTime.now().plusDays(14).withHour(11).withMinute(30));
        appt2 = appointmentRepository.save(appt2);

        // Appointment 3: Suresh Naidu (Cancelled Appointment with Audit)
        Appointment appt3 = new Appointment();
        appt3.setOrganization(tenancy.apollo);
        appt3.setPatient(pSuresh.patient);
        appt3.setCreatedBy(identity.orgAdminVikram);
        appt3.setStatus("CANCELLED");
        appt3.setReason("Post-Emergency follow up consult");
        appt3.setStartsAt(OffsetDateTime.now().minusDays(1).withHour(14).withMinute(0));
        appt3.setEndsAt(OffsetDateTime.now().minusDays(1).withHour(14).withMinute(30));
        appt3 = appointmentRepository.save(appt3);

        AppointmentCancellation canc = new AppointmentCancellation();
        canc.setAppointment(appt3);
        canc.setCancelledByUser(identity.orgAdminVikram);
        canc.setCancelledByRole("PATIENT");
        canc.setCancellationReason("Patient traveling out of city, symptoms fully resolved");
        canc.setAdditionalComment("Full consultation fee waiver applied");
        canc.setRefundStatus("PROCESSED");
        canc.setCancelledAt(LocalDateTime.now().minusDays(1));
        appointmentCancellationRepository.save(canc);
    }

    private void saveApptType(String code, String name, int duration, String desc) {
        AppointmentType at = new AppointmentType();
        at.setCode(code);
        at.setName(name);
        at.setDurationMinutes(duration);
        at.setDescription(desc);
        appointmentTypeRepository.save(at);
    }

    // =========================================================================
    // 12. BILLING & INVOICING
    // =========================================================================
    private void initBilling(TenancyContext tenancy, IdentityContext identity, List<PatientContext> patients, ClinicalContext clinical) {
        // Price List
        PriceList pl = priceListRepository.findByOrganizationId(tenancy.aiims.getId()).stream().findFirst().orElseGet(() -> {
            PriceList p = new PriceList();
            p.setOrganization(tenancy.aiims);
            p.setName("AIIMS Standard Hospital Tariff 2024");
            p.setCurrency("INR");
            p.setActive(true);
            return priceListRepository.save(p);
        });

        if (priceListItemRepository.findByPriceListId(pl.getId()).isEmpty()) {
            savePriceItem(pl, "PROCEDURE", "PROC-PCI-01", "Primary Angioplasty with DES Stent", new BigDecimal("75000.00"));
            savePriceItem(pl, "BED_DAILY", "BED-CCU-01", "CCU Bed Daily Intensive Care Tariff", new BigDecimal("12000.00"));
            savePriceItem(pl, "CONSULTATION", "CONS-SPEC-01", "Cardiology Specialist Attending Consultation", new BigDecimal("2300.00"));
            savePriceItem(pl, "LABORATORY", "LAB-TROP-01", "Troponin-I High Sensitivity Assay", new BigDecimal("1500.00"));
            savePriceItem(pl, "DIAGNOSTIC", "DIAG-ECG-01", "12-Lead Electrocardiogram Diagnostic Strip", new BigDecimal("650.00"));
            savePriceItem(pl, "RADIOLOGY", "RAD-CXR-01", "Chest Radiograph PA View", new BigDecimal("1200.00"));
        }

        if (patients.isEmpty() || invoiceRepository.count() > 0) return;

        PatientContext pRamesh = patients.get(0);

        // Billing Account for Ramesh
        BillingAccount baRamesh = new BillingAccount();
        baRamesh.setOrganization(tenancy.aiims);
        baRamesh.setPatient(pRamesh.patient);
        baRamesh.setAccountNumber("ACC-AIIMS-2024-001001");
        baRamesh.setCurrentBalance(BigDecimal.ZERO);
        baRamesh.setStatus("ACTIVE");
        baRamesh.setCreatedAt(OffsetDateTime.now().minusDays(1));
        billingAccountRepository.save(baRamesh);

        // Charge Items for Ramesh
        ChargeItem c1 = saveCharge(pRamesh.patient, clinical.encRamesh, "PROC-PCI-01", "Primary Angioplasty with DES Stent", new BigDecimal("75000.00"));
        ChargeItem c2 = saveCharge(pRamesh.patient, clinical.encRamesh, "BED-CCU-01", "CCU Bed Daily Intensive Care Tariff", new BigDecimal("12000.00"));
        ChargeItem c3 = saveCharge(pRamesh.patient, clinical.encRamesh, "CONS-SPEC-01", "Cardiology Specialist Consultation", new BigDecimal("2300.00"));
        ChargeItem c4 = saveCharge(pRamesh.patient, clinical.encRamesh, "LAB-TROP-01", "Troponin-I High Sensitivity Assay", new BigDecimal("1500.00"));
        ChargeItem c5 = saveCharge(pRamesh.patient, clinical.encRamesh, "DIAG-ECG-01", "12-Lead ECG Diagnostic Strip", new BigDecimal("650.00"));
        ChargeItem c6 = saveCharge(pRamesh.patient, clinical.encRamesh, "RAD-CXR-01", "Chest Radiograph PA View", new BigDecimal("1200.00"));

        BigDecimal total = new BigDecimal("92650.00");

        // Invoice 1: Ramesh Kumar (Paid in full)
        Invoice inv1 = new Invoice();
        inv1.setPatient(pRamesh.patient);
        inv1.setInvoiceNumber("INV-2024-001001");
        inv1.setTotalAmount(total);
        inv1.setPaidAmount(total);
        inv1.setStatus("PAID");
        inv1.setIssuedAt(OffsetDateTime.now().minusHours(12));
        inv1 = invoiceRepository.save(inv1);

        saveInvoiceItem(inv1, "Primary Angioplasty with DES Stent (LAD)", new BigDecimal("75000.00"));
        saveInvoiceItem(inv1, "CCU Bed Charges (Day 1)", new BigDecimal("12000.00"));
        saveInvoiceItem(inv1, "Cardiology Specialist Consultation", new BigDecimal("2300.00"));
        saveInvoiceItem(inv1, "STAT High Sensitivity Troponin I Assay", new BigDecimal("1500.00"));
        saveInvoiceItem(inv1, "12-Lead Electrocardiogram", new BigDecimal("650.00"));
        saveInvoiceItem(inv1, "Chest Radiograph PA View", new BigDecimal("1200.00"));

        // Payment for Invoice 1
        Payment pay1 = new Payment();
        pay1.setPatient(pRamesh.patient);
        pay1.setInvoice(inv1);
        pay1.setAmount(total);
        pay1.setPaymentMethod("HDFC_CREDIT_CARD");
        pay1.setTransactionReference("TXN-HDFC-991823-AIIMS");
        pay1.setStatus("COMPLETED");
        pay1.setPaidAt(OffsetDateTime.now().minusHours(11));
        pay1 = paymentRepository.save(pay1);

        PaymentAllocation alloc1 = new PaymentAllocation();
        alloc1.setPayment(pay1);
        alloc1.setInvoice(inv1);
        alloc1.setAmount(total);
        paymentAllocationRepository.save(alloc1);

        // Refund Record (Audit Example)
        Refund ref = new Refund();
        ref.setPayment(pay1);
        ref.setAmount(new BigDecimal("500.00"));
        ref.setReason("Cashless pre-authorization concession adjustment");
        ref.setStatus("PROCESSED");
        ref.setRequestedAt(OffsetDateTime.now().minusHours(10));
        ref.setProcessedAt(OffsetDateTime.now().minusHours(9));
        ref.setProcessedBy(identity.vikas);
        refundRepository.save(ref);
    }

    private void savePriceItem(PriceList pl, String type, String code, String desc, BigDecimal amount) {
        PriceListItem item = new PriceListItem();
        item.setPriceList(pl);
        item.setServiceType(type);
        item.setServiceCode(code);
        item.setDescription(desc);
        item.setAmount(amount);
        priceListItemRepository.save(item);
    }

    private ChargeItem saveCharge(Patient p, Encounter enc, String code, String desc, BigDecimal amount) {
        ChargeItem c = new ChargeItem();
        c.setPatient(p);
        c.setEncounter(enc);
        c.setCode(code);
        c.setDescription(desc);
        c.setAmount(amount);
        c.setStatus("BILLED");
        c.setChargedAt(OffsetDateTime.now().minusHours(14));
        return chargeItemRepository.save(c);
    }

    private void saveInvoiceItem(Invoice inv, String desc, BigDecimal amount) {
        InvoiceItem item = new InvoiceItem();
        item.setInvoice(inv);
        item.setDescription(desc);
        item.setAmount(amount);
        invoiceItemRepository.save(item);
    }

    // =========================================================================
    // 13. INSURANCE & CLAIMS
    // =========================================================================
    private void initInsurance(TenancyContext tenancy, IdentityContext identity, List<PatientContext> patients, ClinicalContext clinical) {
        if (patients.isEmpty() || insurancePayerRepository.count() > 0) return;

        // Payers
        InsurancePayer starHealth = new InsurancePayer();
        starHealth.setName("Star Health and Allied Insurance Co Ltd");
        starHealth.setPayerCode("STAR-HLTH-01");
        starHealth.setPhone("+91-1800-425-2255");
        starHealth.setEmail("claims@starhealth.in");
        starHealth.setActive(true);
        starHealth = insurancePayerRepository.save(starHealth);

        InsurancePayer hdfcErgo = new InsurancePayer();
        hdfcErgo.setName("HDFC ERGO General Insurance Company Ltd");
        hdfcErgo.setPayerCode("HDFC-ERGO-01");
        hdfcErgo.setPhone("+91-1800-2666");
        hdfcErgo.setEmail("care@hdfcergo.com");
        hdfcErgo.setActive(true);
        hdfcErgo = insurancePayerRepository.save(hdfcErgo);

        InsurancePayer pmjay = new InsurancePayer();
        pmjay.setName("Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)");
        pmjay.setPayerCode("AB-PMJAY-NHA");
        pmjay.setPhone("+91-14555");
        pmjay.setEmail("support.nha@gov.in");
        pmjay.setActive(true);
        pmjay = insurancePayerRepository.save(pmjay);

        // Plans
        InsurancePlan starComp = new InsurancePlan();
        starComp.setPayer(starHealth);
        starComp.setPlanName("Star Comprehensive Health Insurance Policy (Gold Tier)");
        starComp.setPlanCode("STAR-COMP-GOLD-10L");
        starComp.setActive(true);
        starComp = insurancePlanRepository.save(starComp);

        InsurancePlan hdfcOpt = new InsurancePlan();
        hdfcOpt.setPayer(hdfcErgo);
        hdfcOpt.setPlanName("HDFC ERGO Optima Secure Family Floater");
        hdfcOpt.setPlanCode("HDFC-OPT-SEC-25L");
        hdfcOpt.setActive(true);
        hdfcOpt = insurancePlanRepository.save(hdfcOpt);

        PatientContext pRamesh = patients.get(0);

        // Patient Insurance: Ramesh Kumar
        PatientInsurance piRamesh = new PatientInsurance();
        piRamesh.setPatient(pRamesh.patient);
        piRamesh.setOrganization(tenancy.aiims);
        piRamesh.setPayer(starHealth);
        piRamesh.setPlan(starComp);
        piRamesh.setPolicyNumber("POL-STAR-881928374");
        piRamesh.setMemberId("MEM-STAR-001001");
        piRamesh.setGroupNumber("GRP-CORP-991");
        piRamesh.setSubscriberName("Ramesh Kumar");
        piRamesh.setSubscriberRelationship("SELF");
        piRamesh.setEffectiveFrom(LocalDate.of(2023, 1, 1));
        piRamesh.setEffectiveTo(LocalDate.of(2026, 12, 31));
        piRamesh.setIsPrimary(true);
        piRamesh.setStatus("ACTIVE");
        piRamesh = patientInsuranceRepository.save(piRamesh);

        // Verification
        InsuranceVerification ver = new InsuranceVerification();
        ver.setPatientInsurance(piRamesh);
        ver.setVerifiedBy(identity.vikas);
        ver.setVerifiedAt(OffsetDateTime.now().minusDays(1));
        ver.setStatus("VERIFIED");
        ver.setResponse("{\"eligibilityStatus\": \"ACTIVE\", \"sumInsured\": 1000000.0, \"cumulativeBonus\": 200000.0, \"copayPercentage\": 0.0}");
        insuranceVerificationRepository.save(ver);

        // Pre-Authorization
        InsuranceAuthorization auth = new InsuranceAuthorization();
        auth.setPatient(pRamesh.patient);
        auth.setOrganization(tenancy.aiims);
        auth.setPayer(starHealth);
        auth.setAuthorizationNumber("AUTH-STAR-2024-99182");
        auth.setServiceType("EMERGENCY_CORONARY_ANGIOPLASTY");
        auth.setRequestedAmount(new BigDecimal("95000.00"));
        auth.setApprovedAmount(new BigDecimal("90000.00"));
        auth.setStatus("APPROVED");
        auth.setRequestedAt(OffsetDateTime.now().minusDays(1).plusHours(1));
        auth.setApprovedAt(OffsetDateTime.now().minusDays(1).plusHours(2));
        auth.setExpiresAt(OffsetDateTime.now().plusDays(7));
        auth.setResponse("{\"authStatus\": \"APPROVED\", \"approvedAmount\": 90000.0, \"deductible\": 2650.0}");
        insuranceAuthorizationRepository.save(auth);

        // Claim
        InsuranceClaim claim = new InsuranceClaim();
        claim.setOrganization(tenancy.aiims);
        claim.setPatient(pRamesh.patient);
        claim.setPayer(starHealth);
        claim.setClaimNumber("CLM-STAR-2024-001001");
        claim.setStatus("SETTLED");
        claim.setSubmittedAt(OffsetDateTime.now().minusHours(8));
        claim.setTotalAmount(new BigDecimal("92650.00"));
        claim.setApprovedAmount(new BigDecimal("90000.00"));
        claim.setRejectedAmount(new BigDecimal("2650.00"));
        claim.setResponse("{\"settlementReference\": \"NEFT-STAR-7718299\", \"settlementDate\": \"2024-08-19\"}");
        claim = insuranceClaimRepository.save(claim);

        InsuranceClaimItem ci1 = new InsuranceClaimItem();
        ci1.setClaim(claim);
        ci1.setServiceCode("PROC-PCI-01");
        ci1.setDescription("Primary Angioplasty with DES Stent (LAD)");
        ci1.setQuantity(new BigDecimal("1.0"));
        ci1.setBilledAmount(new BigDecimal("75000.00"));
        ci1.setApprovedAmount(new BigDecimal("75000.00"));
        ci1.setRejectedAmount(BigDecimal.ZERO);
        insuranceClaimItemRepository.save(ci1);

        InsuranceClaimItem ci2 = new InsuranceClaimItem();
        ci2.setClaim(claim);
        ci2.setServiceCode("NON-MED-01");
        ci2.setDescription("Sanitization & Administrative Consumables");
        ci2.setQuantity(new BigDecimal("1.0"));
        ci2.setBilledAmount(new BigDecimal("2650.00"));
        ci2.setApprovedAmount(BigDecimal.ZERO);
        ci2.setRejectedAmount(new BigDecimal("2650.00"));
        ci2.setRejectionReason("Non-payable item as per IRDAI master policy guidelines");
        insuranceClaimItemRepository.save(ci2);
    }

    // =========================================================================
    // 14. CONSENT & DOCUMENT MANAGEMENT
    // =========================================================================
    private void initConsentAndDocuments(TenancyContext tenancy, IdentityContext identity, List<PatientContext> patients, ClinicalContext clinical) {
        if (consentTypeRepository.count() == 0) {
            saveConsentType(tenancy.aiims, "GEN_TREATMENT", "General Consent for Medical Treatment", "Authorizes general clinical examination, vitals, nursing care, and routine non-invasive procedures");
            saveConsentType(tenancy.aiims, "INVASIVE_PROCEDURE", "Informed Consent for Invasive Surgical & Interventional Procedures", "Authorizes catheterization, anesthesia, and stenting procedures");
            saveConsentType(tenancy.aiims, "ABDM_DATA_SHARE", "ABDM Electronic Health Record Data Sharing Consent", "Authorizes sharing of health records across the Ayushman Bharat Digital Mission network");
            saveConsentType(tenancy.aiims, "RESEARCH_BIOBANK", "Clinical Research & Biobank Specimen Retention Consent", "Authorizes anonymized specimen usage for biomedical research");
        }

        if (patients.isEmpty() || documentRepository.count() > 0) return;

        PatientContext pRamesh = patients.get(0);
        PatientContext pAnita = patients.get(1);

        ConsentType ctInvasive = consentTypeRepository.findByCode("INVASIVE_PROCEDURE").orElse(null);
        ConsentType ctAbdm = consentTypeRepository.findByCode("ABDM_DATA_SHARE").orElse(null);

        // Document 1: Signed Invasive Consent PDF
        Document docInvasive = new Document();
        docInvasive.setOrganization(tenancy.aiims);
        docInvasive.setPatient(pRamesh.patient);
        docInvasive.setEncounter(clinical.encRamesh);
        docInvasive.setDocumentType("CONSENT_FORM");
        docInvasive.setTitle("Informed Consent for Primary Percutaneous Coronary Intervention");
        docInvasive.setStorageProvider("MINIO_S3");
        docInvasive.setStorageKey("/documents/consents/2024/08/consent_pci_ramesh.pdf");
        docInvasive.setMimeType("application/pdf");
        docInvasive.setFileSize(245760L);
        docInvasive.setStatus("ACTIVE");
        docInvasive.setUploadedBy(identity.arjun);
        docInvasive.setUploadedAt(OffsetDateTime.now().minusDays(1));
        docInvasive = documentRepository.save(docInvasive);

        DocumentVersion dv1 = new DocumentVersion();
        dv1.setDocument(docInvasive);
        dv1.setVersionNumber(1);
        dv1.setStorageKey(docInvasive.getStorageKey());
        dv1.setChecksum("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
        dv1.setFileSize(245760L);
        dv1.setCreatedBy(identity.arjun);
        dv1.setCreatedAt(OffsetDateTime.now().minusDays(1));
        documentVersionRepository.save(dv1);

        DocumentLink dl1 = new DocumentLink();
        dl1.setDocument(docInvasive);
        dl1.setEntityType("PATIENT");
        dl1.setEntityId(pRamesh.patient.getId());
        documentLinkRepository.save(dl1);

        // Patient Consent Record
        if (ctInvasive != null) {
            PatientConsent pc1 = new PatientConsent();
            pc1.setPatient(pRamesh.patient);
            pc1.setOrganization(tenancy.aiims);
            pc1.setConsentType(ctInvasive);
            pc1.setStatus("GRANTED");
            pc1.setGrantedAt(OffsetDateTime.now().minusDays(1));
            pc1.setGrantedBy(identity.arjun);
            pc1.setScope("{\"procedures\": [\"CORONARY_ANGIOGRAPHY\", \"PCI_STENT\"], \"riskAcknowledged\": true}");
            pc1.setNotes("Patient and spouse fully counseled regarding PCI procedure, contrast risks, and alternatives.");
            pc1 = patientConsentRepository.save(pc1);

            ConsentVersion cv1 = new ConsentVersion();
            cv1.setPatientConsent(pc1);
            cv1.setVersionNumber(1);
            cv1.setDocument(docInvasive);
            cv1.setCreatedAt(OffsetDateTime.now().minusDays(1));
            consentVersionRepository.save(cv1);
        }

        // ABDM Data Share Consent for Anita Sharma
        if (ctAbdm != null) {
            PatientConsent pc2 = new PatientConsent();
            pc2.setPatient(pAnita.patient);
            pc2.setOrganization(tenancy.aiims);
            pc2.setConsentType(ctAbdm);
            pc2.setStatus("GRANTED");
            pc2.setGrantedAt(OffsetDateTime.now().minusDays(3));
            pc2.setGrantedBy(identity.priya);
            pc2.setScope("{\"hip\": \"AIIMS-DEL\", \"types\": [\"OPConsultation\", \"DiagnosticReport\", \"Prescription\"]}");
            pc2.setNotes("ABDM OTP verified electronic health data sharing consent granted");
            patientConsentRepository.save(pc2);
        }
    }

    private void saveConsentType(Organization org, String code, String name, String desc) {
        ConsentType ct = new ConsentType();
        ct.setOrganization(org);
        ct.setCode(code);
        ct.setName(name);
        ct.setDescription(desc);
        ct.setActive(true);
        consentTypeRepository.save(ct);
    }

    // =========================================================================
    // 15. SECURITY EVENTS & AUDIT LOGS
    // =========================================================================
    private void initSecurityAndAudit(TenancyContext tenancy, IdentityContext identity, List<PatientContext> patients, ClinicalContext clinical) {
        if (securityEventRepository.count() == 0) {
            SecurityEvent se1 = new SecurityEvent();
            se1.setOrganization(tenancy.aiims);
            se1.setUser(identity.arjun);
            se1.setEventType("USER_LOGIN_SUCCESS");
            se1.setIpAddress("192.168.10.45");
            se1.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) SentinelEHR/2.0");
            se1.setMetadata("{\"authMethod\": \"PASSWORD_MFA\", \"sessionTimeout\": 3600}");
            se1.setCreatedAt(OffsetDateTime.now().minusHours(5));
            securityEventRepository.save(se1);

            SecurityEvent se2 = new SecurityEvent();
            se2.setOrganization(tenancy.aiims);
            se2.setUser(identity.arjun);
            se2.setEventType("BREAK_GLASS_ACCESS_TRIGGERED");
            se2.setIpAddress("192.168.10.45");
            se2.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) SentinelEHR/2.0");
            se2.setMetadata("{\"patientId\": \"" + patients.get(0).patient.getId() + "\", \"reason\": \"Acute STEMI Cath Lab Emergency\"}");
            se2.setCreatedAt(OffsetDateTime.now().minusDays(1));
            securityEventRepository.save(se2);
        }

        // Break Glass Record
        if (breakGlassRepository.count() == 0 && !patients.isEmpty()) {
            PatientContext pRamesh = patients.get(0);
            BreakGlassRecord bg = new BreakGlassRecord();
            bg.setPatient(pRamesh.patient);
            bg.setUser(identity.arjun);
            bg.setCategory("CARDIAC_ARREST");
            bg.setJustification("Emergency Primary PCI catheterization protocol override for Acute STEMI resuscitation");
            bg.setClientIp("192.168.10.45");
            bg.setRequestedAt(LocalDateTime.now().minusDays(1));
            bg.setExpiresAt(LocalDateTime.now().minusDays(1).plusHours(4));
            bg.setStatus("EXPIRED");
            breakGlassRepository.save(bg);
        }

        // Audit Logs
        if (auditLogRepository.count() == 0 && !patients.isEmpty()) {
            PatientContext pRamesh = patients.get(0);
            PatientContext pAnita = patients.get(1);

            AuditLog a1 = new AuditLog();
            a1.setOrganizationId(tenancy.aiims.getId());
            a1.setUserId(identity.arjun.getId());
            a1.setPatientId(pRamesh.patient.getId());
            a1.setEncounterId(clinical.encRamesh != null ? clinical.encRamesh.getId() : null);
            a1.setAction("READ");
            a1.setResourceType("PATIENT_CHART");
            a1.setResourceId(pRamesh.patient.getId());
            a1.setPurposeOfUse("TREATMENT");
            a1.setResult("SUCCESS");
            a1.setIpAddress("192.168.10.45");
            a1.setUserAgent("Sentinel-EHR-Client/2.4");
            a1.setOccurredAt(OffsetDateTime.now().minusDays(1));
            a1.setUserEmail("arjun.sharma@aiims.edu");
            a1.setUserRole("PHYSICIAN");
            a1.setEntityName("PATIENT_CHART");
            a1.setDetails("Accessed complete clinical record and allergy history prior to emergency catheterization");
            auditLogRepository.save(a1);

            AuditLog a2 = new AuditLog();
            a2.setOrganizationId(tenancy.aiims.getId());
            a2.setUserId(identity.arjun.getId());
            a2.setPatientId(pRamesh.patient.getId());
            a2.setEncounterId(clinical.encRamesh != null ? clinical.encRamesh.getId() : null);
            a2.setAction("CREATE");
            a2.setResourceType("PRESCRIPTION");
            a2.setPurposeOfUse("TREATMENT");
            a2.setResult("SUCCESS");
            a2.setIpAddress("192.168.10.45");
            a2.setUserAgent("Sentinel-EHR-Client/2.4");
            a2.setOccurredAt(OffsetDateTime.now().minusDays(1).plusHours(2));
            a2.setUserEmail("arjun.sharma@aiims.edu");
            a2.setUserRole("PHYSICIAN");
            a2.setEntityName("PRESCRIPTION");
            a2.setDetails("Issued electronic prescription for Aspirin 75mg and Atorvastatin 40mg post PCI");
            auditLogRepository.save(a2);

            AuditLog a3 = new AuditLog();
            a3.setOrganizationId(tenancy.aiims.getId());
            a3.setUserId(identity.priya.getId());
            a3.setPatientId(pAnita.patient.getId());
            a3.setAction("READ");
            a3.setResourceType("PATIENT_DEMOGRAPHICS");
            a3.setResourceId(pAnita.patient.getId());
            a3.setPurposeOfUse("TREATMENT");
            a3.setResult("SUCCESS");
            a3.setIpAddress("192.168.10.50");
            a3.setOccurredAt(OffsetDateTime.now().minusDays(3));
            a3.setUserEmail("priya.kapoor@aiims.edu");
            a3.setUserRole("PHYSICIAN");
            a3.setEntityName("PATIENT_DEMOGRAPHICS");
            a3.setDetails("Outpatient consult chart open for chronic headache review");
            auditLogRepository.save(a3);
        }
    }
}


