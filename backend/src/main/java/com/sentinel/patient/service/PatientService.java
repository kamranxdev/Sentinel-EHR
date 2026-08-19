package com.sentinel.patient.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.identity.entity.Person;
import com.sentinel.identity.repository.PersonRepository;
import com.sentinel.patient.dto.PatientResponseDTO;
import com.sentinel.patient.dto.PatientSearchCriteria;
import com.sentinel.patient.dto.RegisterPatientRequest;
import com.sentinel.patient.dto.UpdatePatientRequest;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.entity.PatientAddress;
import com.sentinel.patient.entity.PatientDemographics;
import com.sentinel.patient.entity.PatientOrganization;
import com.sentinel.patient.repository.PatientAddressRepository;
import com.sentinel.patient.repository.PatientDemographicsRepository;
import com.sentinel.patient.repository.PatientOrganizationRepository;
import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.tenancy.entity.Organization;
import com.sentinel.tenancy.repository.OrganizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.sentinel.patient.repository.PatientPhoneNumberRepository;
import com.sentinel.patient.repository.PatientEmailAddressRepository;

@Service
@Transactional
public class PatientService {

    private final PatientRepository patientRepository;
    private final PersonRepository personRepository;
    private final PatientDemographicsRepository demographicsRepository;
    private final PatientOrganizationRepository patientOrganizationRepository;
    private final PatientAddressRepository patientAddressRepository;
    private final PatientPhoneNumberRepository patientPhoneNumberRepository;
    private final PatientEmailAddressRepository patientEmailAddressRepository;
    private final OrganizationRepository organizationRepository;
    private final AuditService auditService;

    public PatientService(PatientRepository patientRepository,
                          PersonRepository personRepository,
                          PatientDemographicsRepository demographicsRepository,
                          PatientOrganizationRepository patientOrganizationRepository,
                          PatientAddressRepository patientAddressRepository,
                          PatientPhoneNumberRepository patientPhoneNumberRepository,
                          PatientEmailAddressRepository patientEmailAddressRepository,
                          OrganizationRepository organizationRepository,
                          AuditService auditService) {
        this.patientRepository = patientRepository;
        this.personRepository = personRepository;
        this.demographicsRepository = demographicsRepository;
        this.patientOrganizationRepository = patientOrganizationRepository;
        this.patientAddressRepository = patientAddressRepository;
        this.patientPhoneNumberRepository = patientPhoneNumberRepository;
        this.patientEmailAddressRepository = patientEmailAddressRepository;
        this.organizationRepository = organizationRepository;
        this.auditService = auditService;
    }

