package com.sentinel.imaging.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.imaging.entity.ImagingOrder;
import com.sentinel.imaging.entity.ImagingSeries;
import com.sentinel.imaging.entity.ImagingStudy;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.imaging.dto.CreateImagingSeriesRequest;
import com.sentinel.imaging.dto.CreateImagingStudyRequest;
import com.sentinel.imaging.dto.ImagingSeriesResponseDTO;
import com.sentinel.imaging.dto.ImagingStudyResponseDTO;
import com.sentinel.imaging.repository.ImagingOrderRepository;
import com.sentinel.imaging.repository.ImagingSeriesRepository;
import com.sentinel.imaging.repository.ImagingStudyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ImagingStudyService {

    private final ImagingStudyRepository imagingStudyRepository;
    private final ImagingSeriesRepository imagingSeriesRepository;
    private final ImagingOrderRepository imagingOrderRepository;
    private final AuditService auditService;

    public ImagingStudyService(ImagingStudyRepository imagingStudyRepository,
                               ImagingSeriesRepository imagingSeriesRepository,
                               ImagingOrderRepository imagingOrderRepository,
                               AuditService auditService) {
        this.imagingStudyRepository = imagingStudyRepository;
        this.imagingSeriesRepository = imagingSeriesRepository;
        this.imagingOrderRepository = imagingOrderRepository;
        this.auditService = auditService;
    }

    public ImagingStudyResponseDTO createImagingStudy(Long orderId, CreateImagingStudyRequest request) {
        ImagingOrder order = imagingOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Imaging order not found with id: " + orderId));

        ImagingStudy study = new ImagingStudy();
        study.setImagingOrder(order);
        study.setPatient(order.getPatient());
        study.setOrganization(order.getEncounter() != null ? order.getEncounter().getOrganization() : null);
        study.setAccessionNumber(request.getAccessionNumber() != null ? request.getAccessionNumber() : "ACC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        study.setStudyInstanceUid(request.getStudyInstanceUid() != null ? request.getStudyInstanceUid() : "1.2.840.10008." + UUID.randomUUID().toString());
        study.setModality(request.getModality() != null ? request.getModality() : order.getModality());
        study.setPacsReference(request.getPacsReference());
        study.setStatus("COMPLETED");
        study.setPerformedAt(request.getPerformedAt() != null ? request.getPerformedAt() : OffsetDateTime.now());

        ImagingStudy saved = imagingStudyRepository.save(study);

        order.setStatus("PERFORMED");
        order.setPerformedAt(java.time.LocalDateTime.now());
        order.setDicomStudyInstanceUid(saved.getStudyInstanceUid());
        imagingOrderRepository.save(order);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "IMAGING_STUDY_CREATED", "Recorded study for order " + orderId);
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<ImagingStudyResponseDTO> getOrderStudies(Long orderId) {
        return imagingStudyRepository.findByImagingOrderId(orderId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ImagingStudyResponseDTO getImagingStudy(UUID studyId) {
        ImagingStudy study = imagingStudyRepository.findById(studyId)
                .orElseThrow(() -> new ResourceNotFoundException("Imaging study not found with id: " + studyId));
        return mapToDTO(study);
    }

    public ImagingSeriesResponseDTO addSeries(UUID studyId, CreateImagingSeriesRequest request) {
        ImagingStudy study = imagingStudyRepository.findById(studyId)
                .orElseThrow(() -> new ResourceNotFoundException("Imaging study not found with id: " + studyId));

        ImagingSeries series = new ImagingSeries();
        series.setStudy(study);
        series.setSeriesInstanceUid(request.getSeriesInstanceUid() != null ? request.getSeriesInstanceUid() : "1.2.840.10008." + UUID.randomUUID().toString());
        series.setModality(request.getModality() != null ? request.getModality() : study.getModality());
        series.setSeriesNumber(request.getSeriesNumber() != null ? request.getSeriesNumber() : 1);
        series.setDescription(request.getDescription());

        ImagingSeries saved = imagingSeriesRepository.save(series);
        return mapSeriesToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<ImagingSeriesResponseDTO> getStudySeries(UUID studyId) {
        return imagingSeriesRepository.findByStudyId(studyId).stream()
                .map(this::mapSeriesToDTO)
                .collect(Collectors.toList());
    }

    public ImagingStudyResponseDTO mapToDTO(ImagingStudy s) {
        ImagingStudyResponseDTO dto = new ImagingStudyResponseDTO();
        dto.setId(s.getId());
        if (s.getPatient() != null) dto.setPatientId(s.getPatient().getId());
        if (s.getImagingOrder() != null) dto.setImagingOrderId(s.getImagingOrder().getId());
        dto.setAccessionNumber(s.getAccessionNumber());
        dto.setStudyInstanceUid(s.getStudyInstanceUid());
        dto.setModality(s.getModality());
        dto.setPerformedAt(s.getPerformedAt());
        dto.setPacsReference(s.getPacsReference());
        dto.setStatus(s.getStatus());
        return dto;
    }

    public ImagingSeriesResponseDTO mapSeriesToDTO(ImagingSeries s) {
        ImagingSeriesResponseDTO dto = new ImagingSeriesResponseDTO();
        dto.setId(s.getId());
        if (s.getStudy() != null) dto.setStudyId(s.getStudy().getId());
        dto.setSeriesInstanceUid(s.getSeriesInstanceUid());
        dto.setModality(s.getModality());
        dto.setSeriesNumber(s.getSeriesNumber());
        dto.setDescription(s.getDescription());
        return dto;
    }
}
