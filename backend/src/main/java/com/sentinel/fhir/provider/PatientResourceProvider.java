package com.sentinel.fhir.provider;

import ca.uhn.fhir.rest.annotation.*;
import ca.uhn.fhir.rest.api.MethodOutcome;
import ca.uhn.fhir.rest.param.StringParam;
import ca.uhn.fhir.rest.server.IResourceProvider;
import ca.uhn.fhir.rest.server.exceptions.ResourceNotFoundException;
import com.sentinel.identity.entity.Person;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.repository.PatientRepository;
import org.hl7.fhir.instance.model.api.IBaseResource;
import org.hl7.fhir.r4.model.IdType;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class PatientResourceProvider implements IResourceProvider {

    private final PatientRepository patientRepository;
    private final com.sentinel.identity.repository.PersonRepository personRepository;
    private final com.sentinel.fhir.service.FhirService fhirService;

    public PatientResourceProvider(PatientRepository patientRepository,
                                   com.sentinel.identity.repository.PersonRepository personRepository,
                                   com.sentinel.fhir.service.FhirService fhirService) {
        this.patientRepository = patientRepository;
        this.personRepository = personRepository;
        this.fhirService = fhirService;
    }

    @Override
    public Class<? extends IBaseResource> getResourceType() {
        return org.hl7.fhir.r4.model.Patient.class;
    }

    @Read
    public org.hl7.fhir.r4.model.Patient getPatientById(@IdParam IdType id) {
        UUID patientId = UUID.fromString(id.getIdPart());
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient/" + patientId + " not found"));
        
        org.hl7.fhir.r4.model.Patient fhir = new org.hl7.fhir.r4.model.Patient();
        fhir.setId(patient.getId().toString());
        fhir.addName().addGiven(patient.getFullName());
        return fhir;
    }

    @Operation(name = "$everything", idempotent = true)
    public org.hl7.fhir.r4.model.Bundle getPatientEverything(@IdParam IdType id) {
        UUID patientId = UUID.fromString(id.getIdPart());
        return fhirService.getPatientEverythingBundle(patientId);
    }

    @Search
    public List<org.hl7.fhir.r4.model.Patient> searchPatients(
            @OptionalParam(name = org.hl7.fhir.r4.model.Patient.SP_RES_ID) StringParam resId,
            @OptionalParam(name = "_id") StringParam idParam,
            @OptionalParam(name = "patientId") StringParam patientIdParam,
            @OptionalParam(name = org.hl7.fhir.r4.model.Patient.SP_NAME) StringParam name,
            @OptionalParam(name = org.hl7.fhir.r4.model.Patient.SP_GENDER) StringParam gender,
            @OptionalParam(name = org.hl7.fhir.r4.model.Patient.SP_IDENTIFIER) StringParam identifier) {

        String explicitId = resId != null ? resId.getValue() : (idParam != null ? idParam.getValue() : (patientIdParam != null ? patientIdParam.getValue() : null));
        if (explicitId != null && !explicitId.isBlank()) {
            try {
                UUID uuid = UUID.fromString(explicitId.trim());
                return patientRepository.findById(uuid)
                        .map(p -> {
                            org.hl7.fhir.r4.model.Patient fhir = new org.hl7.fhir.r4.model.Patient();
                            fhir.setId(p.getId().toString());
                            fhir.addName().addGiven(p.getFullName());
                            return List.of(fhir);
                        })
                        .orElse(List.of());
            } catch (IllegalArgumentException ignored) {
                // If not valid UUID, fallback to identifier search
                identifier = new StringParam(explicitId.trim());
            }
        }

        String nameVal = name != null ? name.getValue() : null;
        String identifierVal = identifier != null ? identifier.getValue() : null;

        List<Patient> list = patientRepository.searchPatients(nameVal, identifierVal, null, null, null);
        return list.stream().map(p -> {
            org.hl7.fhir.r4.model.Patient fhir = new org.hl7.fhir.r4.model.Patient();
            fhir.setId(p.getId().toString());
            fhir.addName().addGiven(p.getFullName());
            return fhir;
        }).toList();
    }

    @Create
    public MethodOutcome createPatient(@ResourceParam org.hl7.fhir.r4.model.Patient fhirPatient) {
        Person person = new Person();
        if (fhirPatient.hasName()) {
            person.setFirstName(fhirPatient.getNameFirstRep().getNameAsSingleString());
        } else {
            person.setFirstName("Unknown Patient");
        }
        Person savedPerson = personRepository.save(person);

        Patient entity = new Patient();
        entity.setPerson(savedPerson);
        entity.setStatus("ACTIVE");
        Patient saved = patientRepository.save(entity);

        MethodOutcome outcome = new MethodOutcome();
        outcome.setId(new IdType("Patient", saved.getId().toString()));
        org.hl7.fhir.r4.model.Patient res = new org.hl7.fhir.r4.model.Patient();
        res.setId(saved.getId().toString());
        outcome.setResource(res);
        return outcome;
    }
}
