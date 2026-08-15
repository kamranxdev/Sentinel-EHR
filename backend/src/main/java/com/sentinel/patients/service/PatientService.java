package com.sentinel.patients.service;

import com.sentinel.allergies.entity.Allergy;
import com.sentinel.allergies.repository.AllergyRepository;
import com.sentinel.encounters.entity.MedicalRecord;
import com.sentinel.encounters.repository.MedicalRecordRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.diagnoses.entity.Diagnosis;
import com.sentinel.diagnoses.repository.DiagnosisRepository;
import com.sentinel.patients.dto.PatientClinicalHistoryDTO;
import com.sentinel.patients.entity.Patient;
import com.sentinel.patients.repository.PatientRepository;
import com.sentinel.prescriptions.entity.Prescription;
import com.sentinel.prescriptions.repository.PrescriptionRepository;
import com.sentinel.users.entity.User;
import com.sentinel.users.repository.UserRepository;
import com.sentinel.vitals.entity.Vitals;
import com.sentinel.vitals.repository.VitalsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final AllergyRepository allergyRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final VitalsRepository vitalsRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final UserRepository userRepository;

    public PatientService(PatientRepository patientRepository,
                          DiagnosisRepository diagnosisRepository,
                          AllergyRepository allergyRepository,
                          PrescriptionRepository prescriptionRepository,
                          VitalsRepository vitalsRepository,
                          MedicalRecordRepository medicalRecordRepository,
                          UserRepository userRepository) {
        this.patientRepository = patientRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.allergyRepository = allergyRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.vitalsRepository = vitalsRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<Patient> getAllPatients(String search) {
        if (search != null && !search.trim().isEmpty()) {
            return patientRepository.searchPatients(search.trim());
        }
        return patientRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient record with ID " + id + " not found"));
    }

    @Transactional(readOnly = true)
    public Patient getPatientByCode(String code) {
        return patientRepository.findByPatientCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with MRN: " + code));
    }

    @Transactional(readOnly = true)
    public PatientClinicalHistoryDTO getPatientClinicalHistory(Long id) {
        Patient patient = getPatientById(id);

        List<Diagnosis> pastIllnesses = diagnosisRepository.findByPatientIdOrderByRecordedAtDesc(id);
        List<Allergy> allergies = allergyRepository.findByPatientIdOrderByRecordedAtDesc(id);
        List<Prescription> prescriptions = prescriptionRepository.findByPatientIdOrderByPrescribedAtDesc(id);
        List<Vitals> vitals = vitalsRepository.findByPatientIdOrderByRecordedAtDesc(id);
        List<MedicalRecord> records = medicalRecordRepository.findByPatientIdOrderByCreatedAtDesc(id);

        return new PatientClinicalHistoryDTO(
                patient,
                pastIllnesses,
                allergies,
                prescriptions,
                vitals,
                records
        );
    }

    @Transactional(readOnly = true)
    public Patient getPatientByUserId(Long userId) {
        return patientRepository.findFirstByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId).orElse(null);
                    if (user != null && user.getEmail() != null) {
                        return patientRepository.findFirstByEmailIgnoreCase(user.getEmail())
                                .orElseThrow(() -> new ResourceNotFoundException("No patient profile linked to user ID: " + userId));
                    }
                    throw new ResourceNotFoundException("No patient profile linked to user ID: " + userId);
                });
    }

    @Transactional
    public Patient registerIntakePatient(Patient patient) {
        if (patient.getPatientCode() == null || patient.getPatientCode().isEmpty()) {
            patient.setPatientCode("MRN-" + (100000 + (System.currentTimeMillis() % 900000)));
        }
        return patientRepository.save(patient);
    }

    @Transactional
    public Patient createPatient(Patient patient) {
        if (patient.getPatientCode() == null || patient.getPatientCode().isEmpty()) {
            patient.setPatientCode("PAT-" + (1000 + (System.currentTimeMillis() % 9000)));
        }
        return patientRepository.save(patient);
    }

    @Transactional
    public Patient updatePatient(Long id, Patient updated) {
        Patient patient = getPatientById(id);

        if (updated.getAbhaId() != null) patient.setAbhaId(updated.getAbhaId());
        if (updated.getNationalId() != null) patient.setNationalId(updated.getNationalId());
        if (updated.getPinCode() != null) patient.setPinCode(updated.getPinCode());
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

        return patientRepository.save(patient);
    }

    @Transactional(readOnly = true)
    public Patient getPatientByUsernameOrEmail(String usernameOrEmail) {
        User user = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user record not found: " + usernameOrEmail));
        return getPatientByUserId(user.getId());
    }

    @Transactional
    public void deletePatient(Long id) {
        Patient patient = getPatientById(id);
        patientRepository.delete(patient);
    }
}

