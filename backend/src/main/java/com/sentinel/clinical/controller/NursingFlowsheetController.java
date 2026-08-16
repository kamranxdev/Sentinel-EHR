package com.sentinel.clinical.controller;

import com.sentinel.clinical.dto.AddFlowsheetEntryRequest;
import com.sentinel.clinical.dto.CreateFlowsheetRequest;
import com.sentinel.clinical.dto.NursingFlowsheetResponseDTO;
import com.sentinel.clinical.service.NursingService;
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
@Tag(name = "Nursing Flowsheets", description = "Endpoints for inpatient nursing flowsheets and shift assessments")
public class NursingFlowsheetController {

    private final NursingService nursingService;

    public NursingFlowsheetController(NursingService nursingService) {
        this.nursingService = nursingService;
    }

    @PostMapping("/api/v1/encounters/{encounterId}/nursing-flowsheets")
    @Operation(summary = "Create a nursing flowsheet for an encounter")
    public ResponseEntity<ApiResponse<NursingFlowsheetResponseDTO>> createFlowsheet(
            @PathVariable UUID encounterId,
            @Valid @RequestBody CreateFlowsheetRequest request) {
        NursingFlowsheetResponseDTO response = nursingService.createFlowsheet(encounterId, request);
        return new ResponseEntity<>(ApiResponse.success("Flowsheet created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/encounters/{encounterId}/nursing-flowsheets")
    @Operation(summary = "Get all nursing flowsheets for an encounter")
    public ResponseEntity<ApiResponse<List<NursingFlowsheetResponseDTO>>> getEncounterFlowsheets(
            @PathVariable UUID encounterId) {
        List<NursingFlowsheetResponseDTO> response = nursingService.getEncounterFlowsheets(encounterId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/nursing-flowsheets/{flowsheetId}/entries")
    @Operation(summary = "Add an entry to a nursing flowsheet")
    public ResponseEntity<ApiResponse<NursingFlowsheetResponseDTO>> addFlowsheetEntry(
            @PathVariable UUID flowsheetId,
            @Valid @RequestBody AddFlowsheetEntryRequest request) {
        NursingFlowsheetResponseDTO response = nursingService.addFlowsheetEntry(flowsheetId, request);
        return new ResponseEntity<>(ApiResponse.success("Flowsheet entry added successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/nursing-flowsheets/{flowsheetId}/entries")
    @Operation(summary = "Get all entries of a nursing flowsheet")
    public ResponseEntity<ApiResponse<List<NursingFlowsheetResponseDTO.EntryDTO>>> getFlowsheetEntries(
            @PathVariable UUID flowsheetId) {
        List<NursingFlowsheetResponseDTO.EntryDTO> response = nursingService.getFlowsheetEntries(flowsheetId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
