package com.sentinel.patients.controller;

import com.sentinel.patients.dto.CopayCollectionDTO;
import com.sentinel.patients.dto.EligibilityInquiryDTO;
import com.sentinel.patients.dto.EligibilityResponseDTO;
import com.sentinel.patients.service.EligibilityService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/insurance")
public class EligibilityController {

    private final EligibilityService eligibilityService;

    public EligibilityController(EligibilityService eligibilityService) {
        this.eligibilityService = eligibilityService;
    }

    @PostMapping("/verify-eligibility")
    @PreAuthorize("hasAnyAuthority('PATIENT_READ', 'ROLE_RECEPTIONIST', 'ROLE_BILLING', 'ROLE_SYS_ADMIN')")
    public ResponseEntity<EligibilityResponseDTO> checkEligibility(@Valid @RequestBody EligibilityInquiryDTO inquiry, Authentication auth) {
        return ResponseEntity.ok(eligibilityService.executeRTECheck(inquiry, auth));
    }

    @PostMapping("/collect-copay")
    @PreAuthorize("hasAnyAuthority('APPOINTMENT_UPDATE', 'ROLE_RECEPTIONIST', 'ROLE_BILLING', 'ROLE_SYS_ADMIN')")
    public ResponseEntity<CopayCollectionDTO> collectCopay(@Valid @RequestBody CopayCollectionDTO collectionRequest, Authentication auth) {
        return ResponseEntity.ok(eligibilityService.collectCopay(collectionRequest, auth));
    }
}
