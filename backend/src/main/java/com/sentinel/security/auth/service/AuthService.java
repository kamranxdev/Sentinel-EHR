package com.sentinel.security.auth.service;

import com.sentinel.security.auth.dto.JwtAuthResponse;
import com.sentinel.security.auth.dto.LoginRequest;
import com.sentinel.security.auth.dto.RegisterRequest;
import com.sentinel.security.auth.security.JwtTokenProvider;
import com.sentinel.identity.entity.Person;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.entity.UserDepartment;
import com.sentinel.identity.entity.UserFacility;
import com.sentinel.identity.entity.UserOrganization;
import com.sentinel.identity.repository.UserDepartmentRepository;
import com.sentinel.identity.repository.UserFacilityRepository;
import com.sentinel.identity.repository.UserOrganizationRepository;
import com.sentinel.identity.repository.UserRepository;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.entity.PatientOrganization;
import com.sentinel.patient.repository.PatientOrganizationRepository;
import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.security.entity.Role;
import com.sentinel.security.repository.RoleRepository;
import com.sentinel.tenancy.entity.Department;
import com.sentinel.tenancy.entity.Facility;
import com.sentinel.tenancy.entity.Organization;
import com.sentinel.tenancy.repository.DepartmentRepository;
import com.sentinel.tenancy.repository.FacilityRepository;
import com.sentinel.tenancy.repository.OrganizationRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PatientRepository patientRepository;
    private final PatientOrganizationRepository patientOrganizationRepository;
    private final UserOrganizationRepository userOrganizationRepository;
    private final UserFacilityRepository userFacilityRepository;
    private final UserDepartmentRepository userDepartmentRepository;
    private final OrganizationRepository organizationRepository;
    private final FacilityRepository facilityRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       RoleRepository roleRepository,
                       PatientRepository patientRepository,
                       PatientOrganizationRepository patientOrganizationRepository,
                       UserOrganizationRepository userOrganizationRepository,
                       UserFacilityRepository userFacilityRepository,
                       UserDepartmentRepository userDepartmentRepository,
                       OrganizationRepository organizationRepository,
                       FacilityRepository facilityRepository,
                       DepartmentRepository departmentRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.patientRepository = patientRepository;
        this.patientOrganizationRepository = patientOrganizationRepository;
        this.userOrganizationRepository = userOrganizationRepository;
        this.userFacilityRepository = userFacilityRepository;
        this.userDepartmentRepository = userDepartmentRepository;
        this.organizationRepository = organizationRepository;
        this.facilityRepository = facilityRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional(readOnly = true)
    public JwtAuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + loginRequest.getEmail()));

        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        Set<String> permissions = user.getRoles().stream()
                .flatMap(r -> r.getPermissions().stream())
                .map(p -> p.getCode())
                .collect(Collectors.toSet());

        JwtAuthResponse response = new JwtAuthResponse(
                jwt,
                user.getEmail(),
                user.getFullName(),
                roles,
                permissions,
                user.getId()
        );

        // Populate patient ID if user is associated with a patient record
        if (user.getPerson() != null) {
            patientRepository.findByPersonId(user.getPerson().getId())
                    .ifPresent(patient -> response.setPatientId(patient.getId()));
        }

        // Build list of organizations, facilities, and departments for multi-tenant context selection
        List<JwtAuthResponse.OrganizationContextDTO> orgContexts = buildOrganizationContexts(user, roles);
        response.setOrganizations(orgContexts);

        return response;
    }

    @Transactional(readOnly = true)
    public List<JwtAuthResponse.OrganizationContextDTO> buildOrganizationContexts(User user, Set<String> roles) {
        List<JwtAuthResponse.OrganizationContextDTO> result = new ArrayList<>();
        boolean isSuperAdmin = roles.contains("SUPER_ADMIN");

        if (isSuperAdmin) {
            // Super Admin has access to all active organizations and facilities
            List<Organization> allOrgs = organizationRepository.findAll();
            for (Organization org : allOrgs) {
                List<Facility> facilities = facilityRepository.findByOrganizationId(org.getId());
                List<JwtAuthResponse.FacilityContextDTO> facDtos = new ArrayList<>();
                for (Facility f : facilities) {
                    List<Department> depts = departmentRepository.findByFacilityId(f.getId());
                    List<JwtAuthResponse.DepartmentContextDTO> deptDtos = depts.stream()
                            .map(d -> new JwtAuthResponse.DepartmentContextDTO(d.getId(), d.getCode(), d.getName(), d.getDepartmentType()))
                            .collect(Collectors.toList());
                    facDtos.add(new JwtAuthResponse.FacilityContextDTO(f.getId(), f.getCode(), f.getName(), f.getFacilityType(), deptDtos));
                }
                result.add(new JwtAuthResponse.OrganizationContextDTO(
                        org.getId(),
                        org.getCode(),
                        org.getName(),
                        org.getLegalName(),
                        org.getOrganizationType(),
                        "SUPER_ADMIN",
                        "SYSTEM_WIDE",
                        facDtos
                ));
            }
            return result;
        }

        // Check if user is a patient
        if (roles.contains("PATIENT") && user.getPerson() != null) {
            Optional<Patient> patientOpt = patientRepository.findByPersonId(user.getPerson().getId());
            if (patientOpt.isPresent()) {
                List<PatientOrganization> patientOrgs = patientOrganizationRepository.findByPatientId(patientOpt.get().getId());
                for (PatientOrganization po : patientOrgs) {
                    Organization org = po.getOrganization();
                    if (org != null) {
                        List<Facility> facilities = facilityRepository.findByOrganizationId(org.getId());
                        List<JwtAuthResponse.FacilityContextDTO> facDtos = facilities.stream()
                                .map(f -> new JwtAuthResponse.FacilityContextDTO(f.getId(), f.getCode(), f.getName(), f.getFacilityType(), Collections.emptyList()))
                                .collect(Collectors.toList());
                        result.add(new JwtAuthResponse.OrganizationContextDTO(
                                org.getId(),
                                org.getCode(),
                                org.getName(),
                                org.getLegalName(),
                                org.getOrganizationType(),
                                po.getMrn(),
                                "PATIENT_MEMBER",
                                facDtos
                        ));
                    }
                }
                if (!result.isEmpty()) {
                    return result;
                }
            }
        }

        // Staff / Clinician memberships
        List<UserOrganization> userOrgs = userOrganizationRepository.findByUserId(user.getId());
        List<UserFacility> userFacs = userFacilityRepository.findByUserId(user.getId());
        List<UserDepartment> userDepts = userDepartmentRepository.findByUserId(user.getId());

        Set<UUID> userFacIds = userFacs.stream().map(uf -> uf.getFacility().getId()).collect(Collectors.toSet());
        Set<UUID> userDeptIds = userDepts.stream().map(ud -> ud.getDepartment().getId()).collect(Collectors.toSet());

        for (UserOrganization uo : userOrgs) {
            Organization org = uo.getOrganization();
            if (org == null) continue;

            List<Facility> facilities = facilityRepository.findByOrganizationId(org.getId());
            List<JwtAuthResponse.FacilityContextDTO> facDtos = new ArrayList<>();

            for (Facility f : facilities) {
                // If user is explicitly assigned to facilities, filter by them (or include all if none explicitly assigned)
                if (userFacIds.isEmpty() || userFacIds.contains(f.getId())) {
                    List<Department> depts = departmentRepository.findByFacilityId(f.getId());
                    List<JwtAuthResponse.DepartmentContextDTO> deptDtos = depts.stream()
                            .filter(d -> userDeptIds.isEmpty() || userDeptIds.contains(d.getId()))
                            .map(d -> new JwtAuthResponse.DepartmentContextDTO(d.getId(), d.getCode(), d.getName(), d.getDepartmentType()))
                            .collect(Collectors.toList());

                    facDtos.add(new JwtAuthResponse.FacilityContextDTO(f.getId(), f.getCode(), f.getName(), f.getFacilityType(), deptDtos));
                }
            }

            result.add(new JwtAuthResponse.OrganizationContextDTO(
                    org.getId(),
                    org.getCode(),
                    org.getName(),
                    org.getLegalName(),
                    org.getOrganizationType(),
                    uo.getEmployeeCode(),
                    uo.getEmploymentType(),
                    facDtos
            ));
        }

        // If no explicit user_organization rows found, fallback to all active organizations for platform convenience
        if (result.isEmpty()) {
            List<Organization> fallbackOrgs = organizationRepository.findAll();
            for (Organization org : fallbackOrgs) {
                List<Facility> facilities = facilityRepository.findByOrganizationId(org.getId());
                List<JwtAuthResponse.FacilityContextDTO> facDtos = facilities.stream()
                        .map(f -> new JwtAuthResponse.FacilityContextDTO(f.getId(), f.getCode(), f.getName(), f.getFacilityType(), Collections.emptyList()))
                        .collect(Collectors.toList());
                result.add(new JwtAuthResponse.OrganizationContextDTO(
                        org.getId(),
                        org.getCode(),
                        org.getName(),
                        org.getLegalName(),
                        org.getOrganizationType(),
                        null,
                        "STAFF",
                        facDtos
                ));
            }
        }

        return result;
    }

    @Transactional
    public Map<String, Object> registerPatient(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new IllegalArgumentException("Email is already in use!");
        }

        Person person = new Person();
        person.setFirstName(registerRequest.getFullName() != null ? registerRequest.getFullName() : registerRequest.getEmail());

        User user = new User(registerRequest.getEmail(), passwordEncoder.encode(registerRequest.getPassword()), person);
        
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
