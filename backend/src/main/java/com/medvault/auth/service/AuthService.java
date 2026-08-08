package com.medvault.auth.service;

import com.medvault.auth.dto.JwtAuthResponse;
import com.medvault.auth.dto.LoginRequest;
import com.medvault.auth.dto.RegisterRequest;
import com.medvault.auth.security.JwtTokenProvider;
import com.medvault.common.exception.ResourceNotFoundException;
import com.medvault.patients.entity.Patient;
import com.medvault.patients.repository.PatientRepository;
import com.medvault.users.entity.Permission;
import com.medvault.users.entity.Role;
import com.medvault.users.entity.User;
import com.medvault.users.repository.RoleRepository;
import com.medvault.users.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       RoleRepository roleRepository,
                       PatientRepository patientRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.patientRepository = patientRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public JwtAuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsernameOrEmail() != null ? loginRequest.getUsernameOrEmail() : "",
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsernameOrEmail(loginRequest.getUsernameOrEmail(), loginRequest.getUsernameOrEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User record not found"));

        Set<String> roles = user.getRoles().stream().map(Role::getName).collect(Collectors.toSet());
        Set<String> permissions = new HashSet<>();
        for (Role role : user.getRoles()) {
            if (role.getPermissions() != null) {
                for (Permission perm : role.getPermissions()) {
                    permissions.add(perm.getCode());
                }
            }
        }

        return new JwtAuthResponse(
                jwt,
                user.getUsername(),
                user.getFullName(),
                roles,
                permissions,
                user.getDepartment(),
                user.getId()
        );
    }

    public User registerPatient(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new IllegalArgumentException("Username is already taken!");
        }
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new IllegalArgumentException("Email is already in use!");
        }

        User user = new User(
                registerRequest.getUsername(),
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getEmail(),
                registerRequest.getFullName()
        );

        user.setSpecialization(registerRequest.getSpecialization());
        user.setDepartment(registerRequest.getDepartment());
        user.setLicenseNumber(registerRequest.getLicenseNumber());
        user.setQualifications(registerRequest.getQualifications());
        user.setYearsOfExperience(registerRequest.getYearsOfExperience() != null ? registerRequest.getYearsOfExperience() : 5);
        user.setMedicalBoardState(registerRequest.getMedicalBoardState() != null ? registerRequest.getMedicalBoardState() : "State Medical Board");
        user.setVerificationStatus("VERIFIED");

        Role patientRole = roleRepository.findByName("ROLE_PATIENT")
                .orElseThrow(() -> new ResourceNotFoundException("Default ROLE_PATIENT standard role not found."));
        Set<Role> roles = new HashSet<>();
        roles.add(patientRole);

        user.setRoles(roles);
        User saved = userRepository.save(user);

        Patient patient = new Patient();
        patient.setPatientCode("PAT-" + (1000 + (System.currentTimeMillis() % 9000)));
        patient.setFullName(saved.getFullName());
        patient.setEmail(saved.getEmail());
        patient.setUser(saved);
        patientRepository.save(patient);

        return saved;
    }
}
