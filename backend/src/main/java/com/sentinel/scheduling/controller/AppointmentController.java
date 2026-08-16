package com.sentinel.scheduling.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.scheduling.dto.AppointmentResponseDTO;
import com.sentinel.scheduling.dto.CreateAppointmentRequest;
import com.sentinel.scheduling.dto.UpdateAppointmentRequest;
import com.sentinel.scheduling.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Appointments", description = "Endpoints for booking and managing patient appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping("/api/v1/appointments")
    @Operation(summary = "Book a new appointment")
    public ResponseEntity<ApiResponse<AppointmentResponseDTO>> createAppointment(
            @Valid @RequestBody CreateAppointmentRequest request) {
        AppointmentResponseDTO response = appointmentService.createAppointment(request);
        return new ResponseEntity<>(ApiResponse.success("Appointment booked successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/appointments/{appointmentId}")
    @Operation(summary = "Get appointment by ID")
    public ResponseEntity<ApiResponse<AppointmentResponseDTO>> getAppointment(
            @PathVariable UUID appointmentId) {
        AppointmentResponseDTO response = appointmentService.getAppointment(appointmentId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/patients/{patientId}/appointments")
    @Operation(summary = "Get all appointments for a patient")
    public ResponseEntity<ApiResponse<List<AppointmentResponseDTO>>> getPatientAppointments(
            @PathVariable UUID patientId) {
        List<AppointmentResponseDTO> response = appointmentService.getPatientAppointments(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/facilities/{facilityId}/appointments")
    @Operation(summary = "Get all appointments for a facility")
    public ResponseEntity<ApiResponse<List<AppointmentResponseDTO>>> getFacilityAppointments(
            @PathVariable UUID facilityId) {
        List<AppointmentResponseDTO> response = appointmentService.getFacilityAppointments(facilityId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/api/v1/appointments/{appointmentId}")
    @Operation(summary = "Update appointment details")
    public ResponseEntity<ApiResponse<AppointmentResponseDTO>> updateAppointment(
            @PathVariable UUID appointmentId,
            @Valid @RequestBody UpdateAppointmentRequest request) {
        AppointmentResponseDTO response = appointmentService.updateAppointment(appointmentId, request);
        return ResponseEntity.ok(ApiResponse.success("Appointment updated successfully", response));
    }
}
