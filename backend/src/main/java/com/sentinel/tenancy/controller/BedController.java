package com.sentinel.tenancy.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.tenancy.dto.AssignBedRequest;
import com.sentinel.tenancy.dto.BedResponseDTO;
import com.sentinel.tenancy.dto.CreateBedRequest;
import com.sentinel.tenancy.dto.UpdateBedRequest;
import com.sentinel.tenancy.service.BedService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Beds", description = "Endpoints for managing beds in rooms")
public class BedController {

    private final BedService bedService;

    public BedController(BedService bedService) {
        this.bedService = bedService;
    }

    @PostMapping("/api/v1/rooms/{roomId}/beds")
    @Operation(summary = "Create a bed in a room")
    public ResponseEntity<ApiResponse<BedResponseDTO>> createBed(
            @PathVariable UUID roomId,
            @Valid @RequestBody CreateBedRequest request) {
        BedResponseDTO response = bedService.createBed(roomId, request);
        return new ResponseEntity<>(ApiResponse.success("Bed created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/rooms/{roomId}/beds")
    @Operation(summary = "Get all beds in a room")
    public ResponseEntity<ApiResponse<List<BedResponseDTO>>> getRoomBeds(
            @PathVariable UUID roomId) {
        List<BedResponseDTO> response = bedService.getRoomBeds(roomId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/beds/{bedId}")
    @Operation(summary = "Get bed by ID")
    public ResponseEntity<ApiResponse<BedResponseDTO>> getBed(
            @PathVariable UUID bedId) {
        BedResponseDTO response = bedService.getBed(bedId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/api/v1/beds/{bedId}")
    @Operation(summary = "Update bed details")
    public ResponseEntity<ApiResponse<BedResponseDTO>> updateBed(
            @PathVariable UUID bedId,
            @Valid @RequestBody UpdateBedRequest request) {
        BedResponseDTO response = bedService.updateBed(bedId, request);
        return ResponseEntity.ok(ApiResponse.success("Bed updated successfully", response));
    }

    @PostMapping("/api/v1/beds/{bedId}/assign")
    @Operation(summary = "Assign a bed to an encounter")
    public ResponseEntity<ApiResponse<BedResponseDTO>> assignBed(
            @PathVariable UUID bedId,
            @RequestBody(required = false) AssignBedRequest request) {
        UUID encounterId = request != null ? request.getEncounterId() : null;
        BedResponseDTO response = bedService.assignBed(bedId, encounterId);
        return ResponseEntity.ok(ApiResponse.success("Bed assigned successfully", response));
    }

    @PostMapping("/api/v1/beds/{bedId}/release")
    @Operation(summary = "Release a bed")
    public ResponseEntity<ApiResponse<BedResponseDTO>> releaseBed(
            @PathVariable UUID bedId) {
        BedResponseDTO response = bedService.releaseBed(bedId);
        return ResponseEntity.ok(ApiResponse.success("Bed released successfully", response));
    }

    @GetMapping("/api/v1/beds/available")
    @Operation(summary = "Find available beds")
    public ResponseEntity<ApiResponse<List<BedResponseDTO>>> findAvailableBeds(
            @RequestParam(required = false) UUID organizationId,
            @RequestParam(required = false) UUID wardId) {
        List<BedResponseDTO> response = bedService.findAvailableBeds(organizationId, wardId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
