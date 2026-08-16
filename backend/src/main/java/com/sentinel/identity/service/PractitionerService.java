package com.sentinel.identity.service;

import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.identity.dto.*;
import com.sentinel.identity.entity.Person;
import com.sentinel.identity.entity.Practitioner;
import com.sentinel.identity.entity.PractitionerLicense;
import com.sentinel.identity.entity.PractitionerSpecialty;
import com.sentinel.identity.repository.PersonRepository;
import com.sentinel.identity.repository.PractitionerLicenseRepository;
import com.sentinel.identity.repository.PractitionerRepository;
import com.sentinel.identity.repository.PractitionerSpecialtyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PractitionerService {

    private final PractitionerRepository practitionerRepository;
    private final PersonRepository personRepository;
    private final PractitionerSpecialtyRepository specialtyRepository;
    private final PractitionerLicenseRepository licenseRepository;

    public PractitionerService(PractitionerRepository practitionerRepository,
                               PersonRepository personRepository,
                               PractitionerSpecialtyRepository specialtyRepository,
                               PractitionerLicenseRepository licenseRepository) {
        this.practitionerRepository = practitionerRepository;
        this.personRepository = personRepository;
        this.specialtyRepository = specialtyRepository;
        this.licenseRepository = licenseRepository;
    }

    public PractitionerResponseDTO createPractitioner(CreatePractitionerRequest request) {
        Person person = new Person();
        person.setFirstName(request.getFirstName());
        person.setLastName(request.getLastName());
        person.setMiddleName(request.getMiddleName());
        person.setSexAtBirth(request.getGender());
        person.setCreatedAt(OffsetDateTime.now());
        person.setUpdatedAt(OffsetDateTime.now());
        Person savedPerson = personRepository.save(person);

        Practitioner practitioner = new Practitioner();
        practitioner.setPerson(savedPerson);
        practitioner.setIdentifier(request.getIdentifier() != null ? request.getIdentifier() : "DOC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        practitioner.setPractitionerType(request.getPractitionerType() != null ? request.getPractitionerType() : "DOCTOR");
        practitioner.setPrimarySpecialty(request.getPrimarySpecialty());
        practitioner.setStatus("ACTIVE");
        practitioner.setCreatedAt(OffsetDateTime.now());
        practitioner.setUpdatedAt(OffsetDateTime.now());

        Practitioner saved = practitionerRepository.save(practitioner);

        if (request.getPrimarySpecialty() != null) {
            PractitionerSpecialty specialty = new PractitionerSpecialty();
            specialty.setPractitioner(saved);
            specialty.setSpecialtyCode(request.getPrimarySpecialty());
            specialty.setSpecialtyName(request.getPrimarySpecialty());
            specialty.setIsPrimary(true);
            specialtyRepository.save(specialty);
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public PractitionerResponseDTO getPractitioner(UUID practitionerId) {
        Practitioner practitioner = practitionerRepository.findById(practitionerId)
                .orElseThrow(() -> new ResourceNotFoundException("Practitioner not found with id: " + practitionerId));
        return mapToDTO(practitioner);
    }

    @Transactional(readOnly = true)
    public List<PractitionerResponseDTO> searchPractitioners(PractitionerSearchCriteria criteria) {
        List<Practitioner> list;
        if (criteria != null && (criteria.getQuery() != null || criteria.getSpecialty() != null || criteria.getStatus() != null || criteria.getOrganizationId() != null)) {
            list = practitionerRepository.search(criteria.getQuery(), criteria.getSpecialty(), criteria.getStatus(), criteria.getOrganizationId());
        } else {
            list = practitionerRepository.findAll();
        }
        return list.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public PractitionerResponseDTO updatePractitioner(UUID practitionerId, UpdatePractitionerRequest request) {
        Practitioner practitioner = practitionerRepository.findById(practitionerId)
                .orElseThrow(() -> new ResourceNotFoundException("Practitioner not found with id: " + practitionerId));

        if (request.getPractitionerType() != null) practitioner.setPractitionerType(request.getPractitionerType());
        if (request.getPrimarySpecialty() != null) practitioner.setPrimarySpecialty(request.getPrimarySpecialty());
        if (request.getStatus() != null) practitioner.setStatus(request.getStatus());
        practitioner.setUpdatedAt(OffsetDateTime.now());

        Practitioner saved = practitionerRepository.save(practitioner);
        return mapToDTO(saved);
    }

    public PractitionerResponseDTO addSpecialty(UUID practitionerId, AddSpecialtyRequest request) {
        Practitioner practitioner = practitionerRepository.findById(practitionerId)
                .orElseThrow(() -> new ResourceNotFoundException("Practitioner not found with id: " + practitionerId));

        PractitionerSpecialty specialty = new PractitionerSpecialty();
        specialty.setPractitioner(practitioner);
        specialty.setSpecialtyCode(request.getSpecialtyCode());
        specialty.setSpecialtyName(request.getSpecialtyName());
        specialty.setIsPrimary(request.getIsPrimary() != null ? request.getIsPrimary() : false);
        specialtyRepository.save(specialty);

        if (Boolean.TRUE.equals(request.getIsPrimary())) {
            practitioner.setPrimarySpecialty(request.getSpecialtyName() != null ? request.getSpecialtyName() : request.getSpecialtyCode());
            practitionerRepository.save(practitioner);
        }

        return mapToDTO(practitioner);
    }

    public PractitionerResponseDTO addLicense(UUID practitionerId, AddLicenseRequest request) {
        Practitioner practitioner = practitionerRepository.findById(practitionerId)
                .orElseThrow(() -> new ResourceNotFoundException("Practitioner not found with id: " + practitionerId));

        PractitionerLicense license = new PractitionerLicense();
        license.setPractitioner(practitioner);
        license.setLicenseNumber(request.getLicenseNumber());
        license.setIssuingAuthority(request.getIssuingAuthority());
        license.setState(request.getState());
        license.setValidFrom(request.getValidFrom());
        license.setValidTo(request.getValidTo());
        licenseRepository.save(license);

        return mapToDTO(practitioner);
    }

    public PractitionerResponseDTO mapToDTO(Practitioner practitioner) {
        PractitionerResponseDTO dto = new PractitionerResponseDTO();
        dto.setId(practitioner.getId());
        dto.setIdentifier(practitioner.getIdentifier());
        dto.setPractitionerType(practitioner.getPractitionerType());
        dto.setPrimarySpecialty(practitioner.getPrimarySpecialty());
        dto.setStatus(practitioner.getStatus());
        dto.setCreatedAt(practitioner.getCreatedAt());
        dto.setUpdatedAt(practitioner.getUpdatedAt());

        if (practitioner.getPerson() != null) {
            dto.setPersonId(practitioner.getPerson().getId());
            dto.setFirstName(practitioner.getPerson().getFirstName());
            dto.setLastName(practitioner.getPerson().getLastName());
            dto.setMiddleName(practitioner.getPerson().getMiddleName());
            dto.setFullName(practitioner.getPerson().getFullName());
            dto.setGender(practitioner.getPerson().getSexAtBirth());
        }

        List<PractitionerSpecialty> specialties = specialtyRepository.findByPractitionerId(practitioner.getId());
        dto.setSpecialties(specialties.stream()
                .map(s -> new PractitionerResponseDTO.SpecialtyDTO(s.getId(), s.getSpecialtyCode(), s.getSpecialtyName(), s.getIsPrimary()))
                .collect(Collectors.toList()));

        List<PractitionerLicense> licenses = licenseRepository.findByPractitionerId(practitioner.getId());
        dto.setLicenses(licenses.stream()
                .map(l -> new PractitionerResponseDTO.LicenseDTO(l.getId(), l.getLicenseNumber(), l.getIssuingAuthority(), l.getState(), l.getValidFrom(), l.getValidTo()))
                .collect(Collectors.toList()));

        return dto;
    }
}
