package com.sentinel.authorization.controller;

import com.sentinel.authorization.dto.BreakGlassRequestDTO;
import com.sentinel.authorization.entity.BreakGlassRecord;
import com.sentinel.authorization.service.BreakGlassService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/break-glass")
public class BreakGlassController {

    private final BreakGlassService breakGlassService;

    public BreakGlassController(BreakGlassService breakGlassService) {
        this.breakGlassService = breakGlassService;
    }

    @PostMapping("/request")
    @PreAuthorize("hasAnyAuthority('ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_SYS_ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<BreakGlassRecord> requestEmergencyAccess(
            @Valid @RequestBody BreakGlassRequestDTO payload,
            Authentication authentication,
            HttpServletRequest request) {
        String username = authentication != null ? authentication.getName() : "DOCTOR";
        String clientIp = request.getRemoteAddr();

        BreakGlassRecord record = breakGlassService.requestEmergencyAccess(
                payload.getPatientId(),
                username,
                payload.getCategory(),
                payload.getJustification(),
                clientIp
        );
        return ResponseEntity.ok(record);
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_ADMIN', 'ROLE_AUDITOR', 'ROLE_DOCTOR')")
    public ResponseEntity<List<BreakGlassRecord>> getRecordsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(breakGlassService.getRecordsByPatient(patientId));
    }

    @GetMapping("/user/{username}")
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_ADMIN', 'ROLE_AUDITOR')")
    public ResponseEntity<List<BreakGlassRecord>> getRecordsByUser(@PathVariable String username) {
        return ResponseEntity.ok(breakGlassService.getRecordsByUser(username));
    }
}
