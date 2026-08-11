package com.sentinel.clinicalrecords.controller;

import com.sentinel.clinicalrecords.entity.ProcedureOrder;
import com.sentinel.clinicalrecords.service.ProcedureOrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/procedure-orders")
public class ProcedureOrderController {

    private final ProcedureOrderService procedureOrderService;

    public ProcedureOrderController(ProcedureOrderService procedureOrderService) {
        this.procedureOrderService = procedureOrderService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ProcedureOrder>> getAllOrders(@RequestParam(required = false) Long patientId, @RequestParam(required = false) Long encounterId) {
        if (patientId != null) {
            return ResponseEntity.ok(procedureOrderService.getOrdersByPatient(patientId));
        }
        if (encounterId != null) {
            return ResponseEntity.ok(procedureOrderService.getOrdersByEncounter(encounterId));
        }
        return ResponseEntity.ok(procedureOrderService.getAllOrders());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProcedureOrder> getOrderById(@PathVariable Long id) {
        return procedureOrderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_DOCTOR', 'ROLE_SYS_ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<ProcedureOrder> createOrder(@RequestBody Map<String, Object> body, Authentication authentication) {
        Long patientId = Long.parseLong(body.get("patientId").toString());
        Long encounterId = body.get("encounterId") != null ? Long.parseLong(body.get("encounterId").toString()) : null;
        String procedureName = (String) body.get("procedureName");
        String snomedCode = (String) body.get("snomedCode");
        String username = authentication != null ? authentication.getName() : "DOCTOR";

        ProcedureOrder order = procedureOrderService.createOrder(patientId, encounterId, procedureName, snomedCode, username);
        return ResponseEntity.ok(order);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_DOCTOR', 'ROLE_SYS_ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<ProcedureOrder> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication authentication) {
        String status = body.get("status");
        String operativeReport = body.get("operativeReport");
        String username = authentication != null ? authentication.getName() : "DOCTOR";

        return ResponseEntity.ok(procedureOrderService.updateStatus(id, status, operativeReport, username));
    }
}
