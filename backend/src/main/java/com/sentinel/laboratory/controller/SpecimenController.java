package com.sentinel.laboratory.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.laboratory.dto.CreateSpecimenRequest;
import com.sentinel.laboratory.dto.SpecimenResponseDTO;
import com.sentinel.laboratory.dto.UpdateSpecimenRequest;
import com.sentinel.laboratory.service.SpecimenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Specimens", description = "Endpoints for laboratory specimen management")
public class SpecimenController {

    private final SpecimenService specimenService;

    public SpecimenController(SpecimenService specimenService) {
        this.specimenService = specimenService;
    }

    @PostMapping("/api/v1/lab-orders/{orderId}/specimens")
    @Operation(summary = "Collect/create specimen for a lab order")
    public ResponseEntity<ApiResponse<SpecimenResponseDTO>> createSpecimen(
            @PathVariable Long orderId,
            @Valid @RequestBody CreateSpecimenRequest request) {
        SpecimenResponseDTO response = specimenService.createSpecimen(orderId, request);
        return new ResponseEntity<>(ApiResponse.success("Specimen collected successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/lab-orders/{orderId}/specimens")
    @Operation(summary = "Get specimens for a lab order")
    public ResponseEntity<ApiResponse<List<SpecimenResponseDTO>>> getOrderSpecimens(
            @PathVariable Long orderId) {
        List<SpecimenResponseDTO> response = specimenService.getOrderSpecimens(orderId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/specimens/{specimenId}")
    @Operation(summary = "Get specimen by ID")
    public ResponseEntity<ApiResponse<SpecimenResponseDTO>> getSpecimen(
            @PathVariable UUID specimenId) {
        SpecimenResponseDTO response = specimenService.getSpecimen(specimenId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/api/v1/specimens/{specimenId}")
    @Operation(summary = "Update specimen status/details")
    public ResponseEntity<ApiResponse<SpecimenResponseDTO>> updateSpecimen(
            @PathVariable UUID specimenId,
            @Valid @RequestBody UpdateSpecimenRequest request) {
        SpecimenResponseDTO response = specimenService.updateSpecimen(specimenId, request);
        return ResponseEntity.ok(ApiResponse.success("Specimen updated successfully", response));
    }
}
