package com.sentinel.consent.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.consent.dto.ConsentTypeResponseDTO;
import com.sentinel.consent.dto.CreateConsentTypeRequest;
import com.sentinel.consent.service.ConsentTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "Consent Types", description = "Endpoints for defining consent templates and policy categories")
public class ConsentTypeController {

    private final ConsentTypeService consentTypeService;

    public ConsentTypeController(ConsentTypeService consentTypeService) {
        this.consentTypeService = consentTypeService;
    }

    @PostMapping("/api/v1/consent-types")
    @Operation(summary = "Define a new consent type")
    public ResponseEntity<ApiResponse<ConsentTypeResponseDTO>> createConsentType(
            @Valid @RequestBody CreateConsentTypeRequest request) {
        ConsentTypeResponseDTO response = consentTypeService.createConsentType(request);
        return new ResponseEntity<>(ApiResponse.success("Consent type created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/consent-types")
    @Operation(summary = "Get all active consent types")
    public ResponseEntity<ApiResponse<List<ConsentTypeResponseDTO>>> getAllConsentTypes() {
        List<ConsentTypeResponseDTO> response = consentTypeService.getAllConsentTypes();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
