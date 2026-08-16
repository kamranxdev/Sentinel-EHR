package com.sentinel.patient.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.patient.dto.*;
import com.sentinel.patient.service.PatientContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Patient Contact Information", description = "Endpoints for managing addresses, phones, emails, and emergency contacts")
public class PatientContactController {

    private final PatientContactService patientContactService;

    public PatientContactController(PatientContactService patientContactService) {
        this.patientContactService = patientContactService;
    }

    // Addresses
    @PostMapping("/api/v1/patients/{patientId}/addresses")
    @Operation(summary = "Add patient address")
    public ResponseEntity<ApiResponse<PatientAddressResponseDTO>> addAddress(
            @PathVariable UUID patientId,
            @Valid @RequestBody CreateAddressRequest request) {
        PatientAddressResponseDTO response = patientContactService.addAddress(patientId, request);
        return new ResponseEntity<>(ApiResponse.success("Address added successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/patients/{patientId}/addresses")
    @Operation(summary = "Get patient addresses")
    public ResponseEntity<ApiResponse<List<PatientAddressResponseDTO>>> getAddresses(
            @PathVariable UUID patientId) {
        List<PatientAddressResponseDTO> response = patientContactService.getAddresses(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/api/v1/patient-addresses/{addressId}")
    @Operation(summary = "Update patient address")
    public ResponseEntity<ApiResponse<PatientAddressResponseDTO>> updateAddress(
            @PathVariable UUID addressId,
            @Valid @RequestBody UpdateAddressRequest request) {
        PatientAddressResponseDTO response = patientContactService.updateAddress(addressId, request);
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", response));
    }

    @DeleteMapping("/api/v1/patient-addresses/{addressId}")
    @Operation(summary = "Delete patient address")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @PathVariable UUID addressId) {
        patientContactService.deleteAddress(addressId);
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully", null));
    }

    // Phones
    @PostMapping("/api/v1/patients/{patientId}/phones")
    @Operation(summary = "Add patient phone number")
    public ResponseEntity<ApiResponse<PatientPhoneResponseDTO>> addPhone(
            @PathVariable UUID patientId,
            @Valid @RequestBody CreatePhoneRequest request) {
        PatientPhoneResponseDTO response = patientContactService.addPhone(patientId, request);
        return new ResponseEntity<>(ApiResponse.success("Phone added successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/patients/{patientId}/phones")
    @Operation(summary = "Get patient phone numbers")
    public ResponseEntity<ApiResponse<List<PatientPhoneResponseDTO>>> getPhones(
            @PathVariable UUID patientId) {
        List<PatientPhoneResponseDTO> response = patientContactService.getPhones(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // Emails
    @PostMapping("/api/v1/patients/{patientId}/emails")
    @Operation(summary = "Add patient email address")
    public ResponseEntity<ApiResponse<PatientEmailResponseDTO>> addEmail(
            @PathVariable UUID patientId,
            @Valid @RequestBody CreateEmailRequest request) {
        PatientEmailResponseDTO response = patientContactService.addEmail(patientId, request);
        return new ResponseEntity<>(ApiResponse.success("Email added successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/patients/{patientId}/emails")
    @Operation(summary = "Get patient email addresses")
    public ResponseEntity<ApiResponse<List<PatientEmailResponseDTO>>> getEmails(
            @PathVariable UUID patientId) {
        List<PatientEmailResponseDTO> response = patientContactService.getEmails(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // Emergency Contacts
    @PostMapping("/api/v1/patients/{patientId}/emergency-contacts")
    @Operation(summary = "Add emergency contact")
    public ResponseEntity<ApiResponse<EmergencyContactResponseDTO>> addEmergencyContact(
            @PathVariable UUID patientId,
            @Valid @RequestBody CreateEmergencyContactRequest request) {
        EmergencyContactResponseDTO response = patientContactService.addEmergencyContact(patientId, request);
        return new ResponseEntity<>(ApiResponse.success("Emergency contact added successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/patients/{patientId}/emergency-contacts")
    @Operation(summary = "Get emergency contacts")
    public ResponseEntity<ApiResponse<List<EmergencyContactResponseDTO>>> getEmergencyContacts(
            @PathVariable UUID patientId) {
        List<EmergencyContactResponseDTO> response = patientContactService.getEmergencyContacts(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/api/v1/emergency-contacts/{contactId}")
    @Operation(summary = "Update emergency contact")
    public ResponseEntity<ApiResponse<EmergencyContactResponseDTO>> updateEmergencyContact(
            @PathVariable UUID contactId,
            @Valid @RequestBody UpdateEmergencyContactRequest request) {
        EmergencyContactResponseDTO response = patientContactService.updateEmergencyContact(contactId, request);
        return ResponseEntity.ok(ApiResponse.success("Emergency contact updated successfully", response));
    }

    @DeleteMapping("/api/v1/emergency-contacts/{contactId}")
    @Operation(summary = "Delete emergency contact")
    public ResponseEntity<ApiResponse<Void>> deleteEmergencyContact(
            @PathVariable UUID contactId) {
        patientContactService.deleteEmergencyContact(contactId);
        return ResponseEntity.ok(ApiResponse.success("Emergency contact deleted successfully", null));
    }
}
