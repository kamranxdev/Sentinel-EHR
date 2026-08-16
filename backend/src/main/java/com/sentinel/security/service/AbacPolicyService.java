package com.sentinel.security.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.security.dto.AbacPolicyResponseDTO;
import com.sentinel.security.dto.CreateAbacPolicyRequest;
import com.sentinel.security.dto.UpdateAbacPolicyRequest;
import com.sentinel.security.entity.AbacPolicy;
import com.sentinel.security.repository.AbacPolicyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AbacPolicyService {

    private final AbacPolicyRepository abacPolicyRepository;
    private final AuditService auditService;

    public AbacPolicyService(AbacPolicyRepository abacPolicyRepository,
                             AuditService auditService) {
        this.abacPolicyRepository = abacPolicyRepository;
        this.auditService = auditService;
    }

    public AbacPolicyResponseDTO createPolicy(CreateAbacPolicyRequest request) {
        AbacPolicy policy = new AbacPolicy();
        policy.setName(request.getName());
        policy.setDescription(request.getDescription());
        policy.setSubjectRole(request.getSubjectRole());
        policy.setResourceType(request.getResourceType());
        policy.setAction(request.getAction());
        policy.setConstraintExpression(request.getConstraintExpression());
        policy.setActive(true);
        policy.setCreatedAt(OffsetDateTime.now());

        AbacPolicy saved = abacPolicyRepository.save(policy);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "ABAC_POLICY_CREATED", "Created ABAC policy: " + saved.getName());
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<AbacPolicyResponseDTO> getAllPolicies() {
        return abacPolicyRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AbacPolicyResponseDTO getPolicy(UUID policyId) {
        AbacPolicy policy = abacPolicyRepository.findById(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("ABAC policy not found with id: " + policyId));
        return mapToDTO(policy);
    }

    public AbacPolicyResponseDTO updatePolicy(UUID policyId, UpdateAbacPolicyRequest request) {
        AbacPolicy policy = abacPolicyRepository.findById(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("ABAC policy not found with id: " + policyId));

        if (request.getName() != null) policy.setName(request.getName());
        if (request.getDescription() != null) policy.setDescription(request.getDescription());
        if (request.getSubjectRole() != null) policy.setSubjectRole(request.getSubjectRole());
        if (request.getResourceType() != null) policy.setResourceType(request.getResourceType());
        if (request.getAction() != null) policy.setAction(request.getAction());
        if (request.getConstraintExpression() != null) policy.setConstraintExpression(request.getConstraintExpression());
        if (request.getActive() != null) policy.setActive(request.getActive());

        AbacPolicy saved = abacPolicyRepository.save(policy);
        return mapToDTO(saved);
    }

    public AbacPolicyResponseDTO mapToDTO(AbacPolicy p) {
        AbacPolicyResponseDTO dto = new AbacPolicyResponseDTO();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setDescription(p.getDescription());
        dto.setSubjectRole(p.getSubjectRole());
        dto.setResourceType(p.getResourceType());
        dto.setAction(p.getAction());
        dto.setConstraintExpression(p.getConstraintExpression());
        dto.setActive(p.getActive());
        dto.setCreatedAt(p.getCreatedAt());
        return dto;
    }
}
