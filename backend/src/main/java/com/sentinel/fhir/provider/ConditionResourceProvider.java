package com.sentinel.fhir.provider;

import ca.uhn.fhir.rest.annotation.*;
import ca.uhn.fhir.rest.param.ReferenceParam;
import ca.uhn.fhir.rest.server.IResourceProvider;
import ca.uhn.fhir.rest.server.exceptions.ResourceNotFoundException;
import com.sentinel.diagnoses.entity.Diagnosis;
import com.sentinel.diagnoses.repository.DiagnosisRepository;
import org.hl7.fhir.instance.model.api.IBaseResource;
import org.hl7.fhir.r4.model.IdType;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

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
        Long diagnosisId = id.getIdPartAsLong();
        Diagnosis diagnosis = diagnosisRepository.findById(diagnosisId)
                .orElseThrow(() -> new ResourceNotFoundException("Condition/" + diagnosisId + " not found"));
        return diagnosis.toFhirResource();
    }

    @Search
    public List<org.hl7.fhir.r4.model.Condition> searchConditions(
            @OptionalParam(name = org.hl7.fhir.r4.model.Condition.SP_PATIENT) ReferenceParam patientParam) {

        List<Diagnosis> list;
        if (patientParam != null) {
            Long patientId = Long.parseLong(patientParam.getIdPart());
            list = diagnosisRepository.findByPatientId(patientId);
        } else {
            list = diagnosisRepository.findAll();
        }

        return list.stream()
                .map(Diagnosis::toFhirResource)
                .collect(Collectors.toList());
    }
}
