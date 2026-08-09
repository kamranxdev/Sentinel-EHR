package com.medvault.patients.controller;

import com.medvault.patients.dto.MPIMatchCandidateDTO;
import com.medvault.patients.dto.MPIMergeRequestDTO;
import com.medvault.patients.service.MPISearchService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping({"/api/v1/mpi", "/api/mpi", "/v1/mpi", "/mpi"})
public class MPIController {

    private final MPISearchService mpiSearchService;

    public MPIController(MPISearchService mpiSearchService) {
        this.mpiSearchService = mpiSearchService;
    }

    @GetMapping({"/search", "/search/"})
    @PreAuthorize("hasAnyAuthority('MPI_SEARCH', 'PATIENT_READ', 'ROLE_RECEPTIONIST', 'ROLE_INTAKE_SPEC', 'ROLE_ADMIN', 'ROLE_SYS_ADMIN', 'RECEPTIONIST', 'ADMIN')")
    public List<MPIMatchCandidateDTO> searchMPI(
            @RequestParam(value = "fullName", required = false) String fullName,
            @RequestParam(value = "dateOfBirth", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateOfBirth,
            @RequestParam(value = "ssn", required = false) String ssn,
            @RequestParam(value = "mrn", required = false) String mrn,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "gender", required = false) String gender,
            Authentication auth) {
        
        return mpiSearchService.searchMPI(fullName, dateOfBirth, ssn, mrn, phone, email, address, gender, auth);
    }

    @PostMapping("/merge-request")
    @PreAuthorize("hasAnyAuthority('MPI_MERGE_REQUEST', 'ROLE_RECEPTIONIST', 'ROLE_ADMIN', 'ROLE_SYS_ADMIN')")
    public ResponseEntity<String> requestChartMerge(@RequestBody MPIMergeRequestDTO mergeRequest, Authentication auth) {
        String result = mpiSearchService.requestChartMerge(mergeRequest, auth);
        return ResponseEntity.ok(result);
    }
}
