package com.sentinel.security.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.security.dto.AbacPolicyResponseDTO;
import com.sentinel.security.dto.CreateAbacPolicyRequest;
import com.sentinel.security.dto.UpdateAbacPolicyRequest;
import com.sentinel.security.service.AbacPolicyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "ABAC Policies", description = "Endpoints for dynamic attribute-based access control rules")
public class AbacPolicyController {

    private final AbacPolicyService abacPolicyService;

    public AbacPolicyController(AbacPolicyService abacPolicyService) {
        this.abacPolicyService = abacPolicyService;
    }

    @PostMapping("/api/v1/abac-policies")
    @Operation(summary = "Create an ABAC policy")
    public ResponseEntity<ApiResponse<AbacPolicyResponseDTO>> createPolicy(
            @Valid @RequestBody CreateAbacPolicyRequest request) {
        AbacPolicyResponseDTO response = abacPolicyService.createPolicy(request);
        return new ResponseEntity<>(ApiResponse.success("ABAC policy created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/abac-policies")
    @Operation(summary = "Get all ABAC policies")
    public ResponseEntity<ApiResponse<List<AbacPolicyResponseDTO>>> getAllPolicies() {
        List<AbacPolicyResponseDTO> response = abacPolicyService.getAllPolicies();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/abac-policies/{policyId}")
    @Operation(summary = "Get ABAC policy by ID")
    public ResponseEntity<ApiResponse<AbacPolicyResponseDTO>> getPolicy(
            @PathVariable UUID policyId) {
        AbacPolicyResponseDTO response = abacPolicyService.getPolicy(policyId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/api/v1/abac-policies/{policyId}")
    @Operation(summary = "Update ABAC policy")
    public ResponseEntity<ApiResponse<AbacPolicyResponseDTO>> updatePolicy(
            @PathVariable UUID policyId,
            @Valid @RequestBody UpdateAbacPolicyRequest request) {
        AbacPolicyResponseDTO response = abacPolicyService.updatePolicy(policyId, request);
        return ResponseEntity.ok(ApiResponse.success("ABAC policy updated successfully", response));
    }
}
