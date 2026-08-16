package com.sentinel.imaging.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.imaging.entity.ImagingReport;
import com.sentinel.imaging.entity.ImagingReportVersion;
import com.sentinel.imaging.entity.ImagingStudy;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.imaging.dto.CreateImagingReportRequest;
import com.sentinel.imaging.dto.ImagingReportResponseDTO;
import com.sentinel.imaging.repository.ImagingReportRepository;
import com.sentinel.imaging.repository.ImagingReportVersionRepository;
import com.sentinel.imaging.repository.ImagingStudyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ImagingReportService {

    private final ImagingReportRepository imagingReportRepository;
    private final ImagingReportVersionRepository imagingReportVersionRepository;
    private final ImagingStudyRepository imagingStudyRepository;
    private final AuditService auditService;

    public ImagingReportService(ImagingReportRepository imagingReportRepository,
                                ImagingReportVersionRepository imagingReportVersionRepository,
                                ImagingStudyRepository imagingStudyRepository,
                                AuditService auditService) {
        this.imagingReportRepository = imagingReportRepository;
        this.imagingReportVersionRepository = imagingReportVersionRepository;
        this.imagingStudyRepository = imagingStudyRepository;
        this.auditService = auditService;
    }

    public ImagingReportResponseDTO createReport(UUID studyId, CreateImagingReportRequest request) {
        ImagingStudy study = imagingStudyRepository.findById(studyId)
                .orElseThrow(() -> new ResourceNotFoundException("Imaging study not found with id: " + studyId));

        ImagingReport report = new ImagingReport();
        report.setStudy(study);
        report.setFindings(request.getFindings());
        report.setImpression(request.getImpression());
        report.setReportStatus(request.getReportStatus() != null ? request.getReportStatus() : "DRAFT");
        report.setReportedAt(OffsetDateTime.now());

        ImagingReport saved = imagingReportRepository.save(report);

        ImagingReportVersion version = new ImagingReportVersion();
        version.setReport(saved);
        version.setVersionNumber(1);
        version.setContent("Findings: " + request.getFindings() + "\nImpression: " + request.getImpression());
        version.setCreatedAt(OffsetDateTime.now());
        imagingReportVersionRepository.save(version);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "IMAGING_REPORT_CREATED", "Created report for study " + studyId);
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<ImagingReportResponseDTO> getStudyReports(UUID studyId) {
        return imagingReportRepository.findByStudyId(studyId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ImagingReportResponseDTO getReport(UUID reportId) {
        ImagingReport report = imagingReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Imaging report not found with id: " + reportId));
        return mapToDTO(report);
    }

    public ImagingReportResponseDTO signReport(UUID reportId) {
        ImagingReport report = imagingReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Imaging report not found with id: " + reportId));

        report.setReportStatus("FINAL");
        ImagingReport saved = imagingReportRepository.save(report);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "IMAGING_REPORT_SIGNED", "Signed imaging report " + reportId);
        }

        return mapToDTO(saved);
    }

    public ImagingReportResponseDTO mapToDTO(ImagingReport r) {
        ImagingReportResponseDTO dto = new ImagingReportResponseDTO();
        dto.setId(r.getId());
        if (r.getStudy() != null) dto.setStudyId(r.getStudy().getId());
        if (r.getRadiologist() != null && r.getRadiologist().getPerson() != null) {
            dto.setRadiologistName(r.getRadiologist().getPerson().getFullName());
        }
        dto.setReportStatus(r.getReportStatus());
        dto.setFindings(r.getFindings());
        dto.setImpression(r.getImpression());
        dto.setReportedAt(r.getReportedAt());
        return dto;
    }
}
