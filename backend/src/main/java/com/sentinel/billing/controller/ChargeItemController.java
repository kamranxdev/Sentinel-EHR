package com.sentinel.billing.controller;

import com.sentinel.billing.dto.ChargeItemResponseDTO;
import com.sentinel.billing.dto.CreateChargeItemRequest;
import com.sentinel.billing.service.ChargeItemService;
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
@Tag(name = "Charge Items", description = "Endpoints for posting clinical and service charges to encounters")
public class ChargeItemController {

    private final ChargeItemService chargeItemService;

    public ChargeItemController(ChargeItemService chargeItemService) {
        this.chargeItemService = chargeItemService;
    }

    @PostMapping("/api/v1/encounters/{encounterId}/charge-items")
    @Operation(summary = "Post a charge item to an encounter")
    public ResponseEntity<ApiResponse<ChargeItemResponseDTO>> createChargeItem(
            @PathVariable UUID encounterId,
            @Valid @RequestBody CreateChargeItemRequest request) {
        ChargeItemResponseDTO response = chargeItemService.createChargeItem(encounterId, request);
        return new ResponseEntity<>(ApiResponse.success("Charge posted successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/encounters/{encounterId}/charge-items")
    @Operation(summary = "Get all charge items for an encounter")
    public ResponseEntity<ApiResponse<List<ChargeItemResponseDTO>>> getEncounterCharges(
            @PathVariable UUID encounterId) {
        List<ChargeItemResponseDTO> response = chargeItemService.getEncounterCharges(encounterId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/charge-items/{chargeItemId}")
    @Operation(summary = "Get charge item by ID")
    public ResponseEntity<ApiResponse<ChargeItemResponseDTO>> getChargeItem(
            @PathVariable UUID chargeItemId) {
        ChargeItemResponseDTO response = chargeItemService.getChargeItem(chargeItemId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/api/v1/charge-items/{chargeItemId}")
    @Operation(summary = "Void/delete a charge item")
    public ResponseEntity<ApiResponse<Void>> deleteChargeItem(
            @PathVariable UUID chargeItemId) {
        chargeItemService.deleteChargeItem(chargeItemId);
        return ResponseEntity.ok(ApiResponse.success("Charge item deleted successfully", null));
    }
}
