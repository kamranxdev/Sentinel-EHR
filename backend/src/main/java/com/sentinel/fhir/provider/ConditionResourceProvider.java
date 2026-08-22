package com.sentinel.fhir.provider;

import ca.uhn.fhir.rest.annotation.*;
import ca.uhn.fhir.rest.param.ReferenceParam;
import ca.uhn.fhir.rest.server.IResourceProvider;
import ca.uhn.fhir.rest.server.exceptions.ResourceNotFoundException;
import com.sentinel.clinical.entity.Diagnosis;
import com.sentinel.clinical.repository.DiagnosisRepository;
import org.hl7.fhir.instance.model.api.IBaseResource;
import org.hl7.fhir.r4.model.IdType;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class ConditionResourceProvider implements IResourceProvider {

    private final DiagnosisRepository diagnosisRepository;

    public ConditionResourceProvider(DiagnosisRepository diagnosisRepository) {
        this.diagnosisRepository = diagnosisRepository;
    }

    @Override
    public Class<? extends IBaseResource> getResourceType() {
        return org.hl7.fhir.r4.model.Condition.class;
    }

    @Read
    public org.hl7.fhir.r4.model.Condition getConditionById(@IdParam IdType id) {
        UUID diagnosisId = UUID.fromString(id.getIdPart());
        Diagnosis diagnosis = diagnosisRepository.findById(diagnosisId)
                .orElseThrow(() -> new ResourceNotFoundException("Condition/" + diagnosisId + " not found"));
        
        org.hl7.fhir.r4.model.Condition cond = new org.hl7.fhir.r4.model.Condition();
        cond.setId(diagnosis.getId().toString());
        return cond;
    }

    @Search
    public List<org.hl7.fhir.r4.model.Condition> searchConditions(
            @OptionalParam(name = org.hl7.fhir.r4.model.Condition.SP_PATIENT) ReferenceParam patientParam,
            @OptionalParam(name = "patientId") ReferenceParam patientIdParam) {

        ReferenceParam effectivePatient = patientParam != null ? patientParam : patientIdParam;
        List<Diagnosis> list;
        if (effectivePatient != null) {
            UUID patientId = UUID.fromString(effectivePatient.getIdPart());
            list = diagnosisRepository.findByPatientId(patientId);
        } else {
            list = diagnosisRepository.findAll();
        }

        return list.stream().map(d -> {
            org.hl7.fhir.r4.model.Condition cond = new org.hl7.fhir.r4.model.Condition();
            cond.setId(d.getId().toString());
            return cond;
        }).toList();
    }
}
