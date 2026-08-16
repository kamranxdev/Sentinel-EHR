package com.sentinel.security.auth.service;

import com.sentinel.security.auth.dto.JwtAuthResponse;
import com.sentinel.security.auth.dto.LoginRequest;
import com.sentinel.security.auth.dto.RegisterRequest;
import com.sentinel.security.auth.security.JwtTokenProvider;
import com.sentinel.identity.entity.Person;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.security.entity.Role;
import com.sentinel.identity.entity.User;
import com.sentinel.security.repository.RoleRepository;
import com.sentinel.identity.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
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
                        loginRequest.getUsernameOrEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(loginRequest.getUsernameOrEmail())
                .or(() -> userRepository.findByEmail(loginRequest.getUsernameOrEmail()))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        Set<String> permissions = user.getRoles().stream()
                .flatMap(r -> r.getPermissions().stream())
                .map(p -> p.getCode())
                .collect(Collectors.toSet());

        return new JwtAuthResponse(
                jwt,
                user.getUsername(),
                user.getFullName(),
                roles,
                permissions,
                user.getId()
        );
    }

    @Transactional
    public Map<String, Object> registerPatient(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new IllegalArgumentException("Username is already taken!");
        }
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new IllegalArgumentException("Email is already in use!");
        }

        Person person = new Person();
        person.setFirstName(registerRequest.getFullName() != null ? registerRequest.getFullName() : registerRequest.getUsername());

        User user = new User(registerRequest.getUsername(), registerRequest.getEmail(), passwordEncoder.encode(registerRequest.getPassword()), person);
        
        Role patientRole = roleRepository.findByName("PATIENT")
                .orElseGet(() -> roleRepository.save(new Role("PATIENT", "Patient Role")));
        user.getRoles().add(patientRole);

        User savedUser = userRepository.save(user);

        Patient patient = new Patient(savedUser.getPerson());
        Patient savedPatient = patientRepository.save(patient);

        return Map.of(
                "message", "User registered successfully",
                "userId", savedUser.getId(),
                "patientId", savedPatient.getId()
        );
    }
}
