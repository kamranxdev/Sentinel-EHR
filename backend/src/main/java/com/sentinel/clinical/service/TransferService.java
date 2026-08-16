package com.sentinel.clinical.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.clinical.dto.TransferPatientRequest;
import com.sentinel.clinical.dto.TransferResponseDTO;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.clinical.entity.EncounterLocation;
import com.sentinel.clinical.entity.Transfer;
import com.sentinel.clinical.repository.EncounterLocationRepository;
import com.sentinel.clinical.repository.EncounterRepository;
import com.sentinel.clinical.repository.TransferRepository;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.tenancy.entity.Bed;
import com.sentinel.tenancy.entity.Department;
import com.sentinel.tenancy.entity.Ward;
import com.sentinel.tenancy.repository.BedRepository;
import com.sentinel.tenancy.repository.DepartmentRepository;
import com.sentinel.tenancy.repository.WardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class TransferService {

    private final TransferRepository transferRepository;
    private final EncounterRepository encounterRepository;
    private final EncounterLocationRepository encounterLocationRepository;
    private final BedRepository bedRepository;
    private final DepartmentRepository departmentRepository;
    private final WardRepository wardRepository;
    private final AuditService auditService;

    public TransferService(TransferRepository transferRepository,
                           EncounterRepository encounterRepository,
                           EncounterLocationRepository encounterLocationRepository,
                           BedRepository bedRepository,
                           DepartmentRepository departmentRepository,
                           WardRepository wardRepository,
                           AuditService auditService) {
        this.transferRepository = transferRepository;
        this.encounterRepository = encounterRepository;
        this.encounterLocationRepository = encounterLocationRepository;
        this.bedRepository = bedRepository;
        this.departmentRepository = departmentRepository;
        this.wardRepository = wardRepository;
        this.auditService = auditService;
    }

    public TransferResponseDTO transferPatient(UUID encounterId, TransferPatientRequest request) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));

        Transfer transfer = new Transfer();
        transfer.setEncounter(encounter);
        transfer.setOrganization(encounter.getOrganization());
        transfer.setReason(request.getReason());
        transfer.setTransferredAt(OffsetDateTime.now());
        transfer.setFromDepartment(encounter.getDepartment());

        Optional<EncounterLocation> activeLocationOpt = encounterLocationRepository.findActiveByEncounterId(encounterId);
        if (activeLocationOpt.isPresent()) {
            EncounterLocation activeLocation = activeLocationOpt.get();
            activeLocation.setStatus("COMPLETED");
            activeLocation.setEndTime(OffsetDateTime.now());
            encounterLocationRepository.save(activeLocation);

            if (activeLocation.getBed() != null) {
                transfer.setFromBed(activeLocation.getBed());
                transfer.setFromWard(activeLocation.getBed().getWard());

                Bed oldBed = activeLocation.getBed();
                oldBed.setStatus("AVAILABLE");
                bedRepository.save(oldBed);
            }
        }

        if (request.getToDepartmentId() != null) {
            Department toDept = departmentRepository.findById(request.getToDepartmentId()).orElse(null);
            transfer.setToDepartment(toDept);
            if (toDept != null) encounter.setDepartment(toDept);
        }

        if (request.getToWardId() != null) {
            Ward toWard = wardRepository.findById(request.getToWardId()).orElse(null);
            transfer.setToWard(toWard);
        }

        if (request.getToBedId() != null) {
            Bed toBed = bedRepository.findById(request.getToBedId())
                    .orElseThrow(() -> new ResourceNotFoundException("Bed not found with id: " + request.getToBedId()));
            toBed.setStatus("OCCUPIED");
            bedRepository.save(toBed);
            transfer.setToBed(toBed);

            EncounterLocation newLocation = new EncounterLocation();
            newLocation.setEncounter(encounter);
            newLocation.setBed(toBed);
            newLocation.setStartTime(OffsetDateTime.now());
            newLocation.setStatus("ACTIVE");
            encounterLocationRepository.save(newLocation);
        }

        encounter.setUpdatedAt(OffsetDateTime.now());
        encounterRepository.save(encounter);

        Transfer saved = transferRepository.save(transfer);

        if (auditService != null) {
            auditService.logEvent(encounter.getId(), "PATIENT_TRANSFERRED", "Patient transferred on encounter " + encounter.getEncounterNumber());
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<TransferResponseDTO> getTransfers(UUID encounterId) {
        return transferRepository.findByEncounterId(encounterId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public TransferResponseDTO mapToDTO(Transfer t) {
        TransferResponseDTO dto = new TransferResponseDTO();
        dto.setId(t.getId());
        if (t.getEncounter() != null) dto.setEncounterId(t.getEncounter().getId());
        if (t.getFromDepartment() != null) dto.setFromDepartmentId(t.getFromDepartment().getId());
        if (t.getFromWard() != null) dto.setFromWardId(t.getFromWard().getId());
        if (t.getFromBed() != null) dto.setFromBedId(t.getFromBed().getId());
        if (t.getToDepartment() != null) dto.setToDepartmentId(t.getToDepartment().getId());
        if (t.getToWard() != null) dto.setToWardId(t.getToWard().getId());
        if (t.getToBed() != null) dto.setToBedId(t.getToBed().getId());
        dto.setReason(t.getReason());
        if (t.getTransferredBy() != null) dto.setTransferredByUsername(t.getTransferredBy().getUsername());
        dto.setTransferredAt(t.getTransferredAt());
        return dto;
    }
}
