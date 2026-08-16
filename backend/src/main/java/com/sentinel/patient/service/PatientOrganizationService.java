package com.sentinel.patient.service;

import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.patient.dto.PatientOrganizationResponseDTO;
import com.sentinel.patient.dto.RegisterPatientOrganizationRequest;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.entity.PatientOrganization;
import com.sentinel.patient.repository.PatientOrganizationRepository;
import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.tenancy.entity.Organization;
import com.sentinel.tenancy.repository.FacilityRepository;
import com.sentinel.tenancy.repository.OrganizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PatientOrganizationService {

    private final PatientOrganizationRepository patientOrganizationRepository;
    private final PatientRepository patientRepository;
    private final OrganizationRepository organizationRepository;
    private final FacilityRepository facilityRepository;

    public PatientOrganizationService(PatientOrganizationRepository patientOrganizationRepository,
                                      PatientRepository patientRepository,
                                      OrganizationRepository organizationRepository,
                                      FacilityRepository facilityRepository) {
        this.patientOrganizationRepository = patientOrganizationRepository;
        this.patientRepository = patientRepository;
        this.organizationRepository = organizationRepository;
        this.facilityRepository = facilityRepository;
    }

    public PatientOrganizationResponseDTO registerPatientWithOrganization(UUID patientId, UUID organizationId, RegisterPatientOrganizationRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + organizationId));

        String mrn = (request != null && request.getMrn() != null && !request.getMrn().isBlank())
                ? request.getMrn()
                : "MRN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        PatientOrganization po = patientOrganizationRepository.findByPatientIdAndOrganizationId(patientId, organizationId)
                .orElseGet(() -> {
                    PatientOrganization newPo = new PatientOrganization();
                    newPo.setPatient(patient);
                    newPo.setOrganization(organization);
                    return newPo;
                });

        po.setMrn(mrn);
        po.setPatientStatus("ACTIVE");
        po.setRegisteredAt(OffsetDateTime.now());

        if (request != null && request.getPrimaryFacilityId() != null) {
            facilityRepository.findById(request.getPrimaryFacilityId()).ifPresent(po::setPrimaryFacility);
        }

        PatientOrganization saved = patientOrganizationRepository.save(po);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<PatientOrganizationResponseDTO> getPatientOrganizations(UUID patientId) {
        return patientOrganizationRepository.findByPatientId(patientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PatientOrganizationResponseDTO getOrganizationPatient(UUID organizationId, UUID patientId) {
        PatientOrganization po = patientOrganizationRepository.findByPatientIdAndOrganizationId(patientId, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient is not registered with organization"));
        return mapToDTO(po);
    }

    public PatientOrganizationResponseDTO mapToDTO(PatientOrganization po) {
        PatientOrganizationResponseDTO dto = new PatientOrganizationResponseDTO();
        dto.setId(po.getId());
        if (po.getPatient() != null) dto.setPatientId(po.getPatient().getId());
        if (po.getOrganization() != null) {
            dto.setOrganizationId(po.getOrganization().getId());
            dto.setOrganizationName(po.getOrganization().getName());
        }
        dto.setMrn(po.getMrn());
        dto.setPatientStatus(po.getPatientStatus());
        if (po.getPrimaryFacility() != null) {
            dto.setPrimaryFacilityId(po.getPrimaryFacility().getId());
            dto.setPrimaryFacilityName(po.getPrimaryFacility().getName());
        }
        dto.setRegisteredAt(po.getRegisteredAt());
        return dto;
    }
}