    public PatientResponseDTO registerPatient(UUID organizationId, RegisterPatientRequest request) {
        UUID effectiveOrgId = organizationId != null ? organizationId : request.getOrganizationId();
        Organization org = null;
        if (effectiveOrgId != null) {
            org = organizationRepository.findById(effectiveOrgId)
                    .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + effectiveOrgId));
        }

        Person person = new Person();
        person.setFirstName(request.getFirstName());
        person.setLastName(request.getLastName());
        person.setMiddleName(request.getMiddleName());
        person.setSexAtBirth(request.getGender());
        person.setDateOfBirth(request.getDateOfBirth());
        person.setPhone(request.getPhone());
        person.setEmail(request.getEmail());
        person.setCreatedAt(OffsetDateTime.now());
        person.setUpdatedAt(OffsetDateTime.now());
        Person savedPerson = personRepository.save(person);

        Patient patient = new Patient();
        patient.setPerson(savedPerson);
        patient.setStatus("ACTIVE");
        patient.setCreatedAt(OffsetDateTime.now());
        patient.setUpdatedAt(OffsetDateTime.now());
        Patient savedPatient = patientRepository.save(patient);

        if (request.getBloodGroup() != null || request.getRhFactor() != null) {
            PatientDemographics demographics = new PatientDemographics();
            demographics.setPatient(savedPatient);
            demographics.setBloodGroup(request.getBloodGroup());
            demographics.setRhFactor(request.getRhFactor());
            demographicsRepository.save(demographics);
        }

        if (org != null) {
            String mrn = request.getMrn() != null && !request.getMrn().isBlank()
                    ? request.getMrn()
                    : "MRN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

            PatientOrganization po = new PatientOrganization();
            po.setPatient(savedPatient);
            po.setOrganization(org);
            po.setMrn(mrn);
            po.setPatientStatus("ACTIVE");
            po.setRegisteredAt(OffsetDateTime.now());

            patientOrganizationRepository.save(po);
        }

        if (request.getAddressLine1() != null) {
            PatientAddress address = new PatientAddress();
            address.setPatient(savedPatient);
            address.setAddressLine1(request.getAddressLine1());
            address.setCity(request.getCity());
            address.setState(request.getState());
            address.setPostalCode(request.getPostalCode());
            address.setIsPrimary(true);
            patientAddressRepository.save(address);
        }

        if (auditService != null) {
            auditService.logEvent(savedPatient.getId(), "PATIENT_CREATED", "Patient registered successfully: " + savedPatient.getId());
        }

        return mapToDTO(savedPatient);
    }

    @Transactional(readOnly = true)
    public PatientResponseDTO getPatient(UUID patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));
        return mapToDTO(patient);
    }

    @Transactional(readOnly = true)
    public List<PatientResponseDTO> searchPatients(PatientSearchCriteria criteria) {
        List<Patient> list;
        if (criteria != null && (criteria.getQuery() != null || criteria.getMrn() != null || criteria.getPhone() != null || criteria.getStatus() != null || criteria.getOrganizationId() != null)) {
            list = patientRepository.searchPatients(criteria.getQuery(), criteria.getMrn(), criteria.getPhone(), criteria.getStatus(), criteria.getOrganizationId());
        } else {
            list = patientRepository.findAll();
        }
        return list.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public PatientResponseDTO updatePatient(UUID patientId, UpdatePatientRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        if (request.getStatus() != null) patient.setStatus(request.getStatus());
        if (request.getDeceasedAt() != null) patient.setDeceasedAt(request.getDeceasedAt());

        Person person = patient.getPerson();
        if (person != null) {
            if (request.getFirstName() != null) person.setFirstName(request.getFirstName());
            if (request.getLastName() != null) person.setLastName(request.getLastName());
            if (request.getMiddleName() != null) person.setMiddleName(request.getMiddleName());
            if (request.getGender() != null) person.setSexAtBirth(request.getGender());
            if (request.getDateOfBirth() != null) person.setDateOfBirth(request.getDateOfBirth());
            person.setUpdatedAt(OffsetDateTime.now());
            personRepository.save(person);
        }

        patient.setUpdatedAt(OffsetDateTime.now());
        Patient saved = patientRepository.save(patient);
        return mapToDTO(saved);
    }

    public PatientResponseDTO mapToDTO(Patient patient) {
        PatientResponseDTO dto = new PatientResponseDTO();
        dto.setId(patient.getId());
        dto.setStatus(patient.getStatus());
        dto.setDeceasedAt(patient.getDeceasedAt());
        dto.setCreatedAt(patient.getCreatedAt());
        dto.setUpdatedAt(patient.getUpdatedAt());

        if (patient.getPerson() != null) {
            Person p = patient.getPerson();
            dto.setPersonId(p.getId());
            dto.setFirstName(p.getFirstName());
            dto.setLastName(p.getLastName());
            dto.setMiddleName(p.getMiddleName());
            dto.setFullName(p.getFullName());
            dto.setGender(p.getSexAtBirth());
            dto.setDateOfBirth(p.getDateOfBirth());
        }

        patientPhoneNumberRepository.findByPatientId(patient.getId()).stream().filter(ph -> Boolean.TRUE.equals(ph.getIsPrimary())).findFirst().ifPresentOrElse(
            ph -> dto.setPhone(ph.getPhoneNumber()),
            () -> patientPhoneNumberRepository.findByPatientId(patient.getId()).stream().findFirst().ifPresent(ph -> dto.setPhone(ph.getPhoneNumber()))
        );

        patientEmailAddressRepository.findByPatientId(patient.getId()).stream().filter(e -> Boolean.TRUE.equals(e.getIsPrimary())).findFirst().ifPresentOrElse(
            e -> dto.setEmail(e.getEmail()),
            () -> patientEmailAddressRepository.findByPatientId(patient.getId()).stream().findFirst().ifPresent(e -> dto.setEmail(e.getEmail()))
        );

        demographicsRepository.findByPatientId(patient.getId()).ifPresent(demo -> {
            dto.setBloodGroup(demo.getBloodGroup());
            dto.setRhFactor(demo.getRhFactor());
        });

        List<PatientOrganization> orgs = patientOrganizationRepository.findByPatientId(patient.getId());
        if (!orgs.isEmpty()) {
            dto.setMrn(orgs.get(0).getMrn());
        }

        return dto;
    }
}
