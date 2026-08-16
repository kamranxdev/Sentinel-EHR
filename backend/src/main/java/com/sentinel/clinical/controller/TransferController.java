package com.sentinel.clinical.controller;

import com.sentinel.clinical.dto.TransferPatientRequest;
import com.sentinel.clinical.dto.TransferResponseDTO;
import com.sentinel.clinical.service.TransferService;
import com.sentinel.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Transfers", description = "Endpoints for inpatient ward/bed transfers")
public class TransferController {

    private final TransferService transferService;

    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    @PostMapping("/api/v1/encounters/{encounterId}/transfer")
    @Operation(summary = "Transfer patient to a new department, ward, or bed")
    public ResponseEntity<ApiResponse<TransferResponseDTO>> transferPatient(
            @PathVariable UUID encounterId,
            @Valid @RequestBody TransferPatientRequest request) {
        TransferResponseDTO response = transferService.transferPatient(encounterId, request);
        return new ResponseEntity<>(ApiResponse.success("Patient transferred successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/encounters/{encounterId}/transfers")
    @Operation(summary = "Get all transfers for an encounter")
    public ResponseEntity<ApiResponse<List<TransferResponseDTO>>> getTransfers(
            @PathVariable UUID encounterId) {
        List<TransferResponseDTO> response = transferService.getTransfers(encounterId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
