package com.sentinel.identity.service;

import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.identity.dto.CreateUserRequest;
import com.sentinel.identity.dto.UpdateUserRequest;
import com.sentinel.identity.dto.UserResponseDTO;
import com.sentinel.identity.dto.UserSearchCriteria;
import com.sentinel.identity.entity.Person;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.entity.UserOrganization;
import com.sentinel.identity.repository.PersonRepository;
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
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       PersonRepository personRepository,
                       RoleRepository roleRepository,
                       OrganizationRepository organizationRepository,
                       UserOrganizationRepository userOrganizationRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.personRepository = personRepository;
        this.roleRepository = roleRepository;
        this.organizationRepository = organizationRepository;
        this.userOrganizationRepository = userOrganizationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponseDTO createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already taken: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already taken: " + request.getEmail());
        }

        Person person = new Person();
        person.setFirstName(request.getFirstName() != null ? request.getFirstName() : request.getUsername());
        person.setLastName(request.getLastName());
        person.setMiddleName(request.getMiddleName());
        person.setSexAtBirth(request.getGender());
        person.setPhone(request.getPhone());
        person.setEmail(request.getEmail());
        person.setCreatedAt(OffsetDateTime.now());
        person.setUpdatedAt(OffsetDateTime.now());
        Person savedPerson = personRepository.save(person);

        User user = new User();
        user.setUsername(request.getUsername());
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

        return mapToDTO(savedUser);
    }

    @Transactional(readOnly = true)
    public UserResponseDTO getUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return mapToDTO(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponseDTO> searchUsers(UserSearchCriteria criteria) {
        List<User> users;
        if (criteria != null && (criteria.getQuery() != null || criteria.getStatus() != null || criteria.getRole() != null || criteria.getOrganizationId() != null)) {
            users = userRepository.searchUsers(criteria.getQuery(), criteria.getStatus(), criteria.getRole(), criteria.getOrganizationId());
        } else {
            users = userRepository.findAll();
        }
        return users.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public UserResponseDTO updateUser(UUID userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getStatus() != null) user.setStatus(request.getStatus());
        if (request.getMfaEnabled() != null) user.setMfaEnabled(request.getMfaEnabled());

        Person person = user.getPerson();
        if (person != null) {
            if (request.getFirstName() != null) person.setFirstName(request.getFirstName());
            if (request.getLastName() != null) person.setLastName(request.getLastName());
            if (request.getMiddleName() != null) person.setMiddleName(request.getMiddleName());
            if (request.getGender() != null) person.setSexAtBirth(request.getGender());
            if (request.getPhone() != null) person.setPhone(request.getPhone());
            if (request.getEmail() != null) person.setEmail(request.getEmail());
            person.setUpdatedAt(OffsetDateTime.now());
            personRepository.save(person);
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
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setStatus(user.getStatus());
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
        } else {
            dto.setFullName(user.getUsername());
        }

        if (user.getRoles() != null) {
            dto.setRoles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
        }
        return dto;
    }
}
