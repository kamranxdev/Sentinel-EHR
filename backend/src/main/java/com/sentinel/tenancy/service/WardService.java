package com.sentinel.tenancy.service;

import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.tenancy.dto.CreateWardRequest;
import com.sentinel.tenancy.dto.UpdateWardRequest;
import com.sentinel.tenancy.dto.WardResponseDTO;
import com.sentinel.tenancy.entity.Department;
import com.sentinel.tenancy.entity.Ward;
import com.sentinel.tenancy.repository.DepartmentRepository;
import com.sentinel.tenancy.repository.WardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class WardService {

    private final WardRepository wardRepository;
    private final DepartmentRepository departmentRepository;

    public WardService(WardRepository wardRepository, DepartmentRepository departmentRepository) {
        this.wardRepository = wardRepository;
        this.departmentRepository = departmentRepository;
    }

    public WardResponseDTO createWard(UUID departmentId, CreateWardRequest request) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + departmentId));

        Ward ward = new Ward();
        ward.setOrganization(department.getOrganization());
        ward.setDepartment(department);
        ward.setCode(request.getCode());
        ward.setName(request.getName());
        ward.setWardType(request.getWardType());
        ward.setStatus("ACTIVE");
        ward.setCreatedAt(OffsetDateTime.now());

        Ward saved = wardRepository.save(ward);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<WardResponseDTO> getDepartmentWards(UUID departmentId) {
        return wardRepository.findByDepartmentId(departmentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WardResponseDTO> getOrganizationWards(UUID organizationId) {
        return wardRepository.findByOrganizationId(organizationId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WardResponseDTO getWard(UUID wardId) {
        Ward ward = wardRepository.findById(wardId)
                .orElseThrow(() -> new ResourceNotFoundException("Ward not found with id: " + wardId));
        return mapToDTO(ward);
    }

    public WardResponseDTO updateWard(UUID wardId, UpdateWardRequest request) {
        Ward ward = wardRepository.findById(wardId)
                .orElseThrow(() -> new ResourceNotFoundException("Ward not found with id: " + wardId));

        if (request.getName() != null) ward.setName(request.getName());
        if (request.getWardType() != null) ward.setWardType(request.getWardType());
        if (request.getStatus() != null) ward.setStatus(request.getStatus());

        Ward saved = wardRepository.save(ward);
        return mapToDTO(saved);
    }

    public void deactivateWard(UUID wardId) {
        Ward ward = wardRepository.findById(wardId)
                .orElseThrow(() -> new ResourceNotFoundException("Ward not found with id: " + wardId));
        ward.setStatus("INACTIVE");
        wardRepository.save(ward);
    }

    public WardResponseDTO mapToDTO(Ward ward) {
        WardResponseDTO dto = new WardResponseDTO();
        dto.setId(ward.getId());
        if (ward.getOrganization() != null) {
            dto.setOrganizationId(ward.getOrganization().getId());
            dto.setOrganizationName(ward.getOrganization().getName());
        }
        if (ward.getDepartment() != null) {
            dto.setDepartmentId(ward.getDepartment().getId());
            dto.setDepartmentName(ward.getDepartment().getName());
        }
        dto.setCode(ward.getCode());
        dto.setName(ward.getName());
        dto.setWardType(ward.getWardType());
        dto.setStatus(ward.getStatus());
        dto.setCreatedAt(ward.getCreatedAt());
        return dto;
    }
}
