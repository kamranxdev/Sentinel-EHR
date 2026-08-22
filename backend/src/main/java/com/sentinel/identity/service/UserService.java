package com.sentinel.identity.service;

import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.identity.dto.CreateUserRequest;
import com.sentinel.identity.dto.UpdateUserRequest;
import com.sentinel.identity.dto.UserResponseDTO;
import com.sentinel.identity.dto.UserSearchCriteria;
import com.sentinel.identity.entity.Person;
import com.sentinel.identity.entity.Practitioner;
import com.sentinel.identity.entity.PractitionerSpecialty;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.entity.UserOrganization;
import com.sentinel.identity.repository.PersonRepository;
import com.sentinel.identity.repository.PractitionerRepository;
import com.sentinel.identity.repository.PractitionerSpecialtyRepository;
import com.sentinel.identity.repository.UserOrganizationRepository;
import com.sentinel.identity.repository.UserRepository;
import com.sentinel.security.entity.Role;
import com.sentinel.security.repository.RoleRepository;
import com.sentinel.tenancy.entity.Organization;
import com.sentinel.tenancy.repository.OrganizationRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PersonRepository personRepository;
    private final RoleRepository roleRepository;
    private final OrganizationRepository organizationRepository;
    private final UserOrganizationRepository userOrganizationRepository;
    private final PractitionerRepository practitionerRepository;
    private final PractitionerSpecialtyRepository practitionerSpecialtyRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       PersonRepository personRepository,
                       RoleRepository roleRepository,
                       OrganizationRepository organizationRepository,
                       UserOrganizationRepository userOrganizationRepository,
                       PractitionerRepository practitionerRepository,
                       PractitionerSpecialtyRepository practitionerSpecialtyRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.personRepository = personRepository;
        this.roleRepository = roleRepository;
        this.organizationRepository = organizationRepository;
        this.userOrganizationRepository = userOrganizationRepository;
        this.practitionerRepository = practitionerRepository;
        this.practitionerSpecialtyRepository = practitionerSpecialtyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponseDTO createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already taken: " + request.getEmail());
        }

        String firstName = request.getFirstName();
        String lastName = request.getLastName();
        if ((firstName == null || firstName.isBlank()) && request.getFullName() != null && !request.getFullName().isBlank()) {
            String[] parts = request.getFullName().trim().split("\\s+", 2);
            firstName = parts[0];
            lastName = parts.length > 1 ? parts[1] : "";
        }

        Person person = new Person();
        person.setFirstName(firstName != null ? firstName : request.getEmail());
        person.setLastName(lastName);
        person.setMiddleName(request.getMiddleName());
        person.setSexAtBirth(request.getGender());
        person.setPhone(request.getPhone());
        person.setEmail(request.getEmail());
        person.setCreatedAt(OffsetDateTime.now());
        person.setUpdatedAt(OffsetDateTime.now());
        Person savedPerson = personRepository.save(person);

        User user = new User();
        user.setEmail(request.getEmail());
        String encodedPassword = passwordEncoder.encode(request.getPassword() != null ? request.getPassword() : "Sentinel@123");
        user.setPassword(encodedPassword);
        user.setPerson(savedPerson);
        user.setStatus("ACTIVE");
        user.setMfaEnabled(false);
        user.setCreatedAt(OffsetDateTime.now());
        user.setUpdatedAt(OffsetDateTime.now());

        if (request.getRoleNames() != null && !request.getRoleNames().isEmpty()) {
            Set<Role> roles = new HashSet<>();
            for (String roleName : request.getRoleNames()) {
                roleRepository.findByName(roleName).ifPresent(roles::add);
            }
            user.setRoles(roles);
        }

        User savedUser = userRepository.save(user);

        if (request.getOrganizationId() != null) {
            organizationRepository.findById(request.getOrganizationId()).ifPresent(org -> {
                UserOrganization uo = new UserOrganization();
                uo.setUser(savedUser);
                uo.setOrganization(org);
                uo.setStatus("ACTIVE");
                uo.setJoinedAt(LocalDate.now());
                userOrganizationRepository.save(uo);
            });
        }

        // Link/create Practitioner record for clinical staff if applicable
        boolean isClinical = request.getRoleNames() != null && request.getRoleNames().stream()
                .anyMatch(r -> r.contains("PHYSICIAN") || r.contains("DOCTOR") || r.contains("NURSE"));
        if (isClinical || request.getSpecialization() != null || request.getLicenseNumber() != null) {
            Practitioner practitioner = new Practitioner();
            practitioner.setPerson(savedPerson);
            practitioner.setIdentifier(request.getLicenseNumber() != null && !request.getLicenseNumber().isBlank()
                    ? request.getLicenseNumber()
                    : "PRAC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            practitioner.setPractitionerType(request.getRoleNames() != null && request.getRoleNames().contains("NURSE") ? "NURSE" : "DOCTOR");
            practitioner.setPrimarySpecialty(request.getSpecialization() != null && !request.getSpecialization().isBlank()
                    ? request.getSpecialization()
                    : (request.getDepartment() != null ? request.getDepartment() : "General Practice"));
            practitioner.setStatus("ACTIVE");
            practitioner.setCreatedAt(OffsetDateTime.now());
            practitioner.setUpdatedAt(OffsetDateTime.now());
            Practitioner savedPractitioner = practitionerRepository.save(practitioner);

            if (request.getSpecialization() != null && !request.getSpecialization().isBlank()) {
                PractitionerSpecialty specialty = new PractitionerSpecialty();
                specialty.setPractitioner(savedPractitioner);
                specialty.setSpecialtyCode(request.getSpecialization());
                specialty.setSpecialtyName(request.getSpecialization());
                specialty.setIsPrimary(true);
                practitionerSpecialtyRepository.save(specialty);
            }
        }

        return mapToDTO(savedUser);
    }

    @Transactional(readOnly = true)
    public UserResponseDTO getUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return mapToDTO(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponseDTO> getUsersByOrganization(UUID organizationId) {
        List<UserOrganization> userOrgs = userOrganizationRepository.findByOrganizationId(organizationId);
        return userOrgs.stream()
                .map(UserOrganization::getUser)
                .filter(Objects::nonNull)
                .distinct()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserResponseDTO> searchUsers(UserSearchCriteria criteria) {
        List<User> users = userRepository.findAll();
        List<UserResponseDTO> dtos = users.stream().map(this::mapToDTO).collect(Collectors.toList());

        if (criteria != null) {
            if (criteria.getQuery() != null && !criteria.getQuery().isBlank()) {
                String q = criteria.getQuery().toLowerCase().trim();
                dtos = dtos.stream().filter(u ->
                    (u.getEmail() != null && u.getEmail().toLowerCase().contains(q)) ||
                    (u.getFullName() != null && u.getFullName().toLowerCase().contains(q)) ||
                    (u.getFirstName() != null && u.getFirstName().toLowerCase().contains(q)) ||
                    (u.getLastName() != null && u.getLastName().toLowerCase().contains(q))
                ).collect(Collectors.toList());
            }
            if (criteria.getStatus() != null && !criteria.getStatus().isBlank()) {
                String st = criteria.getStatus().trim();
                dtos = dtos.stream().filter(u ->
                    u.getStatus() != null && u.getStatus().equalsIgnoreCase(st)
                ).collect(Collectors.toList());
            }
            if (criteria.getRole() != null && !criteria.getRole().isBlank()) {
                String r = criteria.getRole().trim();
                dtos = dtos.stream().filter(u ->
                    u.getRoles() != null && u.getRoles().contains(r)
                ).collect(Collectors.toList());
            }
            if (criteria.getOrganizationId() != null) {
                UUID orgId = criteria.getOrganizationId();
                dtos = dtos.stream().filter(u ->
                    u.getOrganizations() != null && u.getOrganizations().stream().anyMatch(org -> orgId.equals(org.getId()))
                ).collect(Collectors.toList());
            }
        }
        return dtos;
    }

    public UserResponseDTO updateUser(UUID userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getStatus() != null) user.setStatus(request.getStatus());
        if (request.getVerificationStatus() != null) user.setStatus(request.getVerificationStatus());
        if (request.getMfaEnabled() != null) user.setMfaEnabled(request.getMfaEnabled());

        Person person = user.getPerson();
        if (person != null) {
            String firstName = request.getFirstName();
            String lastName = request.getLastName();
            if ((firstName == null || firstName.isBlank()) && request.getFullName() != null && !request.getFullName().isBlank()) {
                String[] parts = request.getFullName().trim().split("\\s+", 2);
                firstName = parts[0];
                lastName = parts.length > 1 ? parts[1] : "";
            }

            if (firstName != null) person.setFirstName(firstName);
            if (lastName != null) person.setLastName(lastName);
            if (request.getMiddleName() != null) person.setMiddleName(request.getMiddleName());
            if (request.getGender() != null) person.setSexAtBirth(request.getGender());
            if (request.getPhone() != null) person.setPhone(request.getPhone());
            if (request.getEmail() != null) person.setEmail(request.getEmail());
            person.setUpdatedAt(OffsetDateTime.now());
            personRepository.save(person);

            // Update practitioner if present
            if (request.getSpecialization() != null || request.getLicenseNumber() != null) {
                practitionerRepository.findByPersonId(person.getId()).ifPresent(p -> {
                    if (request.getSpecialization() != null && !request.getSpecialization().isBlank()) {
                        p.setPrimarySpecialty(request.getSpecialization());
                    }
                    if (request.getLicenseNumber() != null && !request.getLicenseNumber().isBlank()) {
                        p.setIdentifier(request.getLicenseNumber());
                    }
                    p.setUpdatedAt(OffsetDateTime.now());
                    practitionerRepository.save(p);
                });
            }
        }

        if (request.getRoleNames() != null) {
            Set<Role> roles = new HashSet<>();
            for (String roleName : request.getRoleNames()) {
                roleRepository.findByName(roleName).ifPresent(roles::add);
            }
            user.setRoles(roles);
        }

        user.setUpdatedAt(OffsetDateTime.now());
        User saved = userRepository.save(user);
        return mapToDTO(saved);
    }

    public void activateUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        user.setStatus("ACTIVE");
        user.setUpdatedAt(OffsetDateTime.now());
        userRepository.save(user);
    }

    public void deactivateUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        user.setStatus("INACTIVE");
        user.setUpdatedAt(OffsetDateTime.now());
        userRepository.save(user);
    }

    public UserResponseDTO mapToDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setStatus(user.getStatus());
        dto.setVerificationStatus(user.getStatus());
        dto.setMfaEnabled(user.getMfaEnabled());
        dto.setLastLoginAt(user.getLastLoginAt());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());

        if (user.getPerson() != null) {
            dto.setPersonId(user.getPerson().getId());
            dto.setFirstName(user.getPerson().getFirstName());
            dto.setLastName(user.getPerson().getLastName());
            dto.setMiddleName(user.getPerson().getMiddleName());
            dto.setFullName(user.getPerson().getFullName());
            dto.setGender(user.getPerson().getSexAtBirth());
            dto.setPhone(user.getPerson().getPhone());

            practitionerRepository.findByPersonId(user.getPerson().getId()).ifPresent(p -> {
                dto.setSpecialization(p.getPrimarySpecialty());
                dto.setSpecialty(p.getPrimarySpecialty());
                dto.setDepartment(p.getPrimarySpecialty());
                dto.setLicenseNumber(p.getIdentifier());
            });
        } else {
            dto.setFullName(user.getEmail());
        }

        if (user.getRoles() != null) {
            dto.setRoles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
        }

        List<UserOrganization> userOrgs = userOrganizationRepository.findByUserId(user.getId());
        if (userOrgs != null && !userOrgs.isEmpty()) {
            List<UserResponseDTO.UserOrgDTO> orgDTOs = userOrgs.stream()
                    .filter(uo -> uo.getOrganization() != null)
                    .map(uo -> new UserResponseDTO.UserOrgDTO(
                            uo.getOrganization().getId(),
                            uo.getOrganization().getName(),
                            uo.getOrganization().getCode(),
                            uo.getEmploymentType()
                    ))
                    .collect(Collectors.toList());
            dto.setOrganizations(orgDTOs);
        }

        return dto;
    }
}
