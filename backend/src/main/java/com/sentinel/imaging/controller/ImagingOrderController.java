package com.sentinel.imaging.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.imaging.dto.CreateImagingOrderRequest;
import com.sentinel.imaging.dto.ImagingOrderResponseDTO;
import com.sentinel.imaging.dto.UpdateImagingOrderRequest;
import com.sentinel.imaging.service.ImagingOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Diagnostic Imaging Orders", description = "Endpoints for diagnostic imaging and radiology orders")
public class ImagingOrderController {

    private final ImagingOrderService imagingOrderService;

    public ImagingOrderController(ImagingOrderService imagingOrderService) {
        this.imagingOrderService = imagingOrderService;
    }

    @PostMapping("/api/v1/encounters/{encounterId}/imaging-orders")
    @Operation(summary = "Create an imaging order for an encounter")
    public ResponseEntity<ApiResponse<ImagingOrderResponseDTO>> createImagingOrder(
            @PathVariable UUID encounterId,
            @Valid @RequestBody CreateImagingOrderRequest request) {
        ImagingOrderResponseDTO response = imagingOrderService.createImagingOrder(encounterId, request);
        return new ResponseEntity<>(ApiResponse.success("Imaging order created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/encounters/{encounterId}/imaging-orders")
    @Operation(summary = "Get all imaging orders for an encounter")
    public ResponseEntity<ApiResponse<List<ImagingOrderResponseDTO>>> getEncounterOrders(
            @PathVariable UUID encounterId) {
        List<ImagingOrderResponseDTO> response = imagingOrderService.getEncounterOrders(encounterId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/patients/{patientId}/imaging-orders")
    @Operation(summary = "Get all imaging orders for a patient")
    public ResponseEntity<ApiResponse<List<ImagingOrderResponseDTO>>> getPatientOrders(
            @PathVariable UUID patientId) {
        List<ImagingOrderResponseDTO> response = imagingOrderService.getPatientOrders(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/imaging-orders/{orderId}")
    @Operation(summary = "Get imaging order by ID")
    public ResponseEntity<ApiResponse<ImagingOrderResponseDTO>> getImagingOrder(
            @PathVariable Long orderId) {
        ImagingOrderResponseDTO response = imagingOrderService.getImagingOrder(orderId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/api/v1/imaging-orders/{orderId}")
    @Operation(summary = "Update imaging order details or status")
    public ResponseEntity<ApiResponse<ImagingOrderResponseDTO>> updateImagingOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateImagingOrderRequest request) {
        ImagingOrderResponseDTO response = imagingOrderService.updateImagingOrder(orderId, request);
        return ResponseEntity.ok(ApiResponse.success("Imaging order updated successfully", response));
    }

    @PostMapping("/api/v1/imaging-orders/{orderId}/cancel")
    @Operation(summary = "Cancel an imaging order")
    public ResponseEntity<ApiResponse<ImagingOrderResponseDTO>> cancelImagingOrder(
            @PathVariable Long orderId) {
        ImagingOrderResponseDTO response = imagingOrderService.cancelImagingOrder(orderId);
        return ResponseEntity.ok(ApiResponse.success("Imaging order cancelled successfully", response));
    }
}
