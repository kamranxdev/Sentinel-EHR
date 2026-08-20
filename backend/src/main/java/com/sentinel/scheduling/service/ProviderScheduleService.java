package com.sentinel.scheduling.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.identity.entity.Practitioner;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.repository.PractitionerRepository;
import com.sentinel.identity.repository.UserRepository;
import com.sentinel.scheduling.dto.CreateScheduleSlotRequest;
import com.sentinel.scheduling.dto.PractitionerDTO;
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
    private final PractitionerRepository practitionerRepository;
    private final AuditService auditService;

    public ProviderScheduleService(ScheduleSlotRepository scheduleSlotRepository,
                                   UserRepository userRepository,
                                   PractitionerRepository practitionerRepository,
                                   AuditService auditService) {
        this.scheduleSlotRepository = scheduleSlotRepository;
        this.userRepository = userRepository;
        this.practitionerRepository = practitionerRepository;
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
            auditService.logEvent(saved.getId(), "SCHEDULE_SLOT_CREATED", "Created slot for " + practitioner.getEmail());
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

    @Transactional(readOnly = true)
    public List<PractitionerDTO> getPractitionersBySpecialty(String specialtyCode, UUID organizationId) {
        List<Practitioner> practitioners = practitionerRepository.search(null, specialtyCode, "ACTIVE", organizationId);
        return practitioners.stream().map(this::mapPractitionerToDTO).collect(Collectors.toList());
    }

    private PractitionerDTO mapPractitionerToDTO(Practitioner p) {
        PractitionerDTO dto = new PractitionerDTO();
        dto.setId(p.getId());
        dto.setIdentifier(p.getIdentifier());
        if (p.getPerson() != null) {
            dto.setFirstName(p.getPerson().getFirstName());
            dto.setLastName(p.getPerson().getLastName());
        }
        dto.setPrimarySpecialty(p.getPrimarySpecialty());
        dto.setStatus(p.getStatus());
        return dto;
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
