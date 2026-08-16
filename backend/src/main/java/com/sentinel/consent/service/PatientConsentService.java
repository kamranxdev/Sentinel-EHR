package com.sentinel.consent.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.consent.dto.CreatePatientConsentRequest;
import com.sentinel.consent.dto.PatientConsentResponseDTO;
import com.sentinel.consent.dto.RevokeConsentRequest;
import com.sentinel.consent.entity.ConsentType;
import com.sentinel.consent.entity.ConsentVersion;
import com.sentinel.consent.entity.PatientConsent;
import com.sentinel.consent.repository.ConsentTypeRepository;
import com.sentinel.consent.repository.ConsentVersionRepository;
import com.sentinel.consent.repository.PatientConsentRepository;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.tenancy.repository.OrganizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PatientConsentService {

    private final PatientConsentRepository patientConsentRepository;
    private final ConsentVersionRepository consentVersionRepository;
    private final ConsentTypeRepository consentTypeRepository;
    private final PatientRepository patientRepository;
    private final OrganizationRepository organizationRepository;
    private final AuditService auditService;

    public PatientConsentService(PatientConsentRepository patientConsentRepository,
                                 ConsentVersionRepository consentVersionRepository,
                                 ConsentTypeRepository consentTypeRepository,
                                 PatientRepository patientRepository,
                                 OrganizationRepository organizationRepository,
                                 AuditService auditService) {
        this.patientConsentRepository = patientConsentRepository;
        this.consentVersionRepository = consentVersionRepository;
        this.consentTypeRepository = consentTypeRepository;
        this.patientRepository = patientRepository;
        this.organizationRepository = organizationRepository;
        this.auditService = auditService;
    }

    public PatientConsentResponseDTO grantConsent(UUID patientId, CreatePatientConsentRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        ConsentType consentType = consentTypeRepository.findById(request.getConsentTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Consent type not found with id: " + request.getConsentTypeId()));

        PatientConsent consent = new PatientConsent();
        consent.setPatient(patient);
        consent.setConsentType(consentType);
        if (request.getOrganizationId() != null) {
            organizationRepository.findById(request.getOrganizationId()).ifPresent(consent::setOrganization);
        } else {
            organizationRepository.findAll().stream().findFirst().ifPresent(consent::setOrganization);
        }
        consent.setStatus("GRANTED");
        consent.setGrantedAt(OffsetDateTime.now());
        consent.setScope(request.getScope());
        consent.setNotes(request.getNotes());

        PatientConsent saved = patientConsentRepository.save(consent);

        ConsentVersion version = new ConsentVersion();
        version.setPatientConsent(saved);
        version.setVersionNumber(1);
        version.setCreatedAt(OffsetDateTime.now());
        consentVersionRepository.save(version);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "CONSENT_GRANTED", "Granted consent " + consentType.getCode() + " for patient " + patientId);
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<PatientConsentResponseDTO> getPatientConsents(UUID patientId) {
        return patientConsentRepository.findByPatientId(patientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PatientConsentResponseDTO getConsent(UUID consentId) {
        PatientConsent consent = patientConsentRepository.findById(consentId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient consent not found with id: " + consentId));
        return mapToDTO(consent);
    }

    public PatientConsentResponseDTO revokeConsent(UUID consentId, RevokeConsentRequest request) {
        PatientConsent consent = patientConsentRepository.findById(consentId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient consent not found with id: " + consentId));

        consent.setStatus("REVOKED");
        consent.setRevokedAt(OffsetDateTime.now());
        if (request != null && request.getReason() != null) {
            consent.setNotes((consent.getNotes() != null ? consent.getNotes() + " | Revocation: " : "Revocation: ") + request.getReason());
        }

        PatientConsent saved = patientConsentRepository.save(consent);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "CONSENT_REVOKED", "Revoked consent " + consentId);
        }

        return mapToDTO(saved);
    }

    public PatientConsentResponseDTO mapToDTO(PatientConsent c) {
        PatientConsentResponseDTO dto = new PatientConsentResponseDTO();
        dto.setId(c.getId());
        if (c.getPatient() != null) {
            dto.setPatientId(c.getPatient().getId());
            dto.setPatientName(c.getPatient().getFullName());
        }
        if (c.getOrganization() != null) dto.setOrganizationId(c.getOrganization().getId());
        if (c.getConsentType() != null) {
            dto.setConsentTypeId(c.getConsentType().getId());
            dto.setConsentTypeCode(c.getConsentType().getCode());
            dto.setConsentTypeName(c.getConsentType().getName());
        }
        dto.setStatus(c.getStatus());
        dto.setGrantedAt(c.getGrantedAt());
        dto.setRevokedAt(c.getRevokedAt());
        if (c.getGrantedBy() != null) dto.setGrantedByUsername(c.getGrantedBy().getUsername());
        dto.setScope(c.getScope());
        dto.setNotes(c.getNotes());
        return dto;
    }
}
