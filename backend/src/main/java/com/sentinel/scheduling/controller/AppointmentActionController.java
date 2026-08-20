package com.sentinel.scheduling.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.scheduling.dto.*;
import com.sentinel.scheduling.service.AppointmentActionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/appointments/{appointmentId}")
@Tag(name = "Appointment Actions", description = "Endpoints for appointment lifecycle actions: check-in, triage, consult, cancel, reschedule")
public class AppointmentActionController {

    private final AppointmentActionService actionService;

    public AppointmentActionController(AppointmentActionService actionService) {
        this.actionService = actionService;
    }

    @PostMapping("/check-in")
    @Operation(summary = "Check in a patient for an appointment")
    public ResponseEntity<ApiResponse<AppointmentResponseDTO>> checkIn(
            @PathVariable UUID appointmentId,
            @RequestBody(required = false) AppointmentCheckInRequest request) {
        AppointmentCheckInRequest req = request != null ? request : new AppointmentCheckInRequest();
        AppointmentResponseDTO response = actionService.checkIn(appointmentId, req);
        return ResponseEntity.ok(ApiResponse.success("Patient checked in successfully", response));
    }

    @PostMapping("/no-show")
    @Operation(summary = "Record a patient no-show for an appointment")
    public ResponseEntity<ApiResponse<AppointmentResponseDTO>> noShow(
            @PathVariable UUID appointmentId,
            @RequestBody(required = false) AppointmentNoShowRequest request) {
        AppointmentNoShowRequest req = request != null ? request : new AppointmentNoShowRequest();
        AppointmentResponseDTO response = actionService.markNoShow(appointmentId, req);
        return ResponseEntity.ok(ApiResponse.success("Patient no-show recorded", response));
    }

    @PostMapping("/triage")
    @Operation(summary = "Record triage vitals for an appointment")
    public ResponseEntity<ApiResponse<AppointmentResponseDTO>> triage(
            @PathVariable UUID appointmentId,
            @Valid @RequestBody AppointmentTriageRequest request) {
        AppointmentResponseDTO response = actionService.triage(appointmentId, request);
        return ResponseEntity.ok(ApiResponse.success("Appointment triaged successfully", response));
    }

    @PostMapping("/consult")
    @Operation(summary = "Complete doctor consultation for an appointment")
    public ResponseEntity<ApiResponse<AppointmentResponseDTO>> consult(
            @PathVariable UUID appointmentId,
            @Valid @RequestBody AppointmentConsultRequest request) {
        AppointmentResponseDTO response = actionService.consult(appointmentId, request);
        return ResponseEntity.ok(ApiResponse.success("Consultation completed successfully", response));
    }

    @PostMapping("/cancel")
    @Operation(summary = "Cancel an appointment")
    public ResponseEntity<ApiResponse<AppointmentResponseDTO>> cancel(
            @PathVariable UUID appointmentId,
            @Valid @RequestBody AppointmentCancelRequest request) {
        AppointmentResponseDTO response = actionService.cancel(appointmentId, request);
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled successfully", response));
    }

    @PostMapping("/reschedule")
    @Operation(summary = "Reschedule an appointment")
    public ResponseEntity<ApiResponse<AppointmentResponseDTO>> reschedule(
            @PathVariable UUID appointmentId,
            @Valid @RequestBody AppointmentRescheduleRequest request) {
        AppointmentResponseDTO response = actionService.reschedule(appointmentId, request);
        return ResponseEntity.ok(ApiResponse.success("Appointment rescheduled successfully", response));
    }
}
