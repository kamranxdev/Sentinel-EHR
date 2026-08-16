package com.sentinel.patient.controller;

import com.sentinel.patient.dto.CopayCollectionDTO;
import com.sentinel.patient.dto.EligibilityInquiryDTO;
import com.sentinel.patient.dto.EligibilityResponseDTO;
import com.sentinel.patient.service.EligibilityService;
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
    @PreAuthorize("hasAnyAuthority('PATIENT_READ', 'RECEPTIONIST', 'BILLING_STAFF', 'SUPER_ADMIN')")
    public ResponseEntity<EligibilityResponseDTO> checkEligibility(@Valid @RequestBody EligibilityInquiryDTO inquiry, Authentication auth) {
        return ResponseEntity.ok(eligibilityService.executeRTECheck(inquiry, auth));
    }

    @PostMapping("/collect-copay")
    @PreAuthorize("hasAnyAuthority('APPOINTMENT_UPDATE', 'RECEPTIONIST', 'BILLING_STAFF', 'SUPER_ADMIN')")
    public ResponseEntity<CopayCollectionDTO> collectCopay(@Valid @RequestBody CopayCollectionDTO collectionRequest, Authentication auth) {
        return ResponseEntity.ok(eligibilityService.recordCopayCollection(collectionRequest, auth));
    }
}
