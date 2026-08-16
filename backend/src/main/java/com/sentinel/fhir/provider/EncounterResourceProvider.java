package com.sentinel.fhir.provider;

import ca.uhn.fhir.rest.annotation.*;
import ca.uhn.fhir.rest.param.ReferenceParam;
import ca.uhn.fhir.rest.server.IResourceProvider;
import ca.uhn.fhir.rest.server.exceptions.ResourceNotFoundException;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.clinical.repository.EncounterRepository;
import org.hl7.fhir.instance.model.api.IBaseResource;
import org.hl7.fhir.r4.model.IdType;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

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
        UUID encId = UUID.fromString(id.getIdPart());
        Encounter encounter = encounterRepository.findById(encId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter/" + encId + " not found"));
        
        org.hl7.fhir.r4.model.Encounter fhir = new org.hl7.fhir.r4.model.Encounter();
        fhir.setId(encounter.getId().toString());
        if ("INPATIENT".equalsIgnoreCase(encounter.getEncounterType())) {
            fhir.setClass_(new org.hl7.fhir.r4.model.Coding("http://terminology.hl7.org/CodeSystem/v3-ActCode", "IMP", "inpatient encounter"));
        } else {
            fhir.setClass_(new org.hl7.fhir.r4.model.Coding("http://terminology.hl7.org/CodeSystem/v3-ActCode", "AMB", "ambulatory"));
        }
        return fhir;
    }

    @Search
    public List<org.hl7.fhir.r4.model.Encounter> searchEncounters(
            @OptionalParam(name = org.hl7.fhir.r4.model.Encounter.SP_PATIENT) ReferenceParam patientParam) {

        List<Encounter> list;
        if (patientParam != null) {
            UUID patientId = UUID.fromString(patientParam.getIdPart());
            list = encounterRepository.findByPatientIdOrderByStartedAtDesc(patientId);
        } else {
            list = encounterRepository.findAll();
        }

        return list.stream().map(e -> {
            org.hl7.fhir.r4.model.Encounter fhir = new org.hl7.fhir.r4.model.Encounter();
            fhir.setId(e.getId().toString());
            return fhir;
        }).toList();
    }
}
