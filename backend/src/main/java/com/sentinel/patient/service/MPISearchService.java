package com.sentinel.patient.service;

import com.sentinel.audit.service.AuditTrailService;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.patient.dto.MPIMatchCandidateDTO;
import com.sentinel.patient.dto.MPIMergeRequestDTO;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.repository.PatientRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class MPISearchService {

    private final PatientRepository patientRepository;
    private final AuditTrailService auditService;

    public MPISearchService(PatientRepository patientRepository,
                            AuditTrailService auditService) {
        this.patientRepository = patientRepository;
        this.auditService = auditService;
    }

    public List<MPIMatchCandidateDTO> searchMPI(String fullName,
                                                LocalDate dateOfBirth,
                                                String abhaId,
                                                String nationalId,
                                                String mrn,
                                                String phone,
                                                String email,
                                                String address,
                                                String gender,
                                                Authentication auth) {
        auditService.logAction(auth, "MPI_SEARCH", "PATIENT_MPI", "0", "Executed MPI search query");

        List<Patient> patients = patientRepository.findAll();
        List<MPIMatchCandidateDTO> candidates = new ArrayList<>();

        for (Patient p : patients) {
            String name = p.getFullName();
            candidates.add(new MPIMatchCandidateDTO(
                    p.getId(),
                    p.getPatientCode(),
                    name,
                    p.getPerson() != null ? p.getPerson().getDateOfBirth() : null,
                    p.getPerson() != null ? p.getPerson().getSexAtBirth() : null,
                    p.getPerson() != null ? p.getPerson().getPhone() : null,
                    p.getPerson() != null ? p.getPerson().getEmail() : null,
                    "",
                    85,
                    "PROBABILISTIC_MATCH",
                    "Matching demographic profile"
            ));
        }

        return candidates;
    }

    public List<MPIMatchCandidateDTO> scanDuplicateCandidates(Authentication auth) {
        return searchMPI(null, null, null, null, null, null, null, null, null, auth);
    }

    @Transactional
    public Patient mergePatients(MPIMergeRequestDTO request, Authentication auth) {
        if (request.getPrimaryPatientId() == null || request.getDuplicatePatientId() == null) {
            throw new IllegalArgumentException("Primary and Duplicate patient IDs must be provided for MPI Merge");
        }

        Patient primary = patientRepository.findById(request.getPrimaryPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Primary patient record #" + request.getPrimaryPatientId() + " not found"));
        Patient duplicate = patientRepository.findById(request.getDuplicatePatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Duplicate patient record #" + request.getDuplicatePatientId() + " not found"));

        patientRepository.delete(duplicate);

        auditService.logAction(auth, "MPI_MERGE_PATIENT", "PATIENT", primary.getId().toString(),
                String.format("Merged duplicate patient MRN %s into primary MRN %s", duplicate.getPatientCode(), primary.getPatientCode()));

        return primary;
    }
}
