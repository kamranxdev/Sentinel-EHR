package com.sentinel.laboratory.controller;

import com.sentinel.laboratory.entity.ImagingOrder;
import com.sentinel.laboratory.service.ImagingOrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/imaging-orders")
public class ImagingOrderController {

    private final ImagingOrderService imagingOrderService;

    public ImagingOrderController(ImagingOrderService imagingOrderService) {
        this.imagingOrderService = imagingOrderService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ImagingOrder>> getAllOrders(@RequestParam(required = false) Long patientId, @RequestParam(required = false) Long encounterId) {
        if (patientId != null) {
            return ResponseEntity.ok(imagingOrderService.getOrdersByPatient(patientId));
        }
        if (encounterId != null) {
            return ResponseEntity.ok(imagingOrderService.getOrdersByEncounter(encounterId));
        }
        return ResponseEntity.ok(imagingOrderService.getAllOrders());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ImagingOrder> getOrderById(@PathVariable Long id) {
        return imagingOrderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_DOCTOR', 'ROLE_SYS_ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<ImagingOrder> createOrder(@RequestBody Map<String, Object> body, Authentication authentication) {
        Long patientId = Long.parseLong(body.get("patientId").toString());
        Long encounterId = body.get("encounterId") != null ? Long.parseLong(body.get("encounterId").toString()) : null;
        String modality = (String) body.get("modality");
        String procedureName = (String) body.get("procedureName");
        String cptCode = (String) body.get("cptCode");
        String username = authentication != null ? authentication.getName() : "DOCTOR";

        ImagingOrder order = imagingOrderService.createOrder(patientId, encounterId, modality, procedureName, cptCode, username);
        return ResponseEntity.ok(order);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_TECH', 'ROLE_DOCTOR', 'ROLE_SYS_ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<ImagingOrder> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication authentication) {
        String status = body.get("status");
        String report = body.get("radiologistReport");
        String dicomUid = body.get("dicomStudyInstanceUid");
        String username = authentication != null ? authentication.getName() : "RADIOLOGIST";

        return ResponseEntity.ok(imagingOrderService.updateStatus(id, status, report, dicomUid, username));
    }
}
