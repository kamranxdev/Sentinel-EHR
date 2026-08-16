package com.sentinel.scheduling.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.scheduling.dto.CreateScheduleSlotRequest;
import com.sentinel.scheduling.dto.ScheduleSlotResponseDTO;
import com.sentinel.scheduling.service.ProviderScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Provider Schedules", description = "Endpoints for provider availability and schedule slots")
public class ProviderScheduleController {

    private final ProviderScheduleService providerScheduleService;

    public ProviderScheduleController(ProviderScheduleService providerScheduleService) {
        this.providerScheduleService = providerScheduleService;
    }

    @PostMapping("/api/v1/practitioners/{practitionerId}/slots")
    @Operation(summary = "Create a schedule slot for a practitioner")
    public ResponseEntity<ApiResponse<ScheduleSlotResponseDTO>> createSlot(
            @PathVariable UUID practitionerId,
            @Valid @RequestBody CreateScheduleSlotRequest request) {
        request.setPractitionerId(practitionerId);
        ScheduleSlotResponseDTO response = providerScheduleService.createSlot(request);
        return new ResponseEntity<>(ApiResponse.success("Schedule slot created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/practitioners/{practitionerId}/slots")
    @Operation(summary = "Get schedule slots for a practitioner within time range")
    public ResponseEntity<ApiResponse<List<ScheduleSlotResponseDTO>>> getPractitionerSlots(
            @PathVariable UUID practitionerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime end) {
        List<ScheduleSlotResponseDTO> response = providerScheduleService.getPractitionerSlots(practitionerId, start, end);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
