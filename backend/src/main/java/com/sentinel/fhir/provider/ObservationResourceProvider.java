package com.sentinel.fhir.provider;

import ca.uhn.fhir.rest.annotation.*;
import ca.uhn.fhir.rest.param.ReferenceParam;
import ca.uhn.fhir.rest.server.IResourceProvider;
import ca.uhn.fhir.rest.server.exceptions.ResourceNotFoundException;
import com.sentinel.clinical.entity.Vitals;
import com.sentinel.clinical.repository.VitalsRepository;
import org.hl7.fhir.instance.model.api.IBaseResource;
import org.hl7.fhir.r4.model.IdType;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class ObservationResourceProvider implements IResourceProvider {

    private final VitalsRepository vitalsRepository;

    public ObservationResourceProvider(VitalsRepository vitalsRepository) {
        this.vitalsRepository = vitalsRepository;
    }

    @Override
    public Class<? extends IBaseResource> getResourceType() {
        return org.hl7.fhir.r4.model.Observation.class;
    }

    @Read
    public org.hl7.fhir.r4.model.Observation getObservationById(@IdParam IdType id) {
        UUID vitalsId = UUID.fromString(id.getIdPart());
        Vitals vitals = vitalsRepository.findById(vitalsId)
                .orElseThrow(() -> new ResourceNotFoundException("Observation/" + vitalsId + " not found"));
        
        org.hl7.fhir.r4.model.Observation obs = new org.hl7.fhir.r4.model.Observation();
        obs.setId(vitals.getId().toString());
        obs.setStatus(org.hl7.fhir.r4.model.Observation.ObservationStatus.FINAL);
        return obs;
    }

    @Search
    public List<org.hl7.fhir.r4.model.Observation> searchObservations(
            @OptionalParam(name = org.hl7.fhir.r4.model.Observation.SP_PATIENT) ReferenceParam patientParam) {

        List<Vitals> list;
        if (patientParam != null) {
            UUID patientId = UUID.fromString(patientParam.getIdPart());
            list = vitalsRepository.findByPatientIdOrderByRecordedAtDesc(patientId);
        } else {
            list = vitalsRepository.findAll();
        }

        return list.stream().map(v -> {
            org.hl7.fhir.r4.model.Observation obs = new org.hl7.fhir.r4.model.Observation();
            obs.setId(v.getId().toString());
            obs.setStatus(org.hl7.fhir.r4.model.Observation.ObservationStatus.FINAL);
            return obs;
        }).toList();
    }
}
