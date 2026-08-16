package com.sentinel.fhir.provider;

import ca.uhn.fhir.rest.annotation.*;
import ca.uhn.fhir.rest.param.ReferenceParam;
import ca.uhn.fhir.rest.server.IResourceProvider;
import ca.uhn.fhir.rest.server.exceptions.ResourceNotFoundException;
import com.sentinel.clinical.entity.Allergy;
import com.sentinel.clinical.repository.AllergyRepository;
import org.hl7.fhir.instance.model.api.IBaseResource;
import org.hl7.fhir.r4.model.IdType;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

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
        UUID allergyId = UUID.fromString(id.getIdPart());
        Allergy allergy = allergyRepository.findById(allergyId)
                .orElseThrow(() -> new ResourceNotFoundException("AllergyIntolerance/" + allergyId + " not found"));
        
        org.hl7.fhir.r4.model.AllergyIntolerance fhir = new org.hl7.fhir.r4.model.AllergyIntolerance();
        fhir.setId(allergy.getId().toString());
        return fhir;
    }

    @Search
    public List<org.hl7.fhir.r4.model.AllergyIntolerance> searchAllergies(
            @OptionalParam(name = org.hl7.fhir.r4.model.AllergyIntolerance.SP_PATIENT) ReferenceParam patientParam) {

        List<Allergy> list;
        if (patientParam != null) {
            UUID patientId = UUID.fromString(patientParam.getIdPart());
            list = allergyRepository.findByPatientId(patientId);
        } else {
            list = allergyRepository.findAll();
        }

        return list.stream().map(a -> {
            org.hl7.fhir.r4.model.AllergyIntolerance fhir = new org.hl7.fhir.r4.model.AllergyIntolerance();
            fhir.setId(a.getId().toString());
            return fhir;
        }).toList();
    }
}
