package com.sentinel.tenancy.service;

import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.tenancy.dto.CreateFacilityRequest;
import com.sentinel.tenancy.dto.FacilityResponseDTO;
import com.sentinel.tenancy.dto.UpdateFacilityRequest;
import com.sentinel.tenancy.entity.Facility;
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
public class FacilityService {

    private final FacilityRepository facilityRepository;
    private final OrganizationRepository organizationRepository;

    public FacilityService(FacilityRepository facilityRepository, OrganizationRepository organizationRepository) {
        this.facilityRepository = facilityRepository;
        this.organizationRepository = organizationRepository;
    }

    public FacilityResponseDTO createFacility(UUID organizationId, CreateFacilityRequest request) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + organizationId));

        if (facilityRepository.existsByOrganizationIdAndCode(organizationId, request.getCode())) {
            throw new IllegalArgumentException("Facility code already exists in organization: " + request.getCode());
        }

        Facility facility = new Facility();
        facility.setOrganization(org);
        facility.setCode(request.getCode());
        facility.setName(request.getName());
        facility.setFacilityType(request.getFacilityType());
        facility.setAddressLine1(request.getAddressLine1());
        facility.setAddressLine2(request.getAddressLine2());
        facility.setLandmark(request.getLandmark());
        facility.setCity(request.getCity());
        facility.setDistrict(request.getDistrict());
        facility.setState(request.getState());
        facility.setPostalCode(request.getPostalCode());
        if (request.getCountryCode() != null) facility.setCountryCode(request.getCountryCode());
        facility.setPhone(request.getPhone());
        facility.setEmail(request.getEmail());
        facility.setTimezone(request.getTimezone() != null ? request.getTimezone() : org.getTimezone());
        facility.setStatus("ACTIVE");
        facility.setCreatedAt(OffsetDateTime.now());
        facility.setUpdatedAt(OffsetDateTime.now());

        Facility saved = facilityRepository.save(facility);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<FacilityResponseDTO> getFacilities(UUID organizationId) {
        return facilityRepository.findByOrganizationId(organizationId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FacilityResponseDTO getFacility(UUID facilityId) {
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + facilityId));
        return mapToDTO(facility);
    }

    public FacilityResponseDTO updateFacility(UUID facilityId, UpdateFacilityRequest request) {
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + facilityId));

        if (request.getName() != null) facility.setName(request.getName());
        if (request.getFacilityType() != null) facility.setFacilityType(request.getFacilityType());
        if (request.getAddressLine1() != null) facility.setAddressLine1(request.getAddressLine1());
        if (request.getAddressLine2() != null) facility.setAddressLine2(request.getAddressLine2());
        if (request.getLandmark() != null) facility.setLandmark(request.getLandmark());
        if (request.getCity() != null) facility.setCity(request.getCity());
        if (request.getDistrict() != null) facility.setDistrict(request.getDistrict());
        if (request.getState() != null) facility.setState(request.getState());
        if (request.getPostalCode() != null) facility.setPostalCode(request.getPostalCode());
        if (request.getCountryCode() != null) facility.setCountryCode(request.getCountryCode());
        if (request.getPhone() != null) facility.setPhone(request.getPhone());
        if (request.getEmail() != null) facility.setEmail(request.getEmail());
        if (request.getTimezone() != null) facility.setTimezone(request.getTimezone());
        if (request.getStatus() != null) facility.setStatus(request.getStatus());
        facility.setUpdatedAt(OffsetDateTime.now());

        Facility saved = facilityRepository.save(facility);
        return mapToDTO(saved);
    }

    public void deactivateFacility(UUID facilityId) {
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + facilityId));
        facility.setStatus("INACTIVE");
        facility.setUpdatedAt(OffsetDateTime.now());
        facilityRepository.save(facility);
    }

    public FacilityResponseDTO mapToDTO(Facility facility) {
        FacilityResponseDTO dto = new FacilityResponseDTO();
        dto.setId(facility.getId());
        if (facility.getOrganization() != null) {
            dto.setOrganizationId(facility.getOrganization().getId());
            dto.setOrganizationName(facility.getOrganization().getName());
        }
        dto.setCode(facility.getCode());
        dto.setName(facility.getName());
        dto.setFacilityType(facility.getFacilityType());
        dto.setAddressLine1(facility.getAddressLine1());
        dto.setAddressLine2(facility.getAddressLine2());
        dto.setLandmark(facility.getLandmark());
        dto.setCity(facility.getCity());
        dto.setDistrict(facility.getDistrict());
        dto.setState(facility.getState());
        dto.setPostalCode(facility.getPostalCode());
        dto.setCountryCode(facility.getCountryCode());
        dto.setPhone(facility.getPhone());
        dto.setEmail(facility.getEmail());
        dto.setTimezone(facility.getTimezone());
        dto.setStatus(facility.getStatus());
        dto.setCreatedAt(facility.getCreatedAt());
        dto.setUpdatedAt(facility.getUpdatedAt());
        return dto;
    }
}
