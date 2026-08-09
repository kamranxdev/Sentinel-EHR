package com.medvault.patients.controller;

import com.medvault.allergies.entity.Allergy;
import com.medvault.allergies.repository.AllergyRepository;
import com.medvault.audit.service.AuditTrailService;
import com.medvault.clinicalrecords.entity.MedicalRecord;
import com.medvault.clinicalrecords.repository.MedicalRecordRepository;
import com.medvault.common.exception.ResourceNotFoundException;
import com.medvault.diagnoses.entity.Diagnosis;
import com.medvault.diagnoses.repository.DiagnosisRepository;
import com.medvault.patients.dto.PatientClinicalHistoryDTO;
import com.medvault.patients.entity.Patient;
import com.medvault.patients.repository.PatientRepository;
import com.medvault.patients.service.PatientSecurityService;
import com.medvault.prescriptions.entity.Prescription;
import com.medvault.prescriptions.repository.PrescriptionRepository;
import com.medvault.users.entity.User;
import com.medvault.users.repository.UserRepository;
import com.medvault.vitals.entity.Vitals;
import com.medvault.vitals.repository.VitalsRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/v1/patients", "/api/patients"})
public class PatientController {

    private final PatientRepository patientRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final AllergyRepository allergyRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final VitalsRepository vitalsRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final AuditTrailService auditService;
    private final PatientSecurityService patientSecurityService;
    private final UserRepository userRepository;

    public PatientController(PatientRepository patientRepository,
                             DiagnosisRepository diagnosisRepository,
                             AllergyRepository allergyRepository,
                             PrescriptionRepository prescriptionRepository,
                             VitalsRepository vitalsRepository,
                             MedicalRecordRepository medicalRecordRepository,
                             AuditTrailService auditService,
                             PatientSecurityService patientSecurityService,
                             UserRepository userRepository) {
        this.patientRepository = patientRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.allergyRepository = allergyRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.vitalsRepository = vitalsRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.auditService = auditService;
        this.patientSecurityService = patientSecurityService;
        this.userRepository = userRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('PATIENT_READ', 'ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_RECEPTIONIST')")
    public List<Patient> getAllPatients(@RequestParam(value = "search", required = false) String search, Authentication auth) {
        auditService.logAction(auth, "READ_ALL", "PATIENT_LIST", "0", "Retrieved Master Patient Index roster");
        if (search != null && !search.trim().isEmpty()) {
            return patientRepository.searchPatients(search.trim());
        }
        return patientRepository.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("@patientSecurityService.canAccessPatient(authentication, #id)")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id, Authentication auth) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient record with ID " + id + " not found"));

        boolean isPatientSelf = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"));

        if (isPatientSelf) {
            auditService.logAction(auth, "READ_SELF", "PATIENT_PROFILE", String.valueOf(id), "Patient accessed their personal medical profile");
        } else {
            auditService.logAction(auth, "READ", "PATIENT", String.valueOf(id), "Viewed patient record for " + patient.getFullName() + " (MRN: " + patient.getPatientCode() + ")");
        }

        return ResponseEntity.ok(patient);
    }

    @GetMapping("/{id}/clinical-history")
    @PreAuthorize("@patientSecurityService.canAccessPatient(authentication, #id)")
    public ResponseEntity<PatientClinicalHistoryDTO> getPatientClinicalHistory(@PathVariable Long id, Authentication auth) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient record with ID " + id + " not found"));

        List<Diagnosis> pastIllnesses = diagnosisRepository.findByPatientIdOrderByRecordedAtDesc(id);
        List<Allergy> allergies = allergyRepository.findByPatientIdOrderByRecordedAtDesc(id);
        List<Prescription> prescriptions = prescriptionRepository.findByPatientIdOrderByPrescribedAtDesc(id);
        List<Vitals> vitals = vitalsRepository.findByPatientIdOrderByRecordedAtDesc(id);
        List<MedicalRecord> records = medicalRecordRepository.findByPatientIdOrderByCreatedAtDesc(id);

        PatientClinicalHistoryDTO historyDTO = new PatientClinicalHistoryDTO(
                patient,
                pastIllnesses,
                allergies,
                prescriptions,
                vitals,
                records
        );

