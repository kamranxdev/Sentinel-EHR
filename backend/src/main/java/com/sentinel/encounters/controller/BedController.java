package com.sentinel.encounters.controller;

import com.sentinel.encounters.dto.BedRequestDTO;
import com.sentinel.encounters.dto.BedStatusUpdateDTO;
import com.sentinel.encounters.entity.Bed;
import com.sentinel.encounters.entity.LocationHistory;
import com.sentinel.encounters.service.BedManagementService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/beds")
public class BedController {

    private final BedManagementService bedManagementService;

    public BedController(BedManagementService bedManagementService) {
        this.bedManagementService = bedManagementService;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_NURSE')")
    public ResponseEntity<List<Bed>> getAllBeds(@RequestParam(required = false) String department) {
        if (department != null && !department.trim().isEmpty()) {
            return ResponseEntity.ok(bedManagementService.getBedsByDepartment(department));
        }
        return ResponseEntity.ok(bedManagementService.getAllBeds());
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_RECEPTIONIST')")
    public ResponseEntity<List<Bed>> getAvailableBeds(@RequestParam(required = false) String department) {
        return ResponseEntity.ok(bedManagementService.getAvailableBeds(department));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_NURSE')")
    public ResponseEntity<Bed> getBedById(@PathVariable Long id) {
        return bedManagementService.getBedById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<Bed> createBed(@Valid @RequestBody BedRequestDTO request) {
        Bed bed = new Bed();
        bed.setBedNumber(request.getBedNumber());
        bed.setBedCode(request.getWard() != null ? request.getWard() + "-" + request.getBedNumber() : request.getBedNumber());
        if (request.getWard() != null) bed.setWardName(request.getWard());
        if (request.getDepartment() != null) bed.setDepartmentName(request.getDepartment());
        if (request.getRoomNumber() != null) bed.setRoomNumber(request.getRoomNumber());
        if (request.getBedType() != null) bed.setFeatures(request.getBedType());

        return ResponseEntity.ok(bedManagementService.createBed(bed));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_ADMIN', 'ROLE_NURSE')")
    public ResponseEntity<Bed> updateBedStatus(@PathVariable Long id, @Valid @RequestBody BedStatusUpdateDTO body) {
        return ResponseEntity.ok(bedManagementService.updateBedStatus(id, body.getStatus()));
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
    @PreAuthorize("hasAnyAuthority('ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_NURSE')")
    public ResponseEntity<List<LocationHistory>> getLocationHistory(@PathVariable Long encounterId) {
        return ResponseEntity.ok(bedManagementService.getLocationHistory(encounterId));
    }
}
