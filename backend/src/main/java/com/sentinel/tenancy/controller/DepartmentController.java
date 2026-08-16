package com.sentinel.tenancy.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.tenancy.dto.CreateDepartmentRequest;
import com.sentinel.tenancy.dto.DepartmentResponseDTO;
import com.sentinel.tenancy.dto.UpdateDepartmentRequest;
import com.sentinel.tenancy.service.DepartmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Departments", description = "Endpoints for managing hospital departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @PostMapping("/api/v1/facilities/{facilityId}/departments")
    @Operation(summary = "Create department in a facility")
    public ResponseEntity<ApiResponse<DepartmentResponseDTO>> createDepartment(
            @PathVariable UUID facilityId,
            @Valid @RequestBody CreateDepartmentRequest request) {
        DepartmentResponseDTO response = departmentService.createDepartment(facilityId, request);
        return new ResponseEntity<>(ApiResponse.success("Department created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/facilities/{facilityId}/departments")
    @Operation(summary = "Get all departments in a facility")
    public ResponseEntity<ApiResponse<List<DepartmentResponseDTO>>> getFacilityDepartments(
            @PathVariable UUID facilityId) {
        List<DepartmentResponseDTO> response = departmentService.getFacilityDepartments(facilityId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/departments/{departmentId}")
    @Operation(summary = "Get department by ID")
    public ResponseEntity<ApiResponse<DepartmentResponseDTO>> getDepartment(
            @PathVariable UUID departmentId) {
        DepartmentResponseDTO response = departmentService.getDepartment(departmentId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/api/v1/departments/{departmentId}")
    @Operation(summary = "Update department")
    public ResponseEntity<ApiResponse<DepartmentResponseDTO>> updateDepartment(
            @PathVariable UUID departmentId,
            @Valid @RequestBody UpdateDepartmentRequest request) {
        DepartmentResponseDTO response = departmentService.updateDepartment(departmentId, request);
        return ResponseEntity.ok(ApiResponse.success("Department updated successfully", response));
    }

    @DeleteMapping("/api/v1/departments/{departmentId}")
    @Operation(summary = "Deactivate department")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(
            @PathVariable UUID departmentId) {
        departmentService.deactivateDepartment(departmentId);
        return ResponseEntity.ok(ApiResponse.success("Department deactivated successfully", null));
    }
}
