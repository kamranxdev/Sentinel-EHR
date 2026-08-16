package com.sentinel.pharmacy.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.clinical.repository.EncounterRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.repository.UserRepository;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.pharmacy.dto.AdministerMedicationRequest;
import com.sentinel.pharmacy.dto.MedicationAdministrationResponseDTO;
import com.sentinel.pharmacy.entity.MedicationAdministration;
import com.sentinel.pharmacy.entity.Prescription;
import com.sentinel.pharmacy.repository.MedicationAdministrationRepository;
import com.sentinel.pharmacy.repository.PrescriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class MedicationAdministrationService {

    private final MedicationAdministrationRepository administrationRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final EncounterRepository encounterRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public MedicationAdministrationService(MedicationAdministrationRepository administrationRepository,
                                           PrescriptionRepository prescriptionRepository,
                                           EncounterRepository encounterRepository,
                                           PatientRepository patientRepository,
                                           UserRepository userRepository,
                                           AuditService auditService) {
        this.administrationRepository = administrationRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.encounterRepository = encounterRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    public MedicationAdministrationResponseDTO administerMedication(UUID prescriptionId, AdministerMedicationRequest request) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id: " + prescriptionId));

        MedicationAdministration admin = new MedicationAdministration();
        admin.setPrescription(prescription);
        admin.setPatient(prescription.getPatient());
        admin.setMedicationName(request.getMedicationName() != null ? request.getMedicationName() : prescription.getMedicationName());
        admin.setDose(request.getDose() != null ? request.getDose() : prescription.getDosage());
        admin.setRoute(request.getRoute() != null ? request.getRoute() : prescription.getRoute());
        admin.setStatus("COMPLETED");
        admin.setAdministeredAt(request.getAdministeredAt() != null ? request.getAdministeredAt() : OffsetDateTime.now());

        if (prescription.getDoctor() != null) {
            admin.setAdministeredBy(prescription.getDoctor());
        } else {
            List<User> users = userRepository.findAll();
            if (!users.isEmpty()) admin.setAdministeredBy(users.get(0));
        }

        MedicationAdministration saved = administrationRepository.save(admin);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "EMAR_ADMINISTRATION", "Administered " + saved.getMedicationName() + " to patient " + prescription.getPatient().getId());
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<MedicationAdministrationResponseDTO> getEncounterAdministrations(UUID encounterId) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));
        return administrationRepository.findByPatientIdOrderByAdministeredAtDesc(encounter.getPatient().getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MedicationAdministrationResponseDTO> getPatientAdministrations(UUID patientId) {
        return administrationRepository.findByPatientIdOrderByAdministeredAtDesc(patientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public MedicationAdministrationResponseDTO mapToDTO(MedicationAdministration a) {
        MedicationAdministrationResponseDTO dto = new MedicationAdministrationResponseDTO();
        dto.setId(a.getId());
        if (a.getPatient() != null) dto.setPatientId(a.getPatient().getId());
        if (a.getPrescription() != null) dto.setPrescriptionId(a.getPrescription().getId());
        dto.setMedicationName(a.getMedicationName());
        dto.setDose(a.getDose());
        dto.setRoute(a.getRoute());
        dto.setStatus(a.getStatus());
        if (a.getAdministeredBy() != null) dto.setAdministeredByUsername(a.getAdministeredBy().getUsername());
        dto.setAdministeredAt(a.getAdministeredAt());
        return dto;
    }
}
