package com.sentinel.laboratory.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.laboratory.dto.CreateLabOrderRequest;
import com.sentinel.laboratory.dto.LabOrderResponseDTO;
import com.sentinel.laboratory.dto.UpdateLabOrderRequest;
import com.sentinel.laboratory.service.LabOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Laboratory Orders", description = "Endpoints for laboratory orders management")
public class LabOrderController {

    private final LabOrderService labOrderService;

    public LabOrderController(LabOrderService labOrderService) {
        this.labOrderService = labOrderService;
    }

    @PostMapping("/api/v1/encounters/{encounterId}/lab-orders")
    @Operation(summary = "Create a lab order for an encounter")
    public ResponseEntity<ApiResponse<LabOrderResponseDTO>> createLabOrder(
            @PathVariable UUID encounterId,
            @Valid @RequestBody CreateLabOrderRequest request) {
        LabOrderResponseDTO response = labOrderService.createLabOrder(encounterId, request);
        return new ResponseEntity<>(ApiResponse.success("Lab order created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/lab-orders")
    @Operation(summary = "Get all lab orders with optional status and search filtering")
    public ResponseEntity<ApiResponse<List<LabOrderResponseDTO>>> getAllLabOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        List<LabOrderResponseDTO> response = labOrderService.getAllLabOrders(status, search);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/encounters/{encounterId}/lab-orders")
    @Operation(summary = "Get all lab orders for an encounter")
    public ResponseEntity<ApiResponse<List<LabOrderResponseDTO>>> getEncounterOrders(
            @PathVariable UUID encounterId) {
        List<LabOrderResponseDTO> response = labOrderService.getEncounterOrders(encounterId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/patients/{patientId}/lab-orders")
    @Operation(summary = "Get all lab orders for a patient")
    public ResponseEntity<ApiResponse<List<LabOrderResponseDTO>>> getPatientOrders(
            @PathVariable UUID patientId) {
        List<LabOrderResponseDTO> response = labOrderService.getPatientOrders(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/lab-orders/{orderId}")
    @Operation(summary = "Get lab order by ID")
    public ResponseEntity<ApiResponse<LabOrderResponseDTO>> getLabOrder(
            @PathVariable Long orderId) {
        LabOrderResponseDTO response = labOrderService.getLabOrder(orderId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/api/v1/lab-orders/{orderId}")
    @Operation(summary = "Update lab order details or status")
    public ResponseEntity<ApiResponse<LabOrderResponseDTO>> updateLabOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateLabOrderRequest request) {
        LabOrderResponseDTO response = labOrderService.updateLabOrder(orderId, request);
        return ResponseEntity.ok(ApiResponse.success("Lab order updated successfully", response));
    }

    @PostMapping("/api/v1/lab-orders/{orderId}/cancel")
    @Operation(summary = "Cancel a lab order")
    public ResponseEntity<ApiResponse<LabOrderResponseDTO>> cancelLabOrder(
            @PathVariable Long orderId) {
        LabOrderResponseDTO response = labOrderService.cancelLabOrder(orderId);
        return ResponseEntity.ok(ApiResponse.success("Lab order cancelled successfully", response));
    }
}
