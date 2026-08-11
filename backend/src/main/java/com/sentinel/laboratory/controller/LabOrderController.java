package com.sentinel.laboratory.controller;

import com.sentinel.laboratory.entity.LabOrder;
import com.sentinel.laboratory.entity.LabResult;
import com.sentinel.laboratory.service.LabOrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/lab-orders")
public class LabOrderController {

    private final LabOrderService labOrderService;

    public LabOrderController(LabOrderService labOrderService) {
        this.labOrderService = labOrderService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
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
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LabOrder> getOrderById(@PathVariable Long id) {
        return labOrderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_DOCTOR', 'ROLE_SYS_ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<LabOrder> createOrder(@RequestBody Map<String, Object> body, Authentication authentication) {
        Long patientId = Long.parseLong(body.get("patientId").toString());
        Long encounterId = body.get("encounterId") != null ? Long.parseLong(body.get("encounterId").toString()) : null;
        String testName = (String) body.get("testName");
        String loincCode = (String) body.get("loincCode");
        String notes = (String) body.get("notes");
        String username = authentication != null ? authentication.getName() : "DOCTOR";

        LabOrder order = labOrderService.createOrder(patientId, encounterId, testName, loincCode, notes, username);
        return ResponseEntity.ok(order);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_TECH', 'ROLE_NURSE', 'ROLE_DOCTOR', 'ROLE_SYS_ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<LabOrder> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication authentication) {
        String status = body.get("status");
        String barcode = body.get("barcode");
        String username = authentication != null ? authentication.getName() : "LAB_TECH";

        return ResponseEntity.ok(labOrderService.updateStatus(id, status, barcode, username));
    }

    @PostMapping("/{id}/results")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_TECH', 'ROLE_SYS_ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<LabResult> addResult(@PathVariable Long id, @RequestBody LabResult result, Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "LAB_TECH";
        return ResponseEntity.ok(labOrderService.addResult(id, result, username));
    }
}
