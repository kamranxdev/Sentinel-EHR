package com.sentinel.tenancy.service;

import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.tenancy.dto.BedResponseDTO;
import com.sentinel.tenancy.dto.CreateBedRequest;
import com.sentinel.tenancy.dto.UpdateBedRequest;
import com.sentinel.tenancy.entity.Bed;
import com.sentinel.tenancy.entity.Room;
import com.sentinel.tenancy.repository.BedRepository;
import com.sentinel.tenancy.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class BedService {

    private final BedRepository bedRepository;
    private final RoomRepository roomRepository;

    public BedService(BedRepository bedRepository, RoomRepository roomRepository) {
        this.bedRepository = bedRepository;
        this.roomRepository = roomRepository;
    }

    public BedResponseDTO createBed(UUID roomId, CreateBedRequest request) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));

        Bed bed = new Bed();
        bed.setOrganization(room.getOrganization());
        bed.setWard(room.getWard());
        bed.setRoom(room);
        bed.setBedNumber(request.getBedNumber());
        bed.setBedType(request.getBedType());
        bed.setBedCode(request.getBedCode());
        bed.setStatus("AVAILABLE");
        bed.setCreatedAt(OffsetDateTime.now());

        Bed saved = bedRepository.save(bed);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<BedResponseDTO> getRoomBeds(UUID roomId) {
        return bedRepository.findByRoomId(roomId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BedResponseDTO getBed(UUID bedId) {
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found with id: " + bedId));
        return mapToDTO(bed);
    }

    public BedResponseDTO updateBed(UUID bedId, UpdateBedRequest request) {
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found with id: " + bedId));

        if (request.getBedNumber() != null) bed.setBedNumber(request.getBedNumber());
        if (request.getBedType() != null) bed.setBedType(request.getBedType());
        if (request.getBedCode() != null) bed.setBedCode(request.getBedCode());
        if (request.getStatus() != null) bed.setStatus(request.getStatus());

        Bed saved = bedRepository.save(bed);
        return mapToDTO(saved);
    }

    public BedResponseDTO assignBed(UUID bedId, UUID encounterId) {
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found with id: " + bedId));
        bed.setStatus("OCCUPIED");
        Bed saved = bedRepository.save(bed);
        return mapToDTO(saved);
    }

    public BedResponseDTO releaseBed(UUID bedId) {
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found with id: " + bedId));
        bed.setStatus("AVAILABLE");
        Bed saved = bedRepository.save(bed);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<BedResponseDTO> findAvailableBeds(UUID organizationId, UUID wardId) {
        return bedRepository.findAvailableBeds(organizationId, wardId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public BedResponseDTO mapToDTO(Bed bed) {
        BedResponseDTO dto = new BedResponseDTO();
        dto.setId(bed.getId());
        if (bed.getOrganization() != null) {
            dto.setOrganizationId(bed.getOrganization().getId());
            dto.setOrganizationName(bed.getOrganization().getName());
        }
        if (bed.getWard() != null) {
            dto.setWardId(bed.getWard().getId());
            dto.setWardName(bed.getWard().getName());
        }
        if (bed.getRoom() != null) {
            dto.setRoomId(bed.getRoom().getId());
            dto.setRoomNumber(bed.getRoom().getRoomNumber());
        }
        dto.setBedNumber(bed.getBedNumber());
        dto.setBedType(bed.getBedType());
        dto.setBedCode(bed.getBedCode());
        dto.setStatus(bed.getStatus());
        dto.setCreatedAt(bed.getCreatedAt());
        return dto;
    }
}
