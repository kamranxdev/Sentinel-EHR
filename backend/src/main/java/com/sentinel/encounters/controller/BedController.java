package com.sentinel.encounters.controller;

import com.sentinel.encounters.entity.Bed;
import com.sentinel.encounters.entity.LocationHistory;
import com.sentinel.encounters.service.BedManagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/beds", "/api/beds"})
public class BedController {

    private final BedManagementService bedManagementService;

    public BedController(BedManagementService bedManagementService) {
        this.bedManagementService = bedManagementService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Bed>> getAllBeds(@RequestParam(required = false) String department) {
        if (department != null && !department.trim().isEmpty()) {
            return ResponseEntity.ok(bedManagementService.getBedsByDepartment(department));
        }
        return ResponseEntity.ok(bedManagementService.getAllBeds());
    }

    @GetMapping("/available")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Bed>> getAvailableBeds(@RequestParam(required = false) String department) {
        return ResponseEntity.ok(bedManagementService.getAvailableBeds(department));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Bed> getBedById(@PathVariable Long id) {
        return bedManagementService.getBedById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<Bed> createBed(@RequestBody Bed bed) {
        return ResponseEntity.ok(bedManagementService.createBed(bed));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_ADMIN', 'ROLE_NURSE')")
    public ResponseEntity<Bed> updateBedStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(bedManagementService.updateBedStatus(id, status));
    }

    @PostMapping("/transfer")
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_NURSE')")
    public ResponseEntity<LocationHistory> executeBedTransfer(@RequestBody Map<String, Object> body, Authentication authentication) {
        Long encounterId = Long.parseLong(body.get("encounterId").toString());
        Long newBedId = Long.parseLong(body.get("newBedId").toString());
        String transferReason = (String) body.getOrDefault("transferReason", "Clinical unit transfer");
        String username = authentication != null ? authentication.getName() : "SYSTEM";

        LocationHistory history = bedManagementService.executeBedTransfer(encounterId, newBedId, transferReason, username);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/encounters/{encounterId}/location-history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LocationHistory>> getLocationHistory(@PathVariable Long encounterId) {
        return ResponseEntity.ok(bedManagementService.getLocationHistory(encounterId));
    }
}
