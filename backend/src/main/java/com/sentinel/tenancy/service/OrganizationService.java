package com.sentinel.tenancy.service;

import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.identity.entity.Person;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.entity.UserOrganization;
import com.sentinel.identity.repository.PersonRepository;
import com.sentinel.identity.repository.UserOrganizationRepository;
import com.sentinel.identity.repository.UserRepository;
import com.sentinel.security.entity.Role;
import com.sentinel.security.repository.RoleRepository;
import com.sentinel.tenancy.dto.CreateOrganizationRequest;
import com.sentinel.tenancy.dto.OrganizationResponseDTO;
import com.sentinel.tenancy.dto.OrganizationSearchCriteria;
import com.sentinel.tenancy.dto.OrganizationDashboardStatsDTO;
import com.sentinel.tenancy.dto.UpdateOrganizationRequest;
import com.sentinel.tenancy.entity.Organization;
import com.sentinel.tenancy.repository.BedRepository;
import com.sentinel.tenancy.repository.DepartmentRepository;
import com.sentinel.tenancy.repository.OrganizationRepository;
import com.sentinel.tenancy.repository.WardRepository;
import com.sentinel.patient.repository.PatientOrganizationRepository;
import com.sentinel.scheduling.repository.AppointmentRepository;
import com.sentinel.clinical.repository.EncounterRepository;
import com.sentinel.security.TenantContext;
import com.sentinel.common.exception.AccessDeniedCustomException;
import com.sentinel.security.security.SecurityContextUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final PersonRepository personRepository;
    private final RoleRepository roleRepository;
    private final UserOrganizationRepository userOrganizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final DepartmentRepository departmentRepository;
    private final WardRepository wardRepository;
    private final BedRepository bedRepository;
    private final PatientOrganizationRepository patientOrganizationRepository;
    private final AppointmentRepository appointmentRepository;
    private final EncounterRepository encounterRepository;

    public OrganizationService(OrganizationRepository organizationRepository,
                               UserRepository userRepository,
                               PersonRepository personRepository,
                               RoleRepository roleRepository,
                               UserOrganizationRepository userOrganizationRepository,
                               PasswordEncoder passwordEncoder,
                               DepartmentRepository departmentRepository,
                               WardRepository wardRepository,
                               BedRepository bedRepository,
                               PatientOrganizationRepository patientOrganizationRepository,
                               AppointmentRepository appointmentRepository,
                               EncounterRepository encounterRepository) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.personRepository = personRepository;
        this.roleRepository = roleRepository;
        this.userOrganizationRepository = userOrganizationRepository;
        this.passwordEncoder = passwordEncoder;
        this.departmentRepository = departmentRepository;
        this.wardRepository = wardRepository;
        this.bedRepository = bedRepository;
        this.patientOrganizationRepository = patientOrganizationRepository;
        this.appointmentRepository = appointmentRepository;
        this.encounterRepository = encounterRepository;
    }

    public OrganizationResponseDTO createOrganization(CreateOrganizationRequest request) {
        String code = request.getCode();
        String name = request.getName();

        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Organization code is required");
        }
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Organization name is required");
        }

        if (organizationRepository.existsByCode(code)) {
            throw new IllegalArgumentException("Organization code already exists: " + code);
        }
        if (organizationRepository.existsByName(name)) {
            throw new IllegalArgumentException("Organization name already exists: " + name);
        }

        Organization org = new Organization();
        org.setCode(code.trim().toUpperCase());
        org.setName(name.trim());
        org.setLegalName(request.getLegalName() != null ? request.getLegalName().trim() : name.trim());
        org.setOrganizationType(request.getOrganizationType() != null ? request.getOrganizationType() : "HOSPITAL");
        if (request.getTimezone() != null) org.setTimezone(request.getTimezone());
        if (request.getCountryCode() != null) org.setCountryCode(request.getCountryCode());
        org.setPhone(request.getPhone());
        org.setEmail(request.getEmail());
        org.setWebsite(request.getWebsite());
        org.setAddressLine1(request.getAddressLine1());
        org.setAddressLine2(request.getAddressLine2());
        org.setLandmark(request.getLandmark());
        org.setCity(request.getCity());
        org.setDistrict(request.getDistrict());
        org.setState(request.getState());
        org.setPostalCode(request.getPostalCode());
        org.setStatus("ACTIVE");
        org.setCreatedAt(OffsetDateTime.now());
        org.setUpdatedAt(OffsetDateTime.now());

        Organization saved = organizationRepository.save(org);

        // Provision Primary Administrator Account if provided
        String adminEmail = request.getAdminEmail() != null && !request.getAdminEmail().isBlank()
                ? request.getAdminEmail().trim()
                : (request.getAdminEmail() != null && !request.getAdminEmail().isBlank() ? request.getAdminEmail().trim() : null);

        if (adminEmail != null) {
            if (userRepository.existsByEmail(adminEmail)) {
                throw new IllegalArgumentException("Admin email already in use: " + adminEmail);
            }

            Person person = new Person();
            String fullName = request.getAdminFullName() != null && !request.getAdminFullName().isBlank()
                    ? request.getAdminFullName().trim()
                    : adminEmail;
            person.setFirstName(fullName);
            person.setEmail(adminEmail);
            person.setPhone(request.getPhone());
            person.setCreatedAt(OffsetDateTime.now());
            person.setUpdatedAt(OffsetDateTime.now());
            Person savedPerson = personRepository.save(person);

            User user = new User();
            user.setEmail(adminEmail);
            if (request.getAdminPassword() == null || request.getAdminPassword().isBlank()) {
                throw new IllegalArgumentException("Administrator password is required");
            }
            String rawPassword = request.getAdminPassword();
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setPerson(savedPerson);
            user.setStatus("ACTIVE");
            user.setMfaEnabled(false);
            user.setCreatedAt(OffsetDateTime.now());
            user.setUpdatedAt(OffsetDateTime.now());

            Role orgAdminRole = roleRepository.findByName("ORGANIZATION_ADMIN")
                    .orElseGet(() -> roleRepository.save(new Role("ORGANIZATION_ADMIN", "Organization Administrator")));
            user.getRoles().add(orgAdminRole);

            User savedUser = userRepository.save(user);

            UserOrganization uo = new UserOrganization();
            uo.setUser(savedUser);
            uo.setOrganization(saved);
            uo.setStatus("ACTIVE");
            uo.setJoinedAt(LocalDate.now());
            userOrganizationRepository.save(uo);
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<OrganizationResponseDTO> getOrganizations(OrganizationSearchCriteria criteria) {
        List<Organization> orgs;
        if (criteria != null && (criteria.getQuery() != null || criteria.getStatus() != null || criteria.getOrganizationType() != null)) {
            orgs = organizationRepository.searchOrganizations(criteria.getQuery(), criteria.getStatus(), criteria.getOrganizationType());
        } else {
            orgs = organizationRepository.findAll();
        }
        return orgs.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrganizationResponseDTO getOrganization(UUID organizationId) {
        assertOrganizationAccess(organizationId);
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + organizationId));
        return mapToDTO(org);
    }

    public OrganizationResponseDTO updateOrganization(UUID organizationId, UpdateOrganizationRequest request) {
        assertOrganizationAccess(organizationId);
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + organizationId));

        if (request.getName() != null) org.setName(request.getName());
        if (request.getLegalName() != null) org.setLegalName(request.getLegalName());
        if (request.getOrganizationType() != null) org.setOrganizationType(request.getOrganizationType());
        if (request.getTimezone() != null) org.setTimezone(request.getTimezone());
        if (request.getCountryCode() != null) org.setCountryCode(request.getCountryCode());
        if (request.getPhone() != null) org.setPhone(request.getPhone());
        if (request.getEmail() != null) org.setEmail(request.getEmail());
        if (request.getWebsite() != null) org.setWebsite(request.getWebsite());
        if (request.getAddressLine1() != null) org.setAddressLine1(request.getAddressLine1());
        if (request.getAddressLine2() != null) org.setAddressLine2(request.getAddressLine2());
        if (request.getLandmark() != null) org.setLandmark(request.getLandmark());
        if (request.getCity() != null) org.setCity(request.getCity());
        if (request.getDistrict() != null) org.setDistrict(request.getDistrict());
        if (request.getState() != null) org.setState(request.getState());
        if (request.getPostalCode() != null) org.setPostalCode(request.getPostalCode());
        if (request.getStatus() != null) org.setStatus(request.getStatus());
        org.setUpdatedAt(OffsetDateTime.now());

        Organization saved = organizationRepository.save(org);
        return mapToDTO(saved);
    }

    public void deactivateOrganization(UUID organizationId) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + organizationId));
        org.setStatus("INACTIVE");
        org.setUpdatedAt(OffsetDateTime.now());
        organizationRepository.save(org);
    }

    private void assertOrganizationAccess(UUID organizationId) {
        if (SecurityContextUtils.hasAuthority("SUPER_ADMIN")) {
            return;
        }
        UUID currentOrganizationId = TenantContext.getCurrentOrganizationId();
        if (currentOrganizationId == null || !organizationId.equals(currentOrganizationId)) {
            throw new AccessDeniedCustomException("You cannot access another organization");
        }
    }

    @Transactional(readOnly = true)
    public OrganizationResponseDTO getCurrentOrganization() {
        UUID organizationId = TenantContext.getCurrentOrganizationId();
        if (organizationId == null) {
            throw new AccessDeniedCustomException("An active organization context is required");
        }
        return getOrganization(organizationId);
    }

    public OrganizationResponseDTO updateCurrentOrganization(UpdateOrganizationRequest request) {
        UUID organizationId = TenantContext.getCurrentOrganizationId();
        if (organizationId == null) {
            throw new AccessDeniedCustomException("An active organization context is required");
        }
        return updateOrganization(organizationId, request);
    }

    @Transactional(readOnly = true)
    public OrganizationDashboardStatsDTO getCurrentOrganizationDashboard() {
        UUID organizationId = TenantContext.getCurrentOrganizationId();
        if (organizationId == null) {
            throw new AccessDeniedCustomException("An active organization context is required");
        }

        OrganizationDashboardStatsDTO stats = new OrganizationDashboardStatsDTO();
        stats.setTotalStaff(userOrganizationRepository.countByOrganizationIdAndStatus(organizationId, "ACTIVE"));
        stats.setActivePractitioners(userOrganizationRepository.countActivePractitionersByOrganizationId(organizationId));
        stats.setTotalDepartments(departmentRepository.countByOrganizationIdAndStatus(organizationId, "ACTIVE"));
        stats.setTotalWards(wardRepository.countByOrganizationIdAndStatus(organizationId, "ACTIVE"));
        long totalBeds = bedRepository.countByOrganizationId(organizationId);
        long occupiedBeds = bedRepository.countByOrganizationIdAndStatus(organizationId, "OCCUPIED");
        stats.setTotalBeds(totalBeds);
        stats.setOccupiedBeds(occupiedBeds);
        stats.setOccupancyRate(totalBeds == 0 ? 0 : Math.round((occupiedBeds * 10000.0) / totalBeds) / 100.0);
        stats.setRegisteredPatients(patientOrganizationRepository.countByOrganizationId(organizationId));
        long appointments = appointmentRepository.countByOrganizationId(organizationId);
        stats.setAppointments(appointments);
        stats.setCompletedAppointments(appointmentRepository.countByOrganizationIdAndStatus(organizationId, "COMPLETED"));
        stats.setActiveEncounters(encounterRepository.countByOrganizationIdAndStatus(organizationId, "IN_PROGRESS"));
        return stats;
    }

    public OrganizationResponseDTO mapToDTO(Organization org) {
        OrganizationResponseDTO dto = new OrganizationResponseDTO();
        dto.setId(org.getId());
        dto.setCode(org.getCode());
        dto.setName(org.getName());
        dto.setLegalName(org.getLegalName());
        dto.setOrganizationType(org.getOrganizationType());
        dto.setStatus(org.getStatus());
        dto.setTimezone(org.getTimezone());
        dto.setCountryCode(org.getCountryCode());
        dto.setPhone(org.getPhone());
        dto.setEmail(org.getEmail());
        dto.setWebsite(org.getWebsite());
        dto.setAddressLine1(org.getAddressLine1());
        dto.setAddressLine2(org.getAddressLine2());
        dto.setLandmark(org.getLandmark());
        dto.setCity(org.getCity());
        dto.setDistrict(org.getDistrict());
        dto.setState(org.getState());
        dto.setPostalCode(org.getPostalCode());
        dto.setCreatedAt(org.getCreatedAt());
        dto.setUpdatedAt(org.getUpdatedAt());
        return dto;
    }
}
