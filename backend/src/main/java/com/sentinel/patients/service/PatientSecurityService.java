package com.sentinel.patients.service;

import com.sentinel.allergies.repository.AllergyRepository;
import com.sentinel.appointments.entity.Appointment;
import com.sentinel.appointments.repository.AppointmentRepository;
import com.sentinel.authorization.evaluator.ABACEvaluator;
import com.sentinel.clinicalrecords.entity.MedicalRecord;
import com.sentinel.clinicalrecords.repository.MedicalRecordRepository;
import com.sentinel.diagnoses.entity.Diagnosis;
import com.sentinel.diagnoses.repository.DiagnosisRepository;
import com.sentinel.encounters.entity.Encounter;
import com.sentinel.encounters.repository.EncounterRepository;
import com.sentinel.patients.entity.Patient;
import com.sentinel.patients.repository.PatientRepository;
import com.sentinel.prescriptions.entity.Prescription;
import com.sentinel.prescriptions.repository.PrescriptionRepository;
import com.sentinel.users.entity.User;
import com.sentinel.users.repository.UserRepository;
import com.sentinel.vitals.entity.Vitals;
import com.sentinel.vitals.repository.VitalsRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service("patientSecurityService")
public class PatientSecurityService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final EncounterRepository encounterRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final AllergyRepository allergyRepository;
    private final VitalsRepository vitalsRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final ABACEvaluator abacEvaluator;

    public PatientSecurityService(UserRepository userRepository,
                                  PatientRepository patientRepository,
                                  AppointmentRepository appointmentRepository,
                                  PrescriptionRepository prescriptionRepository,
                                  EncounterRepository encounterRepository,
                                  DiagnosisRepository diagnosisRepository,
                                  AllergyRepository allergyRepository,
                                  VitalsRepository vitalsRepository,
                                  MedicalRecordRepository medicalRecordRepository,
                                  ABACEvaluator abacEvaluator) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.encounterRepository = encounterRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.allergyRepository = allergyRepository;
        this.vitalsRepository = vitalsRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.abacEvaluator = abacEvaluator;
    }

    public boolean canAccessPatient(Authentication authentication, Long patientId) {
        if (authentication == null || !authentication.isAuthenticated() || patientId == null) {
            return false;
        }

        Set<String> authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        if (authorities.contains("ROLE_SYS_ADMIN") || authorities.contains("ROLE_ORG_ADMIN") ||
            authorities.contains("ROLE_ADMIN") || authorities.contains("ROLE_DOCTOR") ||
            authorities.contains("ROLE_NURSE") || authorities.contains("ROLE_RECEPTIONIST") ||
            authorities.contains("ROLE_LAB_TECH") || authorities.contains("ROLE_PHARMACIST") ||
            authorities.contains("ROLE_BILLING") || authorities.contains("ROLE_AUDITOR") ||
            authorities.contains("PATIENT_READ")) {
            
            return abacEvaluator.hasTreatmentRelationship(authentication, patientId);
        }

        if (authorities.contains("ROLE_PATIENT")) {
            Optional<User> userOpt = userRepository.findByUsernameOrEmail(authentication.getName(), authentication.getName());
            if (userOpt.isPresent()) {
                Optional<Patient> patientOpt = patientRepository.findFirstByUserId(userOpt.get().getId());
                return patientOpt.isPresent() && patientOpt.get().getId().equals(patientId);
            }
        }

        return false;
    }

    public boolean canAccessUser(Authentication authentication, Long userId) {
        if (authentication == null || !authentication.isAuthenticated() || userId == null) {
            return false;
        }

        Set<String> authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        if (authorities.contains("ROLE_SYS_ADMIN") || authorities.contains("ROLE_ORG_ADMIN") ||
            authorities.contains("ROLE_ADMIN") || authorities.contains("ROLE_DOCTOR") ||
            authorities.contains("ROLE_NURSE") || authorities.contains("ROLE_RECEPTIONIST") ||
            authorities.contains("ROLE_AUDITOR")) {
            return true;
        }

        if (authorities.contains("ROLE_PATIENT")) {
            Optional<User> userOpt = userRepository.findByUsernameOrEmail(authentication.getName(), authentication.getName());
            return userOpt.isPresent() && userOpt.get().getId().equals(userId);
        }

        return false;
    }

    public boolean canAccessPatientWithPermission(Authentication authentication, Long patientId, String permissionCode) {
        if (authentication == null || !authentication.isAuthenticated() || patientId == null) {
            return false;
        }

        boolean hasPermission = abacEvaluator.hasPermission(authentication, permissionCode);
        if (!hasPermission) {
            return false;
        }

        return canAccessPatient(authentication, patientId);
    }

    public boolean canAccessAppointment(Authentication authentication, Long appointmentId) {
        if (authentication == null || !authentication.isAuthenticated() || appointmentId == null) return false;
        Optional<Appointment> opt = appointmentRepository.findById(appointmentId);
        if (opt.isEmpty() || opt.get().getPatient() == null) return false;

        Appointment apt = opt.get();
        if (apt.getDoctor() != null && apt.getDoctor().getUsername() != null &&
            apt.getDoctor().getUsername().equalsIgnoreCase(authentication.getName())) {
            return true;
        }

        Set<String> authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        if (authorities.contains("ROLE_SYS_ADMIN") || authorities.contains("ROLE_ORG_ADMIN") ||
            authorities.contains("ROLE_ADMIN") || authorities.contains("ROLE_NURSE") ||
            authorities.contains("ROLE_RECEPTIONIST") || authorities.contains("ROLE_AUDITOR")) {
            return true;
        }

        return canAccessPatient(authentication, opt.get().getPatient().getId());
    }

    public boolean canAccessPrescription(Authentication authentication, Long prescriptionId) {
        if (prescriptionId == null) return false;
        Optional<Prescription> opt = prescriptionRepository.findById(prescriptionId);
        return opt.isPresent() && opt.get().getPatient() != null && canAccessPatient(authentication, opt.get().getPatient().getId());
    }

    public boolean canAccessEncounter(Authentication authentication, Long encounterId) {
        if (encounterId == null) return false;
        Optional<Encounter> opt = encounterRepository.findById(encounterId);
        return opt.isPresent() && opt.get().getPatient() != null && canAccessPatient(authentication, opt.get().getPatient().getId());
    }

    public boolean canAccessDiagnosis(Authentication authentication, Long diagnosisId) {
        if (diagnosisId == null) return false;
        Optional<Diagnosis> opt = diagnosisRepository.findById(diagnosisId);
        return opt.isPresent() && opt.get().getPatient() != null && canAccessPatient(authentication, opt.get().getPatient().getId());
    }

    public boolean canAccessAllergy(Authentication authentication, Long allergyId) {
        if (allergyId == null) return false;
        Optional<com.sentinel.allergies.entity.Allergy> opt = allergyRepository.findById(allergyId);
        return opt.isPresent() && opt.get().getPatient() != null && canAccessPatient(authentication, opt.get().getPatient().getId());
    }

    public boolean canAccessVitals(Authentication authentication, Long vitalsId) {
        if (vitalsId == null) return false;
        Optional<Vitals> opt = vitalsRepository.findById(vitalsId);
        return opt.isPresent() && opt.get().getPatient() != null && canAccessPatient(authentication, opt.get().getPatient().getId());
    }

    public boolean canAccessMedicalRecord(Authentication authentication, Long recordId) {
        if (recordId == null) return false;
        Optional<MedicalRecord> opt = medicalRecordRepository.findById(recordId);
        return opt.isPresent() && opt.get().getPatient() != null && canAccessPatient(authentication, opt.get().getPatient().getId());
    }
}
