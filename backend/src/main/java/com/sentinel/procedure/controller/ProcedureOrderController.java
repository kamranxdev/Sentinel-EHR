package com.sentinel.procedure.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.procedure.dto.CreateProcedureOrderRequest;
import com.sentinel.procedure.dto.ProcedureOrderResponseDTO;
import com.sentinel.procedure.dto.UpdateProcedureOrderRequest;
import com.sentinel.procedure.service.ProcedureOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Procedure Orders", description = "Endpoints for scheduling and ordering surgical and clinical procedures")
public class ProcedureOrderController {

    private final ProcedureOrderService procedureOrderService;

    public ProcedureOrderController(ProcedureOrderService procedureOrderService) {
        this.procedureOrderService = procedureOrderService;
    }

    @PostMapping("/api/v1/encounters/{encounterId}/procedure-orders")
    @Operation(summary = "Create a procedure order for an encounter")
    public ResponseEntity<ApiResponse<ProcedureOrderResponseDTO>> createProcedureOrder(
            @PathVariable UUID encounterId,
            @Valid @RequestBody CreateProcedureOrderRequest request) {
        ProcedureOrderResponseDTO response = procedureOrderService.createProcedureOrder(encounterId, request);
        return new ResponseEntity<>(ApiResponse.success("Procedure order created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/encounters/{encounterId}/procedure-orders")
    @Operation(summary = "Get all procedure orders for an encounter")
    public ResponseEntity<ApiResponse<List<ProcedureOrderResponseDTO>>> getEncounterOrders(
            @PathVariable UUID encounterId) {
        List<ProcedureOrderResponseDTO> response = procedureOrderService.getEncounterOrders(encounterId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/patients/{patientId}/procedure-orders")
    @Operation(summary = "Get all procedure orders for a patient")
    public ResponseEntity<ApiResponse<List<ProcedureOrderResponseDTO>>> getPatientOrders(
            @PathVariable UUID patientId) {
        List<ProcedureOrderResponseDTO> response = procedureOrderService.getPatientOrders(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/procedure-orders/{orderId}")
    @Operation(summary = "Get procedure order by ID")
    public ResponseEntity<ApiResponse<ProcedureOrderResponseDTO>> getProcedureOrder(
            @PathVariable Long orderId) {
        ProcedureOrderResponseDTO response = procedureOrderService.getProcedureOrder(orderId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/api/v1/procedure-orders/{orderId}")
    @Operation(summary = "Update procedure order details or status")
    public ResponseEntity<ApiResponse<ProcedureOrderResponseDTO>> updateProcedureOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateProcedureOrderRequest request) {
        ProcedureOrderResponseDTO response = procedureOrderService.updateProcedureOrder(orderId, request);
        return ResponseEntity.ok(ApiResponse.success("Procedure order updated successfully", response));
    }
}
