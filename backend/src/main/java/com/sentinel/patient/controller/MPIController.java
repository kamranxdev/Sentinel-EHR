package com.sentinel.patient.controller;

import com.sentinel.patient.dto.MPIMatchCandidateDTO;
import com.sentinel.patient.dto.MPIMergeRequestDTO;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.service.MPISearchService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/patients/mpi")
public class MPIController {

    private final MPISearchService mpiSearchService;

    public MPIController(MPISearchService mpiSearchService) {
        this.mpiSearchService = mpiSearchService;
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyAuthority('MPI_SEARCH', 'PATIENT_READ', 'RECEPTIONIST', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    public List<MPIMatchCandidateDTO> searchMPI(
            @RequestParam(value = "fullName", required = false) String fullName,
            @RequestParam(value = "dateOfBirth", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateOfBirth,
            @RequestParam(value = "abhaId", required = false) String abhaId,
            @RequestParam(value = "nationalId", required = false) String nationalId,
            @RequestParam(value = "mrn", required = false) String mrn,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "gender", required = false) String gender,
            Authentication auth) {
        return mpiSearchService.searchMPI(fullName, dateOfBirth, abhaId, nationalId, mrn, phone, email, address, gender, auth);
    }

    @GetMapping("/duplicates")
    @PreAuthorize("hasAnyAuthority('MPI_SEARCH', 'PATIENT_READ', 'RECEPTIONIST', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    public List<MPIMatchCandidateDTO> scanDuplicateCandidates(Authentication auth) {
        return mpiSearchService.scanDuplicateCandidates(auth);
    }

    @PostMapping("/merge-requests")
    @PreAuthorize("hasAnyAuthority('MPI_MERGE_REQUEST', 'RECEPTIONIST', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    public ResponseEntity<Patient> mergePatients(@Valid @RequestBody MPIMergeRequestDTO mergeRequest, Authentication auth) {
        Patient primary = mpiSearchService.mergePatients(mergeRequest, auth);
        return ResponseEntity.ok(primary);
    }
}
