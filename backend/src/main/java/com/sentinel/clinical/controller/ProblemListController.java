package com.sentinel.clinical.controller;

import com.sentinel.clinical.dto.AddProblemRequest;
import com.sentinel.clinical.dto.ProblemListResponseDTO;
import com.sentinel.clinical.dto.ResolveProblemRequest;
import com.sentinel.clinical.dto.UpdateProblemRequest;
import com.sentinel.clinical.service.ProblemListService;
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
@Tag(name = "Problem List", description = "Endpoints for managing patient problem lists")
public class ProblemListController {

    private final ProblemListService problemListService;

    public ProblemListController(ProblemListService problemListService) {
        this.problemListService = problemListService;
    }

    @GetMapping("/api/v1/patients/{patientId}/problems")
    @Operation(summary = "Get patient problem list")
    public ResponseEntity<ApiResponse<List<ProblemListResponseDTO>>> getProblemList(
            @PathVariable UUID patientId) {
        List<ProblemListResponseDTO> response = problemListService.getProblemList(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/patients/{patientId}/problems")
    @Operation(summary = "Add problem to patient list")
    public ResponseEntity<ApiResponse<ProblemListResponseDTO>> addProblem(
            @PathVariable UUID patientId,
            @Valid @RequestBody AddProblemRequest request) {
        ProblemListResponseDTO response = problemListService.addProblem(patientId, request);
        return new ResponseEntity<>(ApiResponse.success("Problem added successfully", response), HttpStatus.CREATED);
    }

    @PatchMapping("/api/v1/problems/{problemId}")
    @Operation(summary = "Update problem entry")
    public ResponseEntity<ApiResponse<ProblemListResponseDTO>> updateProblem(
            @PathVariable UUID problemId,
            @Valid @RequestBody UpdateProblemRequest request) {
        ProblemListResponseDTO response = problemListService.updateProblem(problemId, request);
        return ResponseEntity.ok(ApiResponse.success("Problem updated successfully", response));
    }

    @PostMapping("/api/v1/problems/{problemId}/resolve")
    @Operation(summary = "Resolve problem")
    public ResponseEntity<ApiResponse<ProblemListResponseDTO>> resolveProblem(
            @PathVariable UUID problemId,
            @RequestBody(required = false) ResolveProblemRequest request) {
        ProblemListResponseDTO response = problemListService.resolveProblem(problemId, request);
        return ResponseEntity.ok(ApiResponse.success("Problem resolved successfully", response));
    }
}
