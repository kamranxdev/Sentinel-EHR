package com.sentinel.config;

import com.sentinel.billing.entity.Invoice;
import com.sentinel.billing.repository.InvoiceRepository;
import com.sentinel.clinical.entity.*;
import com.sentinel.clinical.repository.*;
import com.sentinel.identity.entity.*;
import com.sentinel.identity.repository.*;
import com.sentinel.patient.entity.*;
import com.sentinel.patient.repository.*;
import com.sentinel.pharmacy.entity.Medication;
import com.sentinel.pharmacy.entity.Prescription;
import com.sentinel.pharmacy.repository.MedicationRepository;
import com.sentinel.pharmacy.repository.PrescriptionRepository;
import com.sentinel.scheduling.entity.Appointment;
import com.sentinel.scheduling.repository.AppointmentRepository;
import com.sentinel.security.entity.AbacPolicy;
import com.sentinel.security.entity.Permission;
import com.sentinel.security.entity.Role;
import com.sentinel.security.repository.AbacPolicyRepository;
import com.sentinel.security.repository.PermissionRepository;
import com.sentinel.security.repository.RoleRepository;
import com.sentinel.tenancy.entity.*;
import com.sentinel.tenancy.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;

@Component
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final PersonRepository personRepository;
    private final PractitionerRepository practitionerRepository;
    private final AbacPolicyRepository abacPolicyRepository;

    private final OrganizationRepository organizationRepository;
    private final FacilityRepository facilityRepository;
    private final DepartmentRepository departmentRepository;
    private final WardRepository wardRepository;
    private final RoomRepository roomRepository;
    private final BedRepository bedRepository;

    private final PatientRepository patientRepository;
    private final PatientOrganizationRepository patientOrganizationRepository;
    private final EmergencyContactRepository emergencyContactRepository;
    private final PatientDemographicsRepository patientDemographicsRepository;

    private final EncounterRepository encounterRepository;
    private final VitalsRepository vitalsRepository;
    private final AllergyRepository allergyRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final ClinicalDocumentRepository clinicalDocumentRepository;

    private final MedicationRepository medicationRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;
    private final InvoiceRepository invoiceRepository;

    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            RoleRepository roleRepository,
            PermissionRepository permissionRepository,
            UserRepository userRepository,
            PersonRepository personRepository,
            PractitionerRepository practitionerRepository,
            AbacPolicyRepository abacPolicyRepository,
            OrganizationRepository organizationRepository,
            FacilityRepository facilityRepository,
            DepartmentRepository departmentRepository,
            WardRepository wardRepository,
            RoomRepository roomRepository,
            BedRepository bedRepository,
            PatientRepository patientRepository,
            PatientOrganizationRepository patientOrganizationRepository,
            EmergencyContactRepository emergencyContactRepository,
            PatientDemographicsRepository patientDemographicsRepository,
            EncounterRepository encounterRepository,
            VitalsRepository vitalsRepository,
            AllergyRepository allergyRepository,
            DiagnosisRepository diagnosisRepository,
            ClinicalDocumentRepository clinicalDocumentRepository,
            MedicationRepository medicationRepository,
            PrescriptionRepository prescriptionRepository,
            AppointmentRepository appointmentRepository,
            InvoiceRepository invoiceRepository,
            PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.userRepository = userRepository;
        this.personRepository = personRepository;
        this.practitionerRepository = practitionerRepository;
        this.abacPolicyRepository = abacPolicyRepository;
        this.organizationRepository = organizationRepository;
        this.facilityRepository = facilityRepository;
        this.departmentRepository = departmentRepository;
        this.wardRepository = wardRepository;
        this.roomRepository = roomRepository;
        this.bedRepository = bedRepository;
        this.patientRepository = patientRepository;
        this.patientOrganizationRepository = patientOrganizationRepository;
        this.emergencyContactRepository = emergencyContactRepository;
        this.patientDemographicsRepository = patientDemographicsRepository;
        this.encounterRepository = encounterRepository;
        this.vitalsRepository = vitalsRepository;
        this.allergyRepository = allergyRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.clinicalDocumentRepository = clinicalDocumentRepository;
        this.medicationRepository = medicationRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.appointmentRepository = appointmentRepository;
        this.invoiceRepository = invoiceRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("Starting automated EHR database initialization...");

        // 1. Permissions & Roles
        Map<String, Permission> permissions = initPermissions();
        Map<String, Role> roles = initRoles(permissions);

        // 2. Staff Users & Admin
        Map<String, User> users = initUsers(roles);

        // 3. ABAC Security Policies
        initAbacPolicies();

        // 4. Tenancy Hierarchy
        TenancyContext tenancy = initTenancy();

        // 5. Practitioners
        initPractitioners(users);

        // 6. Patients & Demographics
        List<Patient> patients = initPatients(tenancy.aiims, users);

        // 7. Encounters, Vitals, Allergies, Diagnoses, Notes
        initClinical(tenancy, users, patients);

        // 8. Pharmacy Medications & Orders
        initPharmacy(tenancy, users, patients);

        // 9. Appointments & Scheduling
        initAppointments(tenancy, users, patients);

        // 10. Invoices & Billing
        initBilling(tenancy, patients);

        log.info("EHR database initialization completed successfully.");
    }

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
            "SUPER_ADMIN",
            "ORGANIZATION_ADMIN",
            "PHYSICIAN",
            "NURSE",
            "RECEPTIONIST",
            "LAB_TECHNICIAN",
            "PHARMACIST",
            "BILLING_STAFF",
            "AUDITOR",
            "PATIENT"
        };

        Map<String, Role> map = new HashMap<>();
        for (String roleName : canonicalRoles) {
            Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(new Role(roleName, roleName + " Role")));

            // Assign full permissions to admin roles
            if (roleName.equals("SUPER_ADMIN") || roleName.equals("ORGANIZATION_ADMIN")) {
                role.setPermissions(new HashSet<>(permissions.values()));
                roleRepository.save(role);
            }
            map.put(roleName, role);
        }
        return map;
    }

    private Map<String, User> initUsers(Map<String, Role> roles) {
        String defaultPass = passwordEncoder.encode("Sentinel@123");
        Map<String, User> userMap = new HashMap<>();

        // 1. Admin
        User admin = userRepository.findByUsername("admin").orElseGet(() -> {
            User u = new User();
            u.setUsername("admin");
            u.setEmail("admin@sentinel.local");
            u.setPassword(defaultPass);
            u.setStatus("ACTIVE");
            u.setMfaEnabled(false);
            if (roles.containsKey("SUPER_ADMIN")) u.getRoles().add(roles.get("SUPER_ADMIN"));
            return userRepository.save(u);
        });
        userMap.put("admin", admin);

        // 2. Dr. Arjun Sharma
        User arjun = userRepository.findByUsername("arjun.sharma").orElseGet(() -> {
            Person p = personRepository.save(new Person("Arjun", "Sharma", "MALE", LocalDate.of(1985, 6, 15)));
            User u = new User();
            u.setUsername("arjun.sharma");
            u.setEmail("arjun.sharma@aiims.edu");
            u.setPassword(defaultPass);
            u.setPerson(p);
            u.setStatus("ACTIVE");
            u.setMfaEnabled(false);
            if (roles.containsKey("PHYSICIAN")) u.getRoles().add(roles.get("PHYSICIAN"));
            return userRepository.save(u);
        });
        userMap.put("arjun.sharma", arjun);

        // 3. Dr. Priya Kapoor
        User priya = userRepository.findByUsername("priya.kapoor").orElseGet(() -> {
            Person p = personRepository.save(new Person("Priya", "Kapoor", "FEMALE", LocalDate.of(1990, 3, 22)));
            User u = new User();
            u.setUsername("priya.kapoor");
            u.setEmail("priya.kapoor@aiims.edu");
            u.setPassword(defaultPass);
            u.setPerson(p);
            u.setStatus("ACTIVE");
            u.setMfaEnabled(false);
            if (roles.containsKey("PHYSICIAN")) u.getRoles().add(roles.get("PHYSICIAN"));
            return userRepository.save(u);
        });
        userMap.put("priya.kapoor", priya);

        // 4. Dr. Rajesh Patel
        User rajesh = userRepository.findByUsername("rajesh.patel").orElseGet(() -> {
            Person p = personRepository.save(new Person("Rajesh", "Patel", "MALE", LocalDate.of(1978, 11, 8)));
            User u = new User();
            u.setUsername("rajesh.patel");
            u.setEmail("rajesh.patel@aiims.edu");
            u.setPassword(defaultPass);
            u.setPerson(p);
            u.setStatus("ACTIVE");
            u.setMfaEnabled(false);
            if (roles.containsKey("PHYSICIAN")) u.getRoles().add(roles.get("PHYSICIAN"));
            return userRepository.save(u);
        });
        userMap.put("rajesh.patel", rajesh);

        // 5. Nurse Sunita Verma
        User sunita = userRepository.findByUsername("sunita.verma").orElseGet(() -> {
            Person p = personRepository.save(new Person("Sunita", "Verma", "FEMALE", LocalDate.of(1982, 7, 30)));
            User u = new User();
            u.setUsername("sunita.verma");
            u.setEmail("sunita.verma@aiims.edu");
            u.setPassword(defaultPass);
            u.setPerson(p);
            u.setStatus("ACTIVE");
            u.setMfaEnabled(false);
            if (roles.containsKey("NURSE")) u.getRoles().add(roles.get("NURSE"));
            return userRepository.save(u);
        });
        userMap.put("sunita.verma", sunita);

        // 6. Org Admin Vikram Singh
        User vikram = userRepository.findByUsername("vikram.singh").orElseGet(() -> {
            Person p = personRepository.save(new Person("Vikram", "Singh", "MALE", LocalDate.of(1975, 1, 20)));
            User u = new User();
            u.setUsername("vikram.singh");
            u.setEmail("vikram.singh@apollo.com");
            u.setPassword(defaultPass);
            u.setPerson(p);
            u.setStatus("ACTIVE");
            u.setMfaEnabled(false);
            if (roles.containsKey("ORGANIZATION_ADMIN")) u.getRoles().add(roles.get("ORGANIZATION_ADMIN"));
            return userRepository.save(u);
        });
        userMap.put("vikram.singh", vikram);

        // 7. Receptionist Sarita Gupta
        User sarita = userRepository.findByUsername("sarita.gupta").orElseGet(() -> {
            Person p = personRepository.save(new Person("Sarita", "Gupta", "FEMALE", LocalDate.of(1992, 9, 14)));
            User u = new User();
            u.setUsername("sarita.gupta");
            u.setEmail("sarita.gupta@aiims.edu");
            u.setPassword(defaultPass);
            u.setPerson(p);
            u.setStatus("ACTIVE");
            u.setMfaEnabled(false);
            if (roles.containsKey("RECEPTIONIST")) u.getRoles().add(roles.get("RECEPTIONIST"));
            return userRepository.save(u);
        });
        userMap.put("sarita.gupta", sarita);

        // 8. Lab Tech Amit Roy
        User amit = userRepository.findByUsername("amit.roy").orElseGet(() -> {
            Person p = personRepository.save(new Person("Amit", "Roy", "MALE", LocalDate.of(1989, 4, 18)));
            User u = new User();
            u.setUsername("amit.roy");
            u.setEmail("amit.roy@aiims.edu");
            u.setPassword(defaultPass);
            u.setPerson(p);
            u.setStatus("ACTIVE");
            u.setMfaEnabled(false);
            if (roles.containsKey("LAB_TECHNICIAN")) u.getRoles().add(roles.get("LAB_TECHNICIAN"));
            return userRepository.save(u);
        });
        userMap.put("amit.roy", amit);

        // 9. Pharmacist Anita Deshmukh
        User anita = userRepository.findByUsername("anita.deshmukh").orElseGet(() -> {
            Person p = personRepository.save(new Person("Anita", "Deshmukh", "FEMALE", LocalDate.of(1986, 12, 5)));
            User u = new User();
            u.setUsername("anita.deshmukh");
            u.setEmail("anita.deshmukh@aiims.edu");
            u.setPassword(defaultPass);
            u.setPerson(p);
            u.setStatus("ACTIVE");
            u.setMfaEnabled(false);
            if (roles.containsKey("PHARMACIST")) u.getRoles().add(roles.get("PHARMACIST"));
            return userRepository.save(u);
        });
        userMap.put("anita.deshmukh", anita);

        // 10. Billing Staff Vikas Mehta
        User vikas = userRepository.findByUsername("vikas.mehta").orElseGet(() -> {
            Person p = personRepository.save(new Person("Vikas", "Mehta", "MALE", LocalDate.of(1984, 8, 27)));
            User u = new User();
            u.setUsername("vikas.mehta");
            u.setEmail("vikas.mehta@aiims.edu");
            u.setPassword(defaultPass);
            u.setPerson(p);
            u.setStatus("ACTIVE");
            u.setMfaEnabled(false);
            if (roles.containsKey("BILLING_STAFF")) u.getRoles().add(roles.get("BILLING_STAFF"));
            return userRepository.save(u);
        });
        userMap.put("vikas.mehta", vikas);

        // 11. Auditor Suresh Nair
        User suresh = userRepository.findByUsername("suresh.nair").orElseGet(() -> {
            Person p = personRepository.save(new Person("Suresh", "Nair", "MALE", LocalDate.of(1979, 3, 11)));
            User u = new User();
            u.setUsername("suresh.nair");
            u.setEmail("suresh.nair@aiims.edu");
            u.setPassword(defaultPass);
            u.setPerson(p);
            u.setStatus("ACTIVE");
            u.setMfaEnabled(false);
            if (roles.containsKey("AUDITOR")) u.getRoles().add(roles.get("AUDITOR"));
            return userRepository.save(u);
        });
        userMap.put("suresh.nair", suresh);

        // 12. Patient Ramesh Kumar
        User ramesh = userRepository.findByUsername("ramesh.kumar").orElseGet(() -> {
            Person p = personRepository.save(new Person("Ramesh", "Kumar", "MALE", LocalDate.of(1960, 4, 10)));
            User u = new User();
            u.setUsername("ramesh.kumar");
            u.setEmail("ramesh.kumar@gmail.com");
            u.setPassword(defaultPass);
            u.setPerson(p);
            u.setStatus("ACTIVE");
            u.setMfaEnabled(false);
            if (roles.containsKey("PATIENT")) u.getRoles().add(roles.get("PATIENT"));
            return userRepository.save(u);
        });
        userMap.put("ramesh.kumar", ramesh);

        return userMap;
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
        }
    }

    private static class TenancyContext {
        Organization aiims;
        Organization apollo;
        Facility aiimsMain;
        Facility aiimsOpd;
        Department cardio;
        Department neuro;
        Department emer;
        Ward cardWard;
        Room room101;
        Bed bed1;
    }

    private TenancyContext initTenancy() {
        TenancyContext ctx = new TenancyContext();

        // Organizations
        ctx.aiims = organizationRepository.findByCode("AIIMS-DEL").orElseGet(() -> {
            Organization o = new Organization("AIIMS-DEL", "AIIMS New Delhi");
            o.setLegalName("All India Institute of Medical Sciences");
            o.setOrganizationType("HOSPITAL");
            o.setPhone("+91-11-26588500");
            o.setEmail("admin@aiims.edu");
            o.setWebsite("https://www.aiims.edu");
            return organizationRepository.save(o);
        });

        ctx.apollo = organizationRepository.findByCode("APOLLO-MUM").orElseGet(() -> {
            Organization o = new Organization("APOLLO-MUM", "Apollo Hospitals Mumbai");
            o.setLegalName("Apollo Hospitals Enterprise Ltd - Mumbai");
            o.setOrganizationType("HOSPITAL");
            o.setPhone("+91-22-66920000");
            o.setEmail("info@apollomumbai.com");
            o.setWebsite("https://www.apollohospitals.com");
            return organizationRepository.save(o);
        });

        // Facilities
        ctx.aiimsMain = facilityRepository.findByCode("AIIMS-MAIN").orElseGet(() -> {
            Facility f = new Facility();
            f.setOrganization(ctx.aiims);
            f.setCode("AIIMS-MAIN");
            f.setName("AIIMS Main Hospital");
            f.setFacilityType("INPATIENT");
            f.setAddressLine1("Ansari Nagar East");
            f.setCity("New Delhi");
            f.setState("Delhi");
            f.setPostalCode("110029");
            f.setPhone("+91-11-26588500");
            return facilityRepository.save(f);
        });

        ctx.aiimsOpd = facilityRepository.findByCode("AIIMS-OPD").orElseGet(() -> {
            Facility f = new Facility();
            f.setOrganization(ctx.aiims);
            f.setCode("AIIMS-OPD");
            f.setName("AIIMS OPD Block");
            f.setFacilityType("OUTPATIENT");
            f.setAddressLine1("Ansari Nagar East");
            f.setCity("New Delhi");
            f.setState("Delhi");
            f.setPostalCode("110029");
            f.setPhone("+91-11-26588501");
            return facilityRepository.save(f);
        });

        // Departments
        // Departments
        ctx.cardio = departmentRepository.findByFacilityIdAndCode(ctx.aiimsMain.getId(), "CARD").orElseGet(() -> {
            Department d = new Department();
            d.setOrganization(ctx.aiims);
            d.setFacility(ctx.aiimsMain);
            d.setCode("CARD");
            d.setName("Cardiology");
            d.setDepartmentType("CLINICAL");
            return departmentRepository.save(d);
        });

        ctx.neuro = departmentRepository.findByFacilityIdAndCode(ctx.aiimsMain.getId(), "NEURO").orElseGet(() -> {
            Department d = new Department();
            d.setOrganization(ctx.aiims);
            d.setFacility(ctx.aiimsMain);
            d.setCode("NEURO");
            d.setName("Neurology");
            d.setDepartmentType("CLINICAL");
            return departmentRepository.save(d);
        });

        ctx.emer = departmentRepository.findByFacilityIdAndCode(ctx.aiimsMain.getId(), "EMER").orElseGet(() -> {
            Department d = new Department();
            d.setOrganization(ctx.aiims);
            d.setFacility(ctx.aiimsMain);
            d.setCode("EMER");
            d.setName("Emergency Medicine");
            d.setDepartmentType("EMERGENCY");
            return departmentRepository.save(d);
        });

        // Wards
        ctx.cardWard = wardRepository.findByFacilityId(ctx.aiimsMain.getId()).stream()
                .filter(w -> "CARD-W1".equals(w.getCode()))
                .findFirst()
                .orElseGet(() -> {
                    Ward w = new Ward();
                    w.setOrganization(ctx.aiims);
                    w.setFacility(ctx.aiimsMain);
                    w.setDepartment(ctx.cardio);
                    w.setCode("CARD-W1");
                    w.setName("Cardiology Ward 1");
                    w.setWardType("GENERAL");
                    w.setGenderPolicy("MIXED");
                    return wardRepository.save(w);
                });

        // Rooms
        ctx.room101 = roomRepository.findByWardIdAndRoomNumber(ctx.cardWard.getId(), "101").orElseGet(() -> {
            Room r = new Room();
            r.setOrganization(ctx.aiims);
            r.setFacility(ctx.aiimsMain);
            r.setWard(ctx.cardWard);
            r.setRoomNumber("101");
            r.setRoomType("GENERAL");
            r.setFloor("1");
            return roomRepository.save(r);
        });

        // Beds
        ctx.bed1 = bedRepository.findByBedCode("B101-1").orElseGet(() -> {
            Bed b = new Bed();
            b.setOrganization(ctx.aiims);
            b.setFacility(ctx.aiimsMain);
            b.setWard(ctx.cardWard);
            b.setRoom(ctx.room101);
            b.setBedCode("B101-1");
            b.setBedNumber("101-1");
            b.setBedType("STANDARD");
            b.setStatus("AVAILABLE");
            return bedRepository.save(b);
        });

        return ctx;
    }

    private void initPractitioners(Map<String, User> users) {
        if (practitionerRepository.count() == 0) {
            User arjun = users.get("arjun.sharma");
            if (arjun != null && arjun.getPerson() != null) {
                Practitioner p = new Practitioner();
                p.setPerson(arjun.getPerson());
                p.setIdentifier("MCI-2010-12345");
                p.setPractitionerType("PHYSICIAN");
                p.setPrimarySpecialty("Cardiology");
                p.setStatus("ACTIVE");
                practitionerRepository.save(p);
            }

            User priya = users.get("priya.kapoor");
            if (priya != null && priya.getPerson() != null) {
                Practitioner p = new Practitioner();
                p.setPerson(priya.getPerson());
                p.setIdentifier("MCI-2015-67890");
                p.setPractitionerType("PHYSICIAN");
                p.setPrimarySpecialty("Neurology");
                p.setStatus("ACTIVE");
                practitionerRepository.save(p);
            }

            User sunita = users.get("sunita.verma");
            if (sunita != null && sunita.getPerson() != null) {
                Practitioner p = new Practitioner();
                p.setPerson(sunita.getPerson());
                p.setIdentifier("INC-2006-55555");
                p.setPractitionerType("NURSE");
                p.setPrimarySpecialty("Critical Care");
                p.setStatus("ACTIVE");
                practitionerRepository.save(p);
            }
        }
    }

    private List<Patient> initPatients(Organization org, Map<String, User> users) {
        List<Patient> list = new ArrayList<>();
        if (patientRepository.count() == 0) {
            String[][] patientData = {
                {"Ramesh", "Kumar", "MALE", "1960-04-10", "Retired Govt Officer", "B+", "AIIMS-2024-001001", "Meera Kumar", "SPOUSE", "+91-9820001001"},
                {"Anita", "Sharma", "FEMALE", "1975-09-25", "Teacher", "O+", "AIIMS-2024-001002", "Ravi Sharma", "SPOUSE", "+91-9820002002"},
                {"Mohammed", "Azhar", "MALE", "1988-12-03", "Software Engineer", "A+", "AIIMS-2024-001003", "Khalid Azhar", "PARENT", "+91-9820003003"},
                {"Lakshmi", "Iyer", "FEMALE", "1950-07-18", "Homemaker", "AB-", "AIIMS-2024-001004", "Gita Iyer", "DAUGHTER", "+91-9820004004"},
                {"Suresh", "Naidu", "MALE", "1995-02-28", "Student", "O-", "APL-2024-005001", "Lata Naidu", "PARENT", "+91-9820005005"}
            };

            for (int i = 0; i < patientData.length; i++) {
                String[] row = patientData[i];
                Person person;
                if (i == 0 && users.containsKey("ramesh.kumar") && users.get("ramesh.kumar").getPerson() != null) {
                    person = users.get("ramesh.kumar").getPerson();
                } else {
                    person = new Person();
                    person.setFirstName(row[0]);
                    person.setLastName(row[1]);
                    person.setSexAtBirth(row[2]);
                    person.setDateOfBirth(LocalDate.parse(row[3]));
                    person = personRepository.save(person);
                }

                Patient p = new Patient();
                p.setPerson(person);
                p.setStatus("ACTIVE");
                p = patientRepository.save(p);

                PatientOrganization po = new PatientOrganization();
                po.setPatient(p);
                po.setOrganization(org);
                po.setMrn(row[6]);
                po.setPatientStatus("ACTIVE");
                po.setRegisteredAt(OffsetDateTime.now());
                patientOrganizationRepository.save(po);

                // Demographics
                PatientDemographics demo = new PatientDemographics();
                demo.setPatient(p);
                demo.setBloodGroup(row[5]);
                demo.setEthnicity(row[4]);
                patientDemographicsRepository.save(demo);

                // Emergency Contact
                EmergencyContact ec = new EmergencyContact(row[7], row[8], row[9]);
                ec.setPatient(p);
                ec.setIsPrimary(true);
                ec.setCanMakeMedicalDecisions(true);
                emergencyContactRepository.save(ec);

                list.add(p);
            }
        } else {
            list = patientRepository.findAll();
        }
        return list;
    }

    private void initClinical(TenancyContext tenancy, Map<String, User> users, List<Patient> patients) {
        if (patients.isEmpty() || encounterRepository.count() > 0) return;

        Patient p1 = patients.get(0); // Ramesh Kumar
        User arjun = users.get("arjun.sharma");

        // 1. Encounter
        Encounter enc = new Encounter();
        enc.setOrganization(tenancy.aiims);
        enc.setFacility(tenancy.aiimsMain);
        enc.setDepartment(tenancy.cardio);
        enc.setPatient(p1);
        enc.setEncounterNumber("ENC-2024-001001");
        enc.setEncounterType("INPATIENT");
        enc.setStatus("IN_PROGRESS");
        enc.setChiefComplaint("Acute chest pain and diaphoresis");
        enc.setStartedAt(OffsetDateTime.now().minusDays(1));
        enc.setCreatedBy(arjun);
        enc = encounterRepository.save(enc);

        // 2. Vitals
        Vitals v = new Vitals();
        v.setOrganization(tenancy.aiims);
        v.setPatient(p1);
        v.setEncounter(enc);
        v.setSystolicBp(new BigDecimal("145"));
        v.setDiastolicBp(new BigDecimal("92"));
        v.setHeartRate(new BigDecimal("98"));
        v.setRespiratoryRate(new BigDecimal("20"));
        v.setTemperature(new BigDecimal("37.1"));
        v.setOxygenSaturation(new BigDecimal("94.0"));
        v.setRecordedBy(arjun);
        vitalsRepository.save(v);

        // 3. Allergy
        Allergy a = new Allergy();
        a.setPatient(p1);
        a.setOrganization(tenancy.aiims);
        a.setAllergenName("Penicillin");
        a.setCategory("DRUG");
        a.setReaction("Urticaria and facial angioedema");
        a.setSeverity("SEVERE");
        a.setStatus("ACTIVE");
        a.setOnsetDate(LocalDate.of(2012, 4, 15));
        a.setRecordedBy(arjun);
        allergyRepository.save(a);

        // 4. Diagnosis
        Diagnosis d = new Diagnosis();
        d.setPatient(p1);
        d.setDoctor(arjun);
        d.setConditionName("ST elevation myocardial infarction (STEMI) — anterior wall");
        d.setIcdCode("I21.0");
        d.setStatus("active");
        d.setRecordedAt(OffsetDateTime.now());
        diagnosisRepository.save(d);

        // 5. Clinical Document
        ClinicalDocument doc = new ClinicalDocument();
        doc.setOrganization(tenancy.aiims);
        doc.setPatient(p1);
        doc.setEncounter(enc);
        doc.setDocumentType("PROGRESS_NOTE");
        doc.setTitle("Cardiology Inpatient Progress Note — Day 1");
        doc.setAuthorUser(arjun);
        doc.setStatus("FINAL");
        clinicalDocumentRepository.save(doc);
    }

    private void initPharmacy(TenancyContext tenancy, Map<String, User> users, List<Patient> patients) {
        if (medicationRepository.count() == 0) {
            String[][] meds = {
                {"Aspirin", "Disprin", "TABLET", "75 mg"},
                {"Atorvastatin", "Lipitor", "TABLET", "40 mg"},
                {"Metoprolol succinate", "Betaloc ZOK", "TABLET", "50 mg"},
                {"Enoxaparin", "Clexane", "INJECTION", "40 mg/0.4ml"},
                {"Paracetamol", "Calpol", "TABLET", "500 mg"},
                {"Clopidogrel", "Plavix", "TABLET", "75 mg"}
            };
            for (String[] m : meds) {
                Medication med = new Medication();
                med.setName(m[0]);
                med.setGenericName(m[1]);
                med.setForm(m[2]);
                med.setStrength(m[3]);
                medicationRepository.save(med);
            }
        }

        if (!patients.isEmpty() && prescriptionRepository.count() == 0) {
            Patient p1 = patients.get(0);
            User arjun = users.get("arjun.sharma");

            Prescription rx = new Prescription();
            rx.setOrganization(tenancy.aiims);
            rx.setPatient(p1);
            rx.setDoctor(arjun);
            rx.setStatus("ACTIVE");
            rx.setIndication("Post-PCI STEMI secondary prevention");
            rx.setInstructions("Aspirin 75mg OD + Atorvastatin 40mg HS");
            rx.setPrescribedAt(OffsetDateTime.now());
            prescriptionRepository.save(rx);
        }
    }

    private void initAppointments(TenancyContext tenancy, Map<String, User> users, List<Patient> patients) {
        if (patients.size() >= 2 && appointmentRepository.count() == 0) {
            Patient p2 = patients.get(1); // Anita Sharma
            User priya = users.get("priya.kapoor");

            Appointment appt = new Appointment();
            appt.setOrganization(tenancy.aiims);
            appt.setFacility(tenancy.aiimsOpd);
            appt.setDepartment(tenancy.neuro);
            appt.setPatient(p2);
            appt.setCreatedBy(priya);
            appt.setStatus("SCHEDULED");
            appt.setReason("Follow-up evaluation for chronic tension headaches");
            appt.setStartsAt(OffsetDateTime.now().plusDays(2).withHour(10).withMinute(0));
            appt.setEndsAt(OffsetDateTime.now().plusDays(2).withHour(10).withMinute(30));
            appointmentRepository.save(appt);
        }
    }

    private void initBilling(TenancyContext tenancy, List<Patient> patients) {
        if (!patients.isEmpty() && invoiceRepository.count() == 0) {
            Patient p1 = patients.get(0);

            Invoice inv = new Invoice();
            inv.setPatient(p1);
            inv.setInvoiceNumber("INV-2024-001001");
            inv.setTotalAmount(new BigDecimal("92650.00"));
            inv.setPaidAmount(new BigDecimal("92650.00"));
            inv.setStatus("PAID");
            inv.setIssuedAt(OffsetDateTime.now().minusDays(1));
            invoiceRepository.save(inv);
        }
    }
}
