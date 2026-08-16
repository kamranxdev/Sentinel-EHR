package com.sentinel.tenancy.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.tenancy.dto.CreateWardRequest;
import com.sentinel.tenancy.dto.UpdateWardRequest;
import com.sentinel.tenancy.dto.WardResponseDTO;
import com.sentinel.tenancy.service.WardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Wards", description = "Endpoints for managing hospital wards")
public class WardController {

    private final WardService wardService;

    public WardController(WardService wardService) {
        this.wardService = wardService;
    }

    @PostMapping("/api/v1/departments/{departmentId}/wards")
    @Operation(summary = "Create a ward in a department")
    public ResponseEntity<ApiResponse<WardResponseDTO>> createWard(
            @PathVariable UUID departmentId,
            @Valid @RequestBody CreateWardRequest request) {
        WardResponseDTO response = wardService.createWard(departmentId, request);
        return new ResponseEntity<>(ApiResponse.success("Ward created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/departments/{departmentId}/wards")
    @Operation(summary = "Get all wards in a department")
    public ResponseEntity<ApiResponse<List<WardResponseDTO>>> getDepartmentWards(
            @PathVariable UUID departmentId) {
        List<WardResponseDTO> response = wardService.getDepartmentWards(departmentId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/wards/{wardId}")
    @Operation(summary = "Get ward by ID")
    public ResponseEntity<ApiResponse<WardResponseDTO>> getWard(
            @PathVariable UUID wardId) {
        WardResponseDTO response = wardService.getWard(wardId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/api/v1/wards/{wardId}")
    @Operation(summary = "Update ward")
    public ResponseEntity<ApiResponse<WardResponseDTO>> updateWard(
            @PathVariable UUID wardId,
            @Valid @RequestBody UpdateWardRequest request) {
        WardResponseDTO response = wardService.updateWard(wardId, request);
        return ResponseEntity.ok(ApiResponse.success("Ward updated successfully", response));
    }

    @DeleteMapping("/api/v1/wards/{wardId}")
    @Operation(summary = "Deactivate ward")
    public ResponseEntity<ApiResponse<Void>> deleteWard(
            @PathVariable UUID wardId) {
        wardService.deactivateWard(wardId);
        return ResponseEntity.ok(ApiResponse.success("Ward deactivated successfully", null));
    }
}
