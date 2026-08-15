package com.sentinel.fhir.provider;

import ca.uhn.fhir.rest.annotation.*;
import ca.uhn.fhir.rest.param.ReferenceParam;
import ca.uhn.fhir.rest.server.IResourceProvider;
import ca.uhn.fhir.rest.server.exceptions.ResourceNotFoundException;
import com.sentinel.allergies.entity.Allergy;
import com.sentinel.allergies.repository.AllergyRepository;
import org.hl7.fhir.instance.model.api.IBaseResource;
import org.hl7.fhir.r4.model.IdType;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class AllergyIntoleranceResourceProvider implements IResourceProvider {

    private final AllergyRepository allergyRepository;

    public AllergyIntoleranceResourceProvider(AllergyRepository allergyRepository) {
        this.allergyRepository = allergyRepository;
    }

    @Override
    public Class<? extends IBaseResource> getResourceType() {
        return org.hl7.fhir.r4.model.AllergyIntolerance.class;
    }

    @Read
    public org.hl7.fhir.r4.model.AllergyIntolerance getAllergyById(@IdParam IdType id) {
        Long allergyId = id.getIdPartAsLong();
        Allergy allergy = allergyRepository.findById(allergyId)
                .orElseThrow(() -> new ResourceNotFoundException("AllergyIntolerance/" + allergyId + " not found"));
        return allergy.toFhirResource();
    }

    @Search
    public List<org.hl7.fhir.r4.model.AllergyIntolerance> searchAllergies(
            @OptionalParam(name = org.hl7.fhir.r4.model.AllergyIntolerance.SP_PATIENT) ReferenceParam patientParam) {

        List<Allergy> list;
        if (patientParam != null) {
            Long patientId = Long.parseLong(patientParam.getIdPart());
            list = allergyRepository.findByPatientId(patientId);
        } else {
            list = allergyRepository.findAll();
        }

        return list.stream()
                .map(Allergy::toFhirResource)
                .collect(Collectors.toList());
    }
}
