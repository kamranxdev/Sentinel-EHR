package com.sentinel.insurance.service;

import com.sentinel.audit.service.AuditService;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.insurance.dto.CreatePatientInsuranceRequest;
import com.sentinel.insurance.dto.PatientInsuranceResponseDTO;
import com.sentinel.insurance.dto.UpdatePatientInsuranceRequest;
import com.sentinel.insurance.entity.InsurancePayer;
import com.sentinel.insurance.entity.InsurancePlan;
import com.sentinel.insurance.entity.PatientInsurance;
import com.sentinel.insurance.repository.InsurancePayerRepository;
import com.sentinel.insurance.repository.InsurancePlanRepository;
import com.sentinel.insurance.repository.PatientInsuranceRepository;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.repository.PatientRepository;
import com.sentinel.tenancy.repository.OrganizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PatientInsuranceService {

    private final PatientInsuranceRepository patientInsuranceRepository;
    private final PatientRepository patientRepository;
    private final InsurancePayerRepository payerRepository;
    private final InsurancePlanRepository planRepository;
    private final OrganizationRepository organizationRepository;
    private final AuditService auditService;

    public PatientInsuranceService(PatientInsuranceRepository patientInsuranceRepository,
                                  PatientRepository patientRepository,
                                  InsurancePayerRepository payerRepository,
                                  InsurancePlanRepository planRepository,
                                  OrganizationRepository organizationRepository,
                                  AuditService auditService) {
        this.patientInsuranceRepository = patientInsuranceRepository;
        this.patientRepository = patientRepository;
        this.payerRepository = payerRepository;
        this.planRepository = planRepository;
        this.organizationRepository = organizationRepository;
        this.auditService = auditService;
    }

    public PatientInsuranceResponseDTO addPolicy(UUID patientId, CreatePatientInsuranceRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        InsurancePayer payer = payerRepository.findById(request.getPayerId())
                .orElseThrow(() -> new ResourceNotFoundException("Payer not found with id: " + request.getPayerId()));

        PatientInsurance policy = new PatientInsurance();
        policy.setPatient(patient);
        policy.setPayer(payer);
        if (request.getOrganizationId() != null) {
            organizationRepository.findById(request.getOrganizationId()).ifPresent(policy::setOrganization);
        }
        if (request.getPlanId() != null) {
            planRepository.findById(request.getPlanId()).ifPresent(policy::setPlan);
        }

        policy.setPolicyNumber(request.getPolicyNumber());
        policy.setMemberId(request.getMemberId());
        policy.setGroupNumber(request.getGroupNumber());
        policy.setSubscriberName(request.getSubscriberName());
        policy.setSubscriberRelationship(request.getSubscriberRelationship());
        policy.setEffectiveFrom(request.getEffectiveFrom());
        policy.setEffectiveTo(request.getEffectiveTo());
        policy.setIsPrimary(request.getIsPrimary() != null ? request.getIsPrimary() : false);
        policy.setStatus("ACTIVE");

        PatientInsurance saved = patientInsuranceRepository.save(policy);

        if (auditService != null) {
            auditService.logEvent(saved.getId(), "PATIENT_INSURANCE_ADDED", "Added policy " + saved.getPolicyNumber() + " for patient " + patientId);
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<PatientInsuranceResponseDTO> getPatientPolicies(UUID patientId) {
        return patientInsuranceRepository.findByPatientId(patientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PatientInsuranceResponseDTO getPolicy(UUID policyId) {
        PatientInsurance policy = patientInsuranceRepository.findById(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient insurance policy not found with id: " + policyId));
        return mapToDTO(policy);
    }

    public PatientInsuranceResponseDTO updatePolicy(UUID policyId, UpdatePatientInsuranceRequest request) {
        PatientInsurance policy = patientInsuranceRepository.findById(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient insurance policy not found with id: " + policyId));

        if (request.getPolicyNumber() != null) policy.setPolicyNumber(request.getPolicyNumber());
        if (request.getMemberId() != null) policy.setMemberId(request.getMemberId());
        if (request.getGroupNumber() != null) policy.setGroupNumber(request.getGroupNumber());
        if (request.getStatus() != null) policy.setStatus(request.getStatus());
        if (request.getIsPrimary() != null) policy.setIsPrimary(request.getIsPrimary());
        if (request.getEffectiveTo() != null) policy.setEffectiveTo(request.getEffectiveTo());

        PatientInsurance saved = patientInsuranceRepository.save(policy);
        return mapToDTO(saved);
    }

    public PatientInsuranceResponseDTO mapToDTO(PatientInsurance p) {
        PatientInsuranceResponseDTO dto = new PatientInsuranceResponseDTO();
        dto.setId(p.getId());
        if (p.getPatient() != null) dto.setPatientId(p.getPatient().getId());
        if (p.getOrganization() != null) dto.setOrganizationId(p.getOrganization().getId());
        if (p.getPayer() != null) {
            dto.setPayerId(p.getPayer().getId());
            dto.setPayerName(p.getPayer().getName());
        }
        if (p.getPlan() != null) {
            dto.setPlanId(p.getPlan().getId());
            dto.setPlanName(p.getPlan().getPlanName());
        }
        dto.setPolicyNumber(p.getPolicyNumber());
        dto.setMemberId(p.getMemberId());
        dto.setGroupNumber(p.getGroupNumber());
        dto.setSubscriberName(p.getSubscriberName());
        dto.setSubscriberRelationship(p.getSubscriberRelationship());
        dto.setEffectiveFrom(p.getEffectiveFrom());
        dto.setEffectiveTo(p.getEffectiveTo());
        dto.setIsPrimary(p.getIsPrimary());
        dto.setStatus(p.getStatus());
        return dto;
    }
}
