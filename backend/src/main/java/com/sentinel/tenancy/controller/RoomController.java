package com.sentinel.tenancy.controller;

import com.sentinel.common.response.ApiResponse;
import com.sentinel.tenancy.dto.CreateRoomRequest;
import com.sentinel.tenancy.dto.RoomResponseDTO;
import com.sentinel.tenancy.dto.UpdateRoomRequest;
import com.sentinel.tenancy.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "Rooms", description = "Endpoints for managing ward rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping("/api/v1/wards/{wardId}/rooms")
    @Operation(summary = "Create a room in a ward")
    public ResponseEntity<ApiResponse<RoomResponseDTO>> createRoom(
            @PathVariable UUID wardId,
            @Valid @RequestBody CreateRoomRequest request) {
        RoomResponseDTO response = roomService.createRoom(wardId, request);
        return new ResponseEntity<>(ApiResponse.success("Room created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/wards/{wardId}/rooms")
    @Operation(summary = "Get all rooms in a ward")
    public ResponseEntity<ApiResponse<List<RoomResponseDTO>>> getWardRooms(
            @PathVariable UUID wardId) {
        List<RoomResponseDTO> response = roomService.getWardRooms(wardId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/rooms/{roomId}")
    @Operation(summary = "Get room by ID")
    public ResponseEntity<ApiResponse<RoomResponseDTO>> getRoom(
            @PathVariable UUID roomId) {
        RoomResponseDTO response = roomService.getRoom(roomId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/api/v1/rooms/{roomId}")
    @Operation(summary = "Update room")
    public ResponseEntity<ApiResponse<RoomResponseDTO>> updateRoom(
            @PathVariable UUID roomId,
            @Valid @RequestBody UpdateRoomRequest request) {
        RoomResponseDTO response = roomService.updateRoom(roomId, request);
        return ResponseEntity.ok(ApiResponse.success("Room updated successfully", response));
    }

    @DeleteMapping("/api/v1/rooms/{roomId}")
    @Operation(summary = "Deactivate room")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(
            @PathVariable UUID roomId) {
        roomService.deactivateRoom(roomId);
        return ResponseEntity.ok(ApiResponse.success("Room deactivated successfully", null));
    }
}
