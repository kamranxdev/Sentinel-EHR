package com.sentinel.clinical.controller;

import com.sentinel.clinical.dto.*;
import com.sentinel.clinical.service.EncounterService;
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
@Tag(name = "Encounters", description = "Endpoints for clinical encounters across Outpatient, Emergency, and Inpatient workflows")
public class EncounterController {

    private final EncounterService encounterService;

    public EncounterController(EncounterService encounterService) {
        this.encounterService = encounterService;
    }

    @PostMapping("/api/v1/encounters")
    @Operation(summary = "Create a new clinical encounter")
    public ResponseEntity<ApiResponse<EncounterResponseDTO>> createEncounter(
            @Valid @RequestBody CreateEncounterRequest request) {
        EncounterResponseDTO response = encounterService.createEncounter(request);
        return new ResponseEntity<>(ApiResponse.success("Encounter created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/appointments/{appointmentId}/encounter")
    @Operation(summary = "Get encounter linked to an appointment")
    public ResponseEntity<ApiResponse<EncounterResponseDTO>> getEncounterByAppointment(
            @PathVariable UUID appointmentId) {
        EncounterResponseDTO response = encounterService.getEncounterByAppointmentId(appointmentId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/encounters/{encounterId}/admit")
    @Operation(summary = "Admit patient from Emergency or Outpatient — creates linked Inpatient encounter and admission record")
    public ResponseEntity<ApiResponse<EncounterResponseDTO>> admitPatient(
            @PathVariable UUID encounterId,
            @Valid @RequestBody AdmissionRequest request) {
        EncounterResponseDTO response = encounterService.promoteToAdmission(encounterId, request);
        return ResponseEntity.ok(ApiResponse.success("Patient admitted successfully; inpatient encounter created", response));
    }

    @PostMapping("/api/v1/encounters/{encounterId}/disposition")
    @Operation(summary = "Record Emergency disposition decision (DISCHARGE, OBSERVE, ADMIT)")
    public ResponseEntity<ApiResponse<EncounterResponseDTO>> recordDisposition(
            @PathVariable UUID encounterId,
            @Valid @RequestBody EmergencyDispositionRequest request) {
        EncounterResponseDTO response = encounterService.recordDisposition(encounterId, request);
        return ResponseEntity.ok(ApiResponse.success("Emergency disposition recorded successfully", response));
    }

    @PostMapping("/api/v1/encounters/{encounterId}/participants")
    @Operation(summary = "Add a care team participant to an encounter")
    public ResponseEntity<ApiResponse<EncounterParticipantResponseDTO>> addParticipant(
            @PathVariable UUID encounterId,
            @Valid @RequestBody AddEncounterParticipantRequest request) {
        EncounterParticipantResponseDTO response = encounterService.addParticipant(encounterId, request);
        return new ResponseEntity<>(ApiResponse.success("Participant added successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/encounters/{encounterId}/participants")
    @Operation(summary = "Get all participants in an encounter")
    public ResponseEntity<ApiResponse<List<EncounterParticipantResponseDTO>>> getParticipants(
            @PathVariable UUID encounterId) {
        List<EncounterParticipantResponseDTO> response = encounterService.getParticipants(encounterId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/encounters/{encounterId}")
    @Operation(summary = "Get encounter by ID")
    public ResponseEntity<ApiResponse<EncounterResponseDTO>> getEncounter(
            @PathVariable UUID encounterId) {
        EncounterResponseDTO response = encounterService.getEncounter(encounterId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/patients/{patientId}/encounters")
    @Operation(summary = "Get all encounters for a patient")
    public ResponseEntity<ApiResponse<List<EncounterResponseDTO>>> getPatientEncounters(
            @PathVariable UUID patientId) {
        List<EncounterResponseDTO> response = encounterService.getPatientEncounters(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/encounters/search")
    @Operation(summary = "Search encounters by criteria")
    public ResponseEntity<ApiResponse<List<EncounterResponseDTO>>> searchEncounters(
            @RequestParam(required = false) UUID patientId,
            @RequestParam(required = false) UUID organizationId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String encounterType) {
        EncounterSearchCriteria criteria = new EncounterSearchCriteria(patientId, organizationId, status, encounterType);
        List<EncounterResponseDTO> response = encounterService.searchEncounters(criteria);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/api/v1/encounters/{encounterId}")
    @Operation(summary = "Update encounter details")
    public ResponseEntity<ApiResponse<EncounterResponseDTO>> updateEncounter(
            @PathVariable UUID encounterId,
            @Valid @RequestBody UpdateEncounterRequest request) {
        EncounterResponseDTO response = encounterService.updateEncounter(encounterId, request);
        return ResponseEntity.ok(ApiResponse.success("Encounter updated successfully", response));
    }

    @PostMapping("/api/v1/encounters/{encounterId}/complete")
    @Operation(summary = "Complete encounter")
    public ResponseEntity<ApiResponse<EncounterResponseDTO>> completeEncounter(
            @PathVariable UUID encounterId) {
        EncounterResponseDTO response = encounterService.completeEncounter(encounterId);
        return ResponseEntity.ok(ApiResponse.success("Encounter completed successfully", response));
    }
}
