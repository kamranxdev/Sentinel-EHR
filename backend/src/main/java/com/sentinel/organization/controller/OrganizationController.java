package com.sentinel.organization.controller;

import com.sentinel.organization.dto.OrganizationRegistrationDTO;
import com.sentinel.organization.dto.OrganizationResponseDTO;
import com.sentinel.organization.dto.OrganizationStatusUpdateDTO;
import com.sentinel.organization.service.OrganizationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    /**
     * Public Self-Service Registration for Healthcare Organizations & Clinics.
     * Creates a new facility in PENDING_VERIFICATION state and provisions a primary ROLE_ORG_ADMIN account.
     */
    @PostMapping("/register")
    public ResponseEntity<OrganizationResponseDTO> registerOrganization(@Valid @RequestBody OrganizationRegistrationDTO payload) {
        OrganizationResponseDTO response = organizationService.registerOrganization(payload);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Retrieves all registered clinical organizations. Restricted to System Administrators.
     */
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_SYS_ADMIN')")
    public ResponseEntity<List<OrganizationResponseDTO>> getAllOrganizations() {
        return ResponseEntity.ok(organizationService.getAllOrganizations());
    }

    /**
     * Retrieves organization details by ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN')")
    public ResponseEntity<OrganizationResponseDTO> getOrganizationById(@PathVariable Long id) {
        return ResponseEntity.ok(organizationService.getOrganizationById(id));
    }

    /**
     * Approves (VERIFIED) or Suspends (SUSPENDED) a clinic organization. Restricted to System Administrators.
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_SYS_ADMIN')")
    public ResponseEntity<OrganizationResponseDTO> updateOrganizationStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrganizationStatusUpdateDTO statusPayload,
            Authentication auth) {
        return ResponseEntity.ok(organizationService.updateOrganizationStatus(id, statusPayload, auth));
    }

    /**
     * Updates organization facility details.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN')")
    public ResponseEntity<OrganizationResponseDTO> updateOrganization(
            @PathVariable Long id,
            @RequestBody OrganizationResponseDTO payload,
            Authentication auth) {
        return ResponseEntity.ok(organizationService.updateOrganizationDetails(id, payload, auth));
    }
}
