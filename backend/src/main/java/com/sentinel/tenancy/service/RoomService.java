package com.sentinel.tenancy.service;

import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.tenancy.dto.CreateRoomRequest;
import com.sentinel.tenancy.dto.RoomResponseDTO;
import com.sentinel.tenancy.dto.UpdateRoomRequest;
import com.sentinel.tenancy.entity.Room;
import com.sentinel.tenancy.entity.Ward;
import com.sentinel.tenancy.repository.RoomRepository;
import com.sentinel.tenancy.repository.WardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class RoomService {

    private final RoomRepository roomRepository;
    private final WardRepository wardRepository;

    public RoomService(RoomRepository roomRepository, WardRepository wardRepository) {
        this.roomRepository = roomRepository;
        this.wardRepository = wardRepository;
    }

    public RoomResponseDTO createRoom(UUID wardId, CreateRoomRequest request) {
        Ward ward = wardRepository.findById(wardId)
                .orElseThrow(() -> new ResourceNotFoundException("Ward not found with id: " + wardId));

        if (roomRepository.existsByWardIdAndRoomNumber(wardId, request.getRoomNumber())) {
            throw new IllegalArgumentException("Room number already exists in ward: " + request.getRoomNumber());
        }

        Room room = new Room();
        room.setOrganization(ward.getOrganization());
        room.setFacility(ward.getFacility());
        room.setWard(ward);
        room.setRoomNumber(request.getRoomNumber());
        room.setRoomType(request.getRoomType());
        room.setStatus("ACTIVE");
        room.setCreatedAt(OffsetDateTime.now());

        Room saved = roomRepository.save(room);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<RoomResponseDTO> getWardRooms(UUID wardId) {
        return roomRepository.findByWardId(wardId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoomResponseDTO getRoom(UUID roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));
        return mapToDTO(room);
    }

    public RoomResponseDTO updateRoom(UUID roomId, UpdateRoomRequest request) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));

        if (request.getRoomNumber() != null) room.setRoomNumber(request.getRoomNumber());
        if (request.getRoomType() != null) room.setRoomType(request.getRoomType());
        if (request.getStatus() != null) room.setStatus(request.getStatus());

        Room saved = roomRepository.save(room);
        return mapToDTO(saved);
    }

    public void deactivateRoom(UUID roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));
        room.setStatus("INACTIVE");
        roomRepository.save(room);
    }

    public RoomResponseDTO mapToDTO(Room room) {
        RoomResponseDTO dto = new RoomResponseDTO();
        dto.setId(room.getId());
        if (room.getOrganization() != null) dto.setOrganizationId(room.getOrganization().getId());
        if (room.getFacility() != null) dto.setFacilityId(room.getFacility().getId());
        if (room.getWard() != null) {
            dto.setWardId(room.getWard().getId());
            dto.setWardName(room.getWard().getName());
        }
        dto.setRoomNumber(room.getRoomNumber());
        dto.setRoomType(room.getRoomType());
        dto.setStatus(room.getStatus());
        dto.setCreatedAt(room.getCreatedAt());
        return dto;
    }
}
