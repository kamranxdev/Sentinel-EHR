package com.sentinel.fhir.provider;

import ca.uhn.fhir.rest.annotation.*;
import ca.uhn.fhir.rest.param.ReferenceParam;
import ca.uhn.fhir.rest.server.IResourceProvider;
import ca.uhn.fhir.rest.server.exceptions.ResourceNotFoundException;
import com.sentinel.encounters.entity.Encounter;
import com.sentinel.encounters.repository.EncounterRepository;
import org.hl7.fhir.instance.model.api.IBaseResource;
import org.hl7.fhir.r4.model.IdType;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class EncounterResourceProvider implements IResourceProvider {

    private final EncounterRepository encounterRepository;

    public EncounterResourceProvider(EncounterRepository encounterRepository) {
        this.encounterRepository = encounterRepository;
    }

    @Override
    public Class<? extends IBaseResource> getResourceType() {
        return org.hl7.fhir.r4.model.Encounter.class;
    }

    @Read
    public org.hl7.fhir.r4.model.Encounter getEncounterById(@IdParam IdType id) {
        Long encId = id.getIdPartAsLong();
        Encounter encounter = encounterRepository.findById(encId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter/" + encId + " not found"));
        return encounter.toFhirResource();
    }

    @Search
    public List<org.hl7.fhir.r4.model.Encounter> searchEncounters(
            @OptionalParam(name = org.hl7.fhir.r4.model.Encounter.SP_PATIENT) ReferenceParam patientParam) {

        List<Encounter> list;
        if (patientParam != null) {
            Long patientId = Long.parseLong(patientParam.getIdPart());
            list = encounterRepository.findByPatientId(patientId);
        } else {
            list = encounterRepository.findAll();
        }

        return list.stream()
                .map(Encounter::toFhirResource)
                .collect(Collectors.toList());
    }
}
