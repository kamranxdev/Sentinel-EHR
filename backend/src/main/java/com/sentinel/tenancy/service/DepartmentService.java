package com.sentinel.tenancy.service;

import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.tenancy.dto.CreateDepartmentRequest;
import com.sentinel.tenancy.dto.DepartmentResponseDTO;
import com.sentinel.tenancy.dto.UpdateDepartmentRequest;
import com.sentinel.tenancy.entity.Department;
import com.sentinel.tenancy.entity.Organization;
import com.sentinel.tenancy.repository.DepartmentRepository;
import com.sentinel.tenancy.repository.OrganizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final OrganizationRepository organizationRepository;

    public DepartmentService(DepartmentRepository departmentRepository, OrganizationRepository organizationRepository) {
        this.departmentRepository = departmentRepository;
        this.organizationRepository = organizationRepository;
    }

    public DepartmentResponseDTO createDepartment(UUID organizationId, CreateDepartmentRequest request) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + organizationId));

        if (departmentRepository.existsByOrganizationIdAndCode(organizationId, request.getCode())) {
            throw new IllegalArgumentException("Department code already exists in organization: " + request.getCode());
        }

        Department dept = new Department();
        dept.setOrganization(organization);
        dept.setCode(request.getCode());
        dept.setName(request.getName());
        dept.setDepartmentType(request.getDepartmentType());
        dept.setStatus("ACTIVE");
        dept.setCreatedAt(OffsetDateTime.now());

        Department saved = departmentRepository.save(dept);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponseDTO> getOrganizationDepartments(UUID organizationId) {
        return departmentRepository.findByOrganizationId(organizationId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DepartmentResponseDTO getDepartment(UUID departmentId) {
        Department dept = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + departmentId));
        return mapToDTO(dept);
    }

    public DepartmentResponseDTO updateDepartment(UUID departmentId, UpdateDepartmentRequest request) {
        Department dept = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + departmentId));

        if (request.getName() != null) dept.setName(request.getName());
        if (request.getDepartmentType() != null) dept.setDepartmentType(request.getDepartmentType());
        if (request.getStatus() != null) dept.setStatus(request.getStatus());

        Department saved = departmentRepository.save(dept);
        return mapToDTO(saved);
    }

    public void deactivateDepartment(UUID departmentId) {
        Department dept = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + departmentId));
        dept.setStatus("INACTIVE");
        departmentRepository.save(dept);
    }

    public DepartmentResponseDTO mapToDTO(Department dept) {
        DepartmentResponseDTO dto = new DepartmentResponseDTO();
        dto.setId(dept.getId());
        if (dept.getOrganization() != null) {
            dto.setOrganizationId(dept.getOrganization().getId());
            dto.setOrganizationName(dept.getOrganization().getName());
        }
        dto.setCode(dept.getCode());
        dto.setName(dept.getName());
        dto.setDepartmentType(dept.getDepartmentType());
        dto.setStatus(dept.getStatus());
        dto.setCreatedAt(dept.getCreatedAt());
        return dto;
    }
}
