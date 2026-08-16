package com.sentinel.billing.controller;

import com.sentinel.billing.dto.CreatePriceListItemRequest;
import com.sentinel.billing.dto.CreatePriceListRequest;
import com.sentinel.billing.dto.PriceListItemResponseDTO;
import com.sentinel.billing.dto.PriceListResponseDTO;
import com.sentinel.billing.service.PriceListService;
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
@Tag(name = "Price Lists & Tariffs", description = "Endpoints for standard tariff lists and hospital charge rates")
public class PriceListController {

    private final PriceListService priceListService;

    public PriceListController(PriceListService priceListService) {
        this.priceListService = priceListService;
    }

    @PostMapping("/api/v1/facilities/{facilityId}/price-lists")
    @Operation(summary = "Create a price list for a facility")
    public ResponseEntity<ApiResponse<PriceListResponseDTO>> createPriceList(
            @PathVariable UUID facilityId,
            @Valid @RequestBody CreatePriceListRequest request) {
        PriceListResponseDTO response = priceListService.createPriceList(facilityId, request);
        return new ResponseEntity<>(ApiResponse.success("Price list created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/facilities/{facilityId}/price-lists")
    @Operation(summary = "Get price lists for a facility")
    public ResponseEntity<ApiResponse<List<PriceListResponseDTO>>> getFacilityPriceLists(
            @PathVariable UUID facilityId) {
        List<PriceListResponseDTO> response = priceListService.getFacilityPriceLists(facilityId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/v1/price-lists/{priceListId}/items")
    @Operation(summary = "Add an item to a price list")
    public ResponseEntity<ApiResponse<PriceListItemResponseDTO>> addItem(
            @PathVariable UUID priceListId,
            @Valid @RequestBody CreatePriceListItemRequest request) {
        PriceListItemResponseDTO response = priceListService.addItem(priceListId, request);
        return new ResponseEntity<>(ApiResponse.success("Price list item added successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/price-lists/{priceListId}/items")
    @Operation(summary = "Get items in a price list")
    public ResponseEntity<ApiResponse<List<PriceListItemResponseDTO>>> getPriceListItems(
            @PathVariable UUID priceListId) {
        List<PriceListItemResponseDTO> response = priceListService.getPriceListItems(priceListId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
