package com.sentinel.imaging.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.imaging.dto.CreateImagingSeriesRequest;
import com.sentinel.imaging.dto.CreateImagingStudyRequest;
import com.sentinel.imaging.dto.ImagingSeriesResponseDTO;
import com.sentinel.imaging.dto.ImagingStudyResponseDTO;
import com.sentinel.imaging.service.ImagingStudyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Imaging Studies & PACS", description = "Endpoints for managing imaging studies, series, and DICOM objects")
public class ImagingStudyController {

    private final ImagingStudyService imagingStudyService;

    public ImagingStudyController(ImagingStudyService imagingStudyService) {
        this.imagingStudyService = imagingStudyService;
    }

    @PostMapping("/api/v1/imaging-orders/{orderId}/studies")
    @Operation(summary = "Create an imaging study for an order")
    public ResponseEntity<ApiResponse<ImagingStudyResponseDTO>> createImagingStudy(
            @PathVariable Long orderId,
            @Valid @RequestBody CreateImagingStudyRequest request) {
        ImagingStudyResponseDTO response = imagingStudyService.createImagingStudy(orderId, request);
        return new ResponseEntity<>(ApiResponse.success("Imaging study created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/imaging-orders/{orderId}/studies")
    @Operation(summary = "Get all studies for an imaging order")
    public ResponseEntity<ApiResponse<List<ImagingStudyResponseDTO>>> getOrderStudies(
            @PathVariable Long orderId) {
        List<ImagingStudyResponseDTO> response = imagingStudyService.getOrderStudies(orderId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/imaging-studies/{studyId}")
    @Operation(summary = "Get imaging study by ID")
    public ResponseEntity<ApiResponse<ImagingStudyResponseDTO>> getImagingStudy(
            @PathVariable UUID studyId) {
        ImagingStudyResponseDTO response = imagingStudyService.getImagingStudy(studyId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/imaging-studies/{studyId}/series")
    @Operation(summary = "Add an imaging series to a study")
    public ResponseEntity<ApiResponse<ImagingSeriesResponseDTO>> addSeries(
            @PathVariable UUID studyId,
            @Valid @RequestBody CreateImagingSeriesRequest request) {
        ImagingSeriesResponseDTO response = imagingStudyService.addSeries(studyId, request);
        return new ResponseEntity<>(ApiResponse.success("Series added successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/imaging-studies/{studyId}/series")
    @Operation(summary = "Get all series for a study")
    public ResponseEntity<ApiResponse<List<ImagingSeriesResponseDTO>>> getStudySeries(
            @PathVariable UUID studyId) {
        List<ImagingSeriesResponseDTO> response = imagingStudyService.getStudySeries(studyId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
