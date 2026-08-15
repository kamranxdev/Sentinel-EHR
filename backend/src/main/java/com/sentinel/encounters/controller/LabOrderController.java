package com.sentinel.encounters.controller;

import com.sentinel.encounters.dto.LabOrderRequestDTO;
import com.sentinel.encounters.dto.LabOrderStatusUpdateDTO;
import com.sentinel.encounters.entity.LabOrder;
import com.sentinel.vitals.entity.LabResult;
import com.sentinel.encounters.service.LabOrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lab-orders")
public class LabOrderController {

    private final LabOrderService labOrderService;

    public LabOrderController(LabOrderService labOrderService) {
        this.labOrderService = labOrderService;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('LAB_RESULT_READ', 'ROLE_LAB_TECH', 'ROLE_NURSE', 'ROLE_DOCTOR', 'ROLE_SYS_ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<List<LabOrder>> getAllOrders(@RequestParam(required = false) Long patientId, @RequestParam(required = false) Long encounterId) {
        if (patientId != null) {
            return ResponseEntity.ok(labOrderService.getOrdersByPatient(patientId));
        }
        if (encounterId != null) {
            return ResponseEntity.ok(labOrderService.getOrdersByEncounter(encounterId));
        }
        return ResponseEntity.ok(labOrderService.getAllOrders());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('LAB_RESULT_READ', 'ROLE_LAB_TECH', 'ROLE_NURSE', 'ROLE_DOCTOR', 'ROLE_SYS_ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<LabOrder> getOrderById(@PathVariable Long id) {
        return labOrderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_DOCTOR', 'ROLE_SYS_ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<LabOrder> createOrder(@Valid @RequestBody LabOrderRequestDTO request, Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "DOCTOR";
        LabOrder order = labOrderService.createOrder(
                request.getPatientId(),
                request.getEncounterId(),
                request.getTestName(),
                request.getLoincCode(),
                request.getNotes(),
                username
        );
        return ResponseEntity.ok(order);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_TECH', 'ROLE_NURSE', 'ROLE_DOCTOR', 'ROLE_SYS_ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<LabOrder> updateStatus(@PathVariable Long id, @Valid @RequestBody LabOrderStatusUpdateDTO request, Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "LAB_TECH";
        return ResponseEntity.ok(labOrderService.updateStatus(id, request.getStatus(), request.getBarcode(), username));
    }

    @PostMapping("/{id}/results")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_TECH', 'ROLE_SYS_ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<LabResult> addResult(@PathVariable Long id, @RequestBody LabResult result, Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "LAB_TECH";
        return ResponseEntity.ok(labOrderService.addResult(id, result, username));
    }
}
