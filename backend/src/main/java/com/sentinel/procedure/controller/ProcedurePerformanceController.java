package com.sentinel.procedure.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.procedure.dto.AddProcedureParticipantRequest;
import com.sentinel.procedure.dto.PerformProcedureRequest;
import com.sentinel.procedure.dto.ProcedureParticipantResponseDTO;
import com.sentinel.procedure.dto.ProcedurePerformanceResponseDTO;
import com.sentinel.procedure.service.ProcedurePerformanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Procedure Performances", description = "Endpoints for executing procedures and managing participants")
public class ProcedurePerformanceController {

    private final ProcedurePerformanceService procedurePerformanceService;

    public ProcedurePerformanceController(ProcedurePerformanceService procedurePerformanceService) {
        this.procedurePerformanceService = procedurePerformanceService;
    }

    @PostMapping("/api/v1/procedure-orders/{orderId}/perform")
    @Operation(summary = "Record procedure performance against an order")
    public ResponseEntity<ApiResponse<ProcedurePerformanceResponseDTO>> performProcedure(
            @PathVariable Long orderId,
            @Valid @RequestBody PerformProcedureRequest request) {
        ProcedurePerformanceResponseDTO response = procedurePerformanceService.performProcedure(orderId, request);
        return new ResponseEntity<>(ApiResponse.success("Procedure performance recorded successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/procedure-orders/{orderId}/performances")
    @Operation(summary = "Get performances for a procedure order")
    public ResponseEntity<ApiResponse<List<ProcedurePerformanceResponseDTO>>> getOrderPerformances(
            @PathVariable Long orderId) {
        List<ProcedurePerformanceResponseDTO> response = procedurePerformanceService.getOrderPerformances(orderId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/procedure-performances/{performanceId}")
    @Operation(summary = "Get procedure performance by ID")
    public ResponseEntity<ApiResponse<ProcedurePerformanceResponseDTO>> getPerformance(
            @PathVariable UUID performanceId) {
        ProcedurePerformanceResponseDTO response = procedurePerformanceService.getPerformance(performanceId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/procedure-performances/{performanceId}/participants")
    @Operation(summary = "Add a surgical/clinical participant to a procedure")
    public ResponseEntity<ApiResponse<ProcedureParticipantResponseDTO>> addParticipant(
            @PathVariable UUID performanceId,
            @Valid @RequestBody AddProcedureParticipantRequest request) {
        ProcedureParticipantResponseDTO response = procedurePerformanceService.addParticipant(performanceId, request);
        return new ResponseEntity<>(ApiResponse.success("Participant added successfully", response), HttpStatus.CREATED);
    }
}
