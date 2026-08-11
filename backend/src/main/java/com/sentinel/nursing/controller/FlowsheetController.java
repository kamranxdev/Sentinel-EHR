package com.sentinel.nursing.controller;

import com.sentinel.nursing.entity.FlowsheetEntry;
import com.sentinel.nursing.service.FlowsheetService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/flowsheets")
public class FlowsheetController {

    private final FlowsheetService flowsheetService;

    public FlowsheetController(FlowsheetService flowsheetService) {
        this.flowsheetService = flowsheetService;
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<FlowsheetEntry>> getEntriesByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(flowsheetService.getEntriesByPatient(patientId));
    }

    @GetMapping("/encounter/{encounterId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<FlowsheetEntry>> getEntriesByEncounter(@PathVariable Long encounterId) {
        return ResponseEntity.ok(flowsheetService.getEntriesByEncounter(encounterId));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_NURSE', 'ROLE_DOCTOR', 'ROLE_SYS_ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<FlowsheetEntry> createEntry(@RequestParam Long patientId, @RequestParam(required = false) Long encounterId, @RequestBody FlowsheetEntry entry, Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "NURSE";
        return ResponseEntity.ok(flowsheetService.createEntry(patientId, encounterId, entry, username));
    }
}
