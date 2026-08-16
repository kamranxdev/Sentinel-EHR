package com.sentinel.pharmacy.service;

import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.pharmacy.dto.CreateMedicationRequest;
import com.sentinel.pharmacy.dto.MedicationResponseDTO;
import com.sentinel.pharmacy.dto.MedicationSearchCriteria;
import com.sentinel.pharmacy.dto.UpdateMedicationRequest;
import com.sentinel.pharmacy.entity.Medication;
import com.sentinel.pharmacy.repository.MedicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class MedicationService {

    private final MedicationRepository medicationRepository;

    public MedicationService(MedicationRepository medicationRepository) {
        this.medicationRepository = medicationRepository;
    }

    public MedicationResponseDTO createMedication(CreateMedicationRequest request) {
        Medication med = new Medication();
        med.setName(request.getName());
        med.setGenericName(request.getGenericName());
        med.setRxNormCode(request.getRxNormCode());
        med.setForm(request.getForm());
        med.setStrength(request.getStrength());

        Medication saved = medicationRepository.save(med);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public MedicationResponseDTO getMedication(UUID medicationId) {
        Medication med = medicationRepository.findById(medicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Medication not found with id: " + medicationId));
        return mapToDTO(med);
    }

    @Transactional(readOnly = true)
    public List<MedicationResponseDTO> searchMedications(MedicationSearchCriteria criteria) {
        List<Medication> list;
        if (criteria != null && (criteria.getQuery() != null || criteria.getForm() != null)) {
            list = medicationRepository.searchMedications(criteria.getQuery(), criteria.getForm());
        } else {
            list = medicationRepository.findAll();
        }
        return list.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public MedicationResponseDTO updateMedication(UUID medicationId, UpdateMedicationRequest request) {
        Medication med = medicationRepository.findById(medicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Medication not found with id: " + medicationId));

        if (request.getName() != null) med.setName(request.getName());
        if (request.getGenericName() != null) med.setGenericName(request.getGenericName());
        if (request.getRxNormCode() != null) med.setRxNormCode(request.getRxNormCode());
        if (request.getForm() != null) med.setForm(request.getForm());
        if (request.getStrength() != null) med.setStrength(request.getStrength());

        Medication saved = medicationRepository.save(med);
        return mapToDTO(saved);
    }

    public MedicationResponseDTO mapToDTO(Medication m) {
        MedicationResponseDTO dto = new MedicationResponseDTO();
        dto.setId(m.getId());
        dto.setName(m.getName());
        dto.setGenericName(m.getGenericName());
        dto.setRxNormCode(m.getRxNormCode());
        dto.setForm(m.getForm());
        dto.setStrength(m.getStrength());
        return dto;
    }
}
