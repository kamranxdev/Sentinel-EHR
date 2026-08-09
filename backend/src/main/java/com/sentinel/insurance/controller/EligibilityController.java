package com.sentinel.insurance.controller;

import com.sentinel.insurance.dto.CopayCollectionDTO;
import com.sentinel.insurance.dto.EligibilityInquiryDTO;
import com.sentinel.insurance.dto.EligibilityResponseDTO;
import com.sentinel.insurance.service.EligibilityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/insurance", "/api/insurance"})
public class EligibilityController {

    private final EligibilityService eligibilityService;

    public EligibilityController(EligibilityService eligibilityService) {
        this.eligibilityService = eligibilityService;
    }

    @PostMapping("/rte")
    @PreAuthorize("hasAnyAuthority('ELIGIBILITY_CHECK_EXECUTE', 'INSURANCE_READ', 'ROLE_RECEPTIONIST', 'ROLE_INTAKE_SPEC', 'ROLE_ADMIN', 'ROLE_SYS_ADMIN')")
    public ResponseEntity<EligibilityResponseDTO> executeRTECheck(@RequestBody EligibilityInquiryDTO inquiry, Authentication auth) {
        EligibilityResponseDTO response = eligibilityService.executeRTECheck(inquiry, auth);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/copay/collect")
    @PreAuthorize("hasAnyAuthority('BILLING_COPAY_COLLECT', 'INVOICE_CREATE', 'ROLE_RECEPTIONIST', 'ROLE_BILLING', 'ROLE_ADMIN', 'ROLE_SYS_ADMIN')")
    public ResponseEntity<CopayCollectionDTO> collectCopay(@RequestBody CopayCollectionDTO collection, Authentication auth) {
        CopayCollectionDTO result = eligibilityService.collectCopay(collection, auth);
        return ResponseEntity.ok(result);
    }
}
