package com.sentinel.billing.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.billing.dto.ChargeItemResponseDTO;
import com.sentinel.billing.dto.CreateChargeItemRequest;
import com.sentinel.billing.entity.ChargeItem;
import com.sentinel.billing.repository.ChargeItemRepository;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.clinical.repository.EncounterRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ChargeItemService {

    private final ChargeItemRepository chargeItemRepository;
    private final EncounterRepository encounterRepository;
    private final PatientRepository patientRepository;
    private final AuditService auditService;

    public ChargeItemService(ChargeItemRepository chargeItemRepository,
                             EncounterRepository encounterRepository,
                             PatientRepository patientRepository,
                             AuditService auditService) {
        this.chargeItemRepository = chargeItemRepository;
        this.encounterRepository = encounterRepository;
        this.patientRepository = patientRepository;
        this.auditService = auditService;
    }

    public ChargeItemResponseDTO createChargeItem(UUID encounterId, CreateChargeItemRequest request) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));

        ChargeItem item = new ChargeItem();
        item.setEncounter(encounter);
        item.setPatient(encounter.getPatient());
        item.setCode(request.getCode());
        item.setDescription(request.getDescription());
        item.setAmount(request.getAmount());
        item.setStatus("BILLED");
        item.setChargedAt(OffsetDateTime.now());

        ChargeItem saved = chargeItemRepository.save(item);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "CHARGE_ITEM_POSTED", "Posted charge " + saved.getCode() + " of amount " + saved.getAmount());
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<ChargeItemResponseDTO> getEncounterCharges(UUID encounterId) {
        return chargeItemRepository.findByEncounterIdOrderByChargedAtDesc(encounterId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ChargeItemResponseDTO getChargeItem(UUID chargeItemId) {
        ChargeItem item = chargeItemRepository.findById(chargeItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Charge item not found with id: " + chargeItemId));
        return mapToDTO(item);
    }

    public void deleteChargeItem(UUID chargeItemId) {
        ChargeItem item = chargeItemRepository.findById(chargeItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Charge item not found with id: " + chargeItemId));
        chargeItemRepository.delete(item);

        if (auditService != null) {
            auditService.logEvent(chargeItemId, "CHARGE_ITEM_DELETED", "Deleted charge item " + chargeItemId);
        }
    }

    public ChargeItemResponseDTO mapToDTO(ChargeItem c) {
        ChargeItemResponseDTO dto = new ChargeItemResponseDTO();
        dto.setId(c.getId());
        if (c.getPatient() != null) {
            dto.setPatientId(c.getPatient().getId());
            dto.setPatientName(c.getPatient().getFullName());
        }
        if (c.getEncounter() != null) dto.setEncounterId(c.getEncounter().getId());
        dto.setCode(c.getCode());
        dto.setDescription(c.getDescription());
        dto.setAmount(c.getAmount());
        dto.setStatus(c.getStatus());
        dto.setChargedAt(c.getChargedAt());
        return dto;
    }
}
