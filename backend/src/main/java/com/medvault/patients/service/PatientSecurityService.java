package com.medvault.patients.service;

import com.medvault.allergies.repository.AllergyRepository;
import com.medvault.appointments.entity.Appointment;
import com.medvault.appointments.repository.AppointmentRepository;
import com.medvault.authorization.evaluator.ABACEvaluator;
import com.medvault.clinicalrecords.entity.MedicalRecord;
import com.medvault.clinicalrecords.repository.MedicalRecordRepository;
import com.medvault.diagnoses.entity.Diagnosis;
import com.medvault.diagnoses.repository.DiagnosisRepository;
import com.medvault.encounters.entity.Encounter;
import com.medvault.encounters.repository.EncounterRepository;
import com.medvault.patients.entity.Patient;
import com.medvault.patients.repository.PatientRepository;
import com.medvault.prescriptions.entity.Prescription;
import com.medvault.prescriptions.repository.PrescriptionRepository;
import com.medvault.users.entity.User;
import com.medvault.users.repository.UserRepository;
import com.medvault.vitals.entity.Vitals;
import com.medvault.vitals.repository.VitalsRepository;
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
            Optional<User> userOpt = userRepository.findByUsername(authentication.getName());
            if (userOpt.isPresent()) {
                Optional<Patient> patientOpt = patientRepository.findByUserId(userOpt.get().getId());
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
            Optional<User> userOpt = userRepository.findByUsername(authentication.getName());
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
        if (appointmentId == null) return false;
        Optional<Appointment> opt = appointmentRepository.findById(appointmentId);
        return opt.isPresent() && opt.get().getPatient() != null && canAccessPatient(authentication, opt.get().getPatient().getId());
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
        Optional<com.medvault.allergies.entity.Allergy> opt = allergyRepository.findById(allergyId);
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
