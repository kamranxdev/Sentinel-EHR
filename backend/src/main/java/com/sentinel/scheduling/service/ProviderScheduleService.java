package com.sentinel.scheduling.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.repository.UserRepository;
import com.sentinel.scheduling.dto.CreateScheduleSlotRequest;
import com.sentinel.scheduling.dto.ScheduleSlotResponseDTO;
import com.sentinel.scheduling.entity.ScheduleSlot;
import com.sentinel.scheduling.repository.ScheduleSlotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProviderScheduleService {

    private final ScheduleSlotRepository scheduleSlotRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public ProviderScheduleService(ScheduleSlotRepository scheduleSlotRepository,
                                   UserRepository userRepository,
                                   AuditService auditService) {
        this.scheduleSlotRepository = scheduleSlotRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    public ScheduleSlotResponseDTO createSlot(CreateScheduleSlotRequest request) {
        User practitioner = userRepository.findById(request.getPractitionerId())
                .orElseThrow(() -> new ResourceNotFoundException("Practitioner not found with id: " + request.getPractitionerId()));

        ScheduleSlot slot = new ScheduleSlot();
        slot.setPractitioner(practitioner);
        slot.setStartTime(request.getStartTime());
        slot.setEndTime(request.getEndTime());
        slot.setStatus("FREE");

        ScheduleSlot saved = scheduleSlotRepository.save(slot);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "SCHEDULE_SLOT_CREATED", "Created slot for " + practitioner.getUsername());
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<ScheduleSlotResponseDTO> getPractitionerSlots(UUID practitionerId, OffsetDateTime start, OffsetDateTime end) {
        List<ScheduleSlot> slots;
        if (start != null && end != null) {
            slots = scheduleSlotRepository.findByPractitionerIdAndStartTimeBetween(practitionerId, start, end);
        } else {
            slots = scheduleSlotRepository.findByPractitionerId(practitionerId);
        }
        return slots.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public ScheduleSlotResponseDTO mapToDTO(ScheduleSlot s) {
        ScheduleSlotResponseDTO dto = new ScheduleSlotResponseDTO();
        dto.setId(s.getId());
        if (s.getPractitioner() != null) {
            dto.setPractitionerId(s.getPractitioner().getId());
            dto.setPractitionerName(s.getPractitioner().getFullName());
        }
        dto.setStartTime(s.getStartTime());
        dto.setEndTime(s.getEndTime());
        dto.setStatus(s.getStatus());
        return dto;
    }
}
