package com.sentinel.imaging.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.imaging.dto.CreateImagingReportRequest;
import com.sentinel.imaging.dto.ImagingReportResponseDTO;
import com.sentinel.imaging.service.ImagingReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Imaging Reports", description = "Endpoints for creating, signing, and reviewing radiologist reports")
public class ImagingReportController {

    private final ImagingReportService imagingReportService;

    public ImagingReportController(ImagingReportService imagingReportService) {
        this.imagingReportService = imagingReportService;
    }

    @PostMapping("/api/v1/imaging-studies/{studyId}/reports")
    @Operation(summary = "Create an imaging report for a study")
    public ResponseEntity<ApiResponse<ImagingReportResponseDTO>> createReport(
            @PathVariable UUID studyId,
            @Valid @RequestBody CreateImagingReportRequest request) {
        ImagingReportResponseDTO response = imagingReportService.createReport(studyId, request);
        return new ResponseEntity<>(ApiResponse.success("Imaging report created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/imaging-studies/{studyId}/reports")
    @Operation(summary = "Get reports for an imaging study")
    public ResponseEntity<ApiResponse<List<ImagingReportResponseDTO>>> getStudyReports(
            @PathVariable UUID studyId) {
        List<ImagingReportResponseDTO> response = imagingReportService.getStudyReports(studyId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/imaging-reports/{reportId}")
    @Operation(summary = "Get imaging report by ID")
    public ResponseEntity<ApiResponse<ImagingReportResponseDTO>> getReport(
            @PathVariable UUID reportId) {
        ImagingReportResponseDTO response = imagingReportService.getReport(reportId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/imaging-reports/{reportId}/sign")
    @Operation(summary = "Sign and finalize an imaging report")
    public ResponseEntity<ApiResponse<ImagingReportResponseDTO>> signReport(
            @PathVariable UUID reportId) {
        ImagingReportResponseDTO response = imagingReportService.signReport(reportId);
        return ResponseEntity.ok(ApiResponse.success("Imaging report signed successfully", response));
    }
}