        auditService.logAction(auth, "READ", "CLINICAL_HISTORY", String.valueOf(id), "Accessed longitudinal clinical history for patient ID: " + id);
        return ResponseEntity.ok(historyDTO);
    }

    @GetMapping("/me")
    @Transactional
    public ResponseEntity<Patient> getMyPatientProfile(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findByUsernameOrEmail(auth.getName(), auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user record not found: " + auth.getName()));
        return getPatientByUserId(user.getId(), auth);
    }

    @GetMapping("/user/{userId}")
    @Transactional
    @PreAuthorize("@patientSecurityService.canAccessUser(authentication, #userId)")
    public ResponseEntity<Patient> getPatientByUserId(@PathVariable Long userId, Authentication auth) {
        Patient patient = patientRepository.findFirstByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId).orElse(null);
                    if (user != null && user.getEmail() != null) {
                        Optional<Patient> byEmail = patientRepository.findFirstByEmailIgnoreCase(user.getEmail());
                        if (byEmail.isPresent()) {
                            Patient p = byEmail.get();
                            p.setUser(user);
                            return patientRepository.save(p);
                        }
                    }
                    if (user != null) {
                        Patient p = new Patient();
                        p.setPatientCode("PAT-" + System.currentTimeMillis());
                        p.setFullName(user.getFullName());
                        p.setEmail(user.getEmail());
                        p.setUser(user);
                        return patientRepository.save(p);
                    }
                    throw new ResourceNotFoundException("No patient profile linked to user ID: " + userId);
                });

        auditService.logAction(auth, "READ", "PATIENT_BY_USER", String.valueOf(userId), "Accessed patient profile linked to user ID: " + userId);
        return ResponseEntity.ok(patient);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PATIENT_CREATE')")
    public ResponseEntity<Patient> createPatient(@RequestBody Patient patient, Authentication auth) {
        if (patient.getPatientCode() == null || patient.getPatientCode().isEmpty()) {
            patient.setPatientCode("PAT-" + (1000 + (System.currentTimeMillis() % 9000)));
        }

        Patient saved = patientRepository.save(patient);
        auditService.logAction(auth, "CREATE", "PATIENT", String.valueOf(saved.getId()), "Created demographic identity profile for " + saved.getFullName() + " (MRN: " + saved.getPatientCode() + ")");

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@patientSecurityService.canAccessPatient(authentication, #id)")
    public ResponseEntity<Patient> updatePatient(@PathVariable Long id, @RequestBody Patient updated, Authentication auth) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient record with ID " + id + " not found"));

        if (updated.getSsn() != null) patient.setSsn(updated.getSsn());
        if (updated.getFullName() != null) patient.setFullName(updated.getFullName());
        if (updated.getDateOfBirth() != null) patient.setDateOfBirth(updated.getDateOfBirth());
        if (updated.getGender() != null) patient.setGender(updated.getGender());
        if (updated.getBloodType() != null) patient.setBloodType(updated.getBloodType());
        if (updated.getPhone() != null) patient.setPhone(updated.getPhone());
        if (updated.getEmail() != null) patient.setEmail(updated.getEmail());
        if (updated.getAddress() != null) patient.setAddress(updated.getAddress());
        if (updated.getEmergencyContact() != null) patient.setEmergencyContact(updated.getEmergencyContact());
        if (updated.getInsuranceProvider() != null) patient.setInsuranceProvider(updated.getInsuranceProvider());
        if (updated.getInsurancePolicyNumber() != null) patient.setInsurancePolicyNumber(updated.getInsurancePolicyNumber());
        if (updated.getInsuranceGroupNumber() != null) patient.setInsuranceGroupNumber(updated.getInsuranceGroupNumber());
        if (updated.getCoveragePlan() != null) patient.setCoveragePlan(updated.getCoveragePlan());
        if (updated.getDepartment() != null) patient.setDepartment(updated.getDepartment());
        if (updated.getMedicalAlerts() != null) patient.setMedicalAlerts(updated.getMedicalAlerts());
        if (updated.getDietaryHabits() != null) patient.setDietaryHabits(updated.getDietaryHabits());
        if (updated.getSmokingStatus() != null) patient.setSmokingStatus(updated.getSmokingStatus());
        if (updated.getAlcoholConsumption() != null) patient.setAlcoholConsumption(updated.getAlcoholConsumption());
        if (updated.getExerciseRoutine() != null) patient.setExerciseRoutine(updated.getExerciseRoutine());
        if (updated.getFoodAllergies() != null) patient.setFoodAllergies(updated.getFoodAllergies());
        if (updated.getPastMedicalHistory() != null) patient.setPastMedicalHistory(updated.getPastMedicalHistory());
        if (updated.getSeriousConditions() != null) patient.setSeriousConditions(updated.getSeriousConditions());
        if (updated.getSurgeriesAndProcedures() != null) patient.setSurgeriesAndProcedures(updated.getSurgeriesAndProcedures());
        if (updated.getFamilyMedicalHistory() != null) patient.setFamilyMedicalHistory(updated.getFamilyMedicalHistory());

        Patient saved = patientRepository.save(patient);
        auditService.logAction(auth, "UPDATE", "PATIENT", String.valueOf(id), "Updated demographic profile for patient ID: " + id);

        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_SYS_ADMIN')")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id, Authentication auth) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient record with ID " + id + " not found"));

        patientRepository.delete(patient);
        auditService.logAction(auth, "DELETE", "PATIENT", String.valueOf(id), "Deleted patient record MRN: " + patient.getPatientCode());

        return ResponseEntity.noContent().build();
    }
}
