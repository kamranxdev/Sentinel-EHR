package com.sentinel.insurance.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.insurance.dto.CreateInsurancePayerRequest;
import com.sentinel.insurance.dto.CreateInsurancePlanRequest;
import com.sentinel.insurance.dto.InsurancePayerResponseDTO;
import com.sentinel.insurance.dto.InsurancePlanResponseDTO;
import com.sentinel.insurance.entity.InsurancePayer;
import com.sentinel.insurance.entity.InsurancePlan;
import com.sentinel.insurance.repository.InsurancePayerRepository;
import com.sentinel.insurance.repository.InsurancePlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class InsurancePayerService {

    private final InsurancePayerRepository payerRepository;
    private final InsurancePlanRepository planRepository;
    private final AuditService auditService;

    public InsurancePayerService(InsurancePayerRepository payerRepository,
                                 InsurancePlanRepository planRepository,
                                 AuditService auditService) {
        this.payerRepository = payerRepository;
        this.planRepository = planRepository;
        this.auditService = auditService;
    }

    public InsurancePayerResponseDTO createPayer(CreateInsurancePayerRequest request) {
        InsurancePayer payer = new InsurancePayer();
        payer.setName(request.getName());
        payer.setPayerCode(request.getPayerCode());
        payer.setPhone(request.getPhone());
        payer.setEmail(request.getEmail());
        payer.setActive(true);

        InsurancePayer saved = payerRepository.save(payer);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "INSURANCE_PAYER_CREATED", "Created payer " + saved.getName());
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<InsurancePayerResponseDTO> getAllPayers() {
        return payerRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InsurancePayerResponseDTO getPayer(UUID payerId) {
        InsurancePayer payer = payerRepository.findById(payerId)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance payer not found with id: " + payerId));
        return mapToDTO(payer);
    }

    public InsurancePlanResponseDTO createPlan(UUID payerId, CreateInsurancePlanRequest request) {
        InsurancePayer payer = payerRepository.findById(payerId)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance payer not found with id: " + payerId));

        InsurancePlan plan = new InsurancePlan();
        plan.setPayer(payer);
        plan.setPlanName(request.getPlanName());
        plan.setPlanCode(request.getPlanCode());
        plan.setActive(true);

        InsurancePlan saved = planRepository.save(plan);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "INSURANCE_PLAN_CREATED", "Created plan " + saved.getPlanName() + " for payer " + payerId);
        }

        return mapPlanToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<InsurancePlanResponseDTO> getPayerPlans(UUID payerId) {
        return planRepository.findByPayerId(payerId).stream()
                .map(this::mapPlanToDTO)
                .collect(Collectors.toList());
    }

    public InsurancePayerResponseDTO mapToDTO(InsurancePayer p) {
        InsurancePayerResponseDTO dto = new InsurancePayerResponseDTO();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setPayerCode(p.getPayerCode());
        dto.setPhone(p.getPhone());
        dto.setEmail(p.getEmail());
        dto.setActive(p.getActive());
        return dto;
    }

    public InsurancePlanResponseDTO mapPlanToDTO(InsurancePlan p) {
        InsurancePlanResponseDTO dto = new InsurancePlanResponseDTO();
        dto.setId(p.getId());
        if (p.getPayer() != null) dto.setPayerId(p.getPayer().getId());
        dto.setPlanName(p.getPlanName());
        dto.setPlanCode(p.getPlanCode());
        dto.setActive(p.getActive());
        return dto;
    }
}
