package com.sentinel.procedure.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.procedure.dto.CreateProcedureNoteRequest;
import com.sentinel.procedure.dto.ProcedureNoteResponseDTO;
import com.sentinel.procedure.service.ProcedureNoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Procedure Notes", description = "Endpoints for operative and procedure notes")
public class ProcedureNoteController {

    private final ProcedureNoteService procedureNoteService;

    public ProcedureNoteController(ProcedureNoteService procedureNoteService) {
        this.procedureNoteService = procedureNoteService;
    }

    @PostMapping("/api/v1/procedure-performances/{performanceId}/notes")
    @Operation(summary = "Add an operative or post-op note to a procedure performance")
    public ResponseEntity<ApiResponse<ProcedureNoteResponseDTO>> createNote(
            @PathVariable UUID performanceId,
            @Valid @RequestBody CreateProcedureNoteRequest request) {
        ProcedureNoteResponseDTO response = procedureNoteService.createNote(performanceId, request);
        return new ResponseEntity<>(ApiResponse.success("Procedure note created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/procedure-performances/{performanceId}/notes")
    @Operation(summary = "Get all notes for a procedure performance")
    public ResponseEntity<ApiResponse<List<ProcedureNoteResponseDTO>>> getPerformanceNotes(
            @PathVariable UUID performanceId) {
        List<ProcedureNoteResponseDTO> response = procedureNoteService.getPerformanceNotes(performanceId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
