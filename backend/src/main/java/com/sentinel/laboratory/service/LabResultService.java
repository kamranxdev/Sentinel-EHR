package com.sentinel.laboratory.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.laboratory.entity.LabOrder;
import com.sentinel.laboratory.entity.LabResult;
import com.sentinel.laboratory.entity.LabResultComponent;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.laboratory.dto.LabResultResponseDTO;
import com.sentinel.laboratory.dto.RecordLabResultRequest;
import com.sentinel.laboratory.repository.LabOrderRepository;
import com.sentinel.laboratory.repository.LabResultComponentRepository;
import com.sentinel.laboratory.repository.LabResultRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class LabResultService {

    private final LabResultRepository labResultRepository;
    private final LabResultComponentRepository labResultComponentRepository;
    private final LabOrderRepository labOrderRepository;
    private final AuditService auditService;

    public LabResultService(LabResultRepository labResultRepository,
                            LabResultComponentRepository labResultComponentRepository,
                            LabOrderRepository labOrderRepository,
                            AuditService auditService) {
        this.labResultRepository = labResultRepository;
        this.labResultComponentRepository = labResultComponentRepository;
        this.labOrderRepository = labOrderRepository;
        this.auditService = auditService;
    }

    public LabResultResponseDTO recordLabResult(Long labOrderId, RecordLabResultRequest request) {
        LabOrder order = labOrderRepository.findById(labOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab order not found with id: " + labOrderId));

        LabResult result = new LabResult();
        result.setLabOrder(order);
        result.setPatient(order.getPatient());
        result.setTestCode(request.getTestCode());
        result.setTestName(request.getTestName() != null ? request.getTestName() : order.getTestName());
        result.setResultValue(request.getResultValue());
        result.setUnit(request.getUnit());
        result.setReferenceRange(request.getReferenceRange());
        result.setAbnormalFlag(request.getAbnormalFlag());
        result.setIsCritical(request.getIsCritical() != null ? request.getIsCritical() : false);
        result.setStatus("FINAL");
        result.setResultAt(OffsetDateTime.now());

        LabResult saved = labResultRepository.save(result);

        if (request.getComponents() != null) {
            for (RecordLabResultRequest.LabComponentRequest comp : request.getComponents()) {
                LabResultComponent component = new LabResultComponent();
                component.setLabResult(saved);
                component.setCode(comp.getCode());
                component.setName(comp.getName());
                component.setValueNumeric(comp.getValueNumeric());
                component.setValueText(comp.getValueText());
                component.setUnit(comp.getUnit());
                component.setReferenceLow(comp.getReferenceLow());
                component.setReferenceHigh(comp.getReferenceHigh());
                component.setAbnormalFlag(comp.getAbnormalFlag());
                component.setCritical(comp.getCritical() != null ? comp.getCritical() : false);
                component.setInterpretation(comp.getInterpretation());
                labResultComponentRepository.save(component);
            }
        }

        order.setStatus("RESULTED");
        order.setResultedAt(java.time.LocalDateTime.now());
        labOrderRepository.save(order);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "LAB_RESULT_RECORDED", "Recorded result for order " + labOrderId);
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<LabResultResponseDTO> getOrderResults(Long labOrderId) {
        return labResultRepository.findByLabOrderId(labOrderId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LabResultResponseDTO> getPatientResults(UUID patientId) {
        return labResultRepository.findByPatientIdOrderByResultAtDesc(patientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public LabResultResponseDTO verifyResult(UUID resultId) {
        LabResult result = labResultRepository.findById(resultId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab result not found with id: " + resultId));

        result.setStatus("VERIFIED");
        LabResult saved = labResultRepository.save(result);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "LAB_RESULT_VERIFIED", "Verified lab result " + resultId);
        }

        return mapToDTO(saved);
    }

    public LabResultResponseDTO mapToDTO(LabResult r) {
        LabResultResponseDTO dto = new LabResultResponseDTO();
        dto.setId(r.getId());
        if (r.getLabOrder() != null) dto.setLabOrderId(r.getLabOrder().getId());
        if (r.getPatient() != null) dto.setPatientId(r.getPatient().getId());
        dto.setTestCode(r.getTestCode());
        dto.setTestName(r.getTestName());
        dto.setResultValue(r.getResultValue());
        dto.setUnit(r.getUnit());
        dto.setReferenceRange(r.getReferenceRange());
        dto.setAbnormalFlag(r.getAbnormalFlag());
        dto.setIsCritical(r.getIsCritical());
        dto.setStatus(r.getStatus());
        dto.setResultAt(r.getResultAt());

        List<LabResultComponent> components = labResultComponentRepository.findByLabResultId(r.getId());
        dto.setComponents(components.stream().map(c -> {
            LabResultResponseDTO.LabResultComponentDTO compDTO = new LabResultResponseDTO.LabResultComponentDTO();
            compDTO.setId(c.getId());
            compDTO.setCode(c.getCode());
            compDTO.setName(c.getName());
            compDTO.setValueNumeric(c.getValueNumeric());
            compDTO.setValueText(c.getValueText());
            compDTO.setUnit(c.getUnit());
            compDTO.setReferenceLow(c.getReferenceLow());
            compDTO.setReferenceHigh(c.getReferenceHigh());
            compDTO.setAbnormalFlag(c.getAbnormalFlag());
            compDTO.setCritical(c.getCritical());
            compDTO.setInterpretation(c.getInterpretation());
            return compDTO;
        }).collect(Collectors.toList()));

        return dto;
    }
}
