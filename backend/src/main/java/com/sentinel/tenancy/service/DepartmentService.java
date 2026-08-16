package com.sentinel.tenancy.service;

import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.tenancy.dto.CreateDepartmentRequest;
import com.sentinel.tenancy.dto.DepartmentResponseDTO;
import com.sentinel.tenancy.dto.UpdateDepartmentRequest;
import com.sentinel.tenancy.entity.Department;
import com.sentinel.tenancy.entity.Facility;
import com.sentinel.tenancy.repository.DepartmentRepository;
import com.sentinel.tenancy.repository.FacilityRepository;
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
    private final FacilityRepository facilityRepository;

    public DepartmentService(DepartmentRepository departmentRepository, FacilityRepository facilityRepository) {
        this.departmentRepository = departmentRepository;
        this.facilityRepository = facilityRepository;
    }

    public DepartmentResponseDTO createDepartment(UUID facilityId, CreateDepartmentRequest request) {
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + facilityId));

        if (departmentRepository.existsByFacilityIdAndCode(facilityId, request.getCode())) {
            throw new IllegalArgumentException("Department code already exists in facility: " + request.getCode());
        }

        Department dept = new Department();
        dept.setOrganization(facility.getOrganization());
        dept.setFacility(facility);
        dept.setCode(request.getCode());
        dept.setName(request.getName());
        dept.setDepartmentType(request.getDepartmentType());
        dept.setStatus("ACTIVE");
        dept.setCreatedAt(OffsetDateTime.now());

        Department saved = departmentRepository.save(dept);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponseDTO> getFacilityDepartments(UUID facilityId) {
        return departmentRepository.findByFacilityId(facilityId).stream()
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
        }
        if (dept.getFacility() != null) {
            dto.setFacilityId(dept.getFacility().getId());
            dto.setFacilityName(dept.getFacility().getName());
        }
        dto.setCode(dept.getCode());
        dto.setName(dept.getName());
        dto.setDepartmentType(dept.getDepartmentType());
        dto.setStatus(dept.getStatus());
        dto.setCreatedAt(dept.getCreatedAt());
        return dto;
    }
}
