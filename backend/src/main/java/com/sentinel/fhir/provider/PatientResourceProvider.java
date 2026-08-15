package com.sentinel.fhir.provider;

import ca.uhn.fhir.rest.annotation.*;
import ca.uhn.fhir.rest.api.MethodOutcome;
import ca.uhn.fhir.rest.param.StringParam;
import ca.uhn.fhir.rest.server.IResourceProvider;
import ca.uhn.fhir.rest.server.exceptions.ResourceNotFoundException;
import com.sentinel.patients.entity.Patient;
import com.sentinel.patients.repository.PatientRepository;
import org.hl7.fhir.instance.model.api.IBaseResource;
import org.hl7.fhir.r4.model.IdType;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class PatientResourceProvider implements IResourceProvider {

    private final PatientRepository patientRepository;

    public PatientResourceProvider(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @Override
    public Class<? extends IBaseResource> getResourceType() {
        return org.hl7.fhir.r4.model.Patient.class;
    }

    @Read
    public org.hl7.fhir.r4.model.Patient getPatientById(@IdParam IdType id) {
        Long patientId = id.getIdPartAsLong();
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient/" + patientId + " not found"));
        return patient.toFhirResource();
    }

    @Search
    public List<org.hl7.fhir.r4.model.Patient> searchPatients(
            @OptionalParam(name = org.hl7.fhir.r4.model.Patient.SP_NAME) StringParam name,
            @OptionalParam(name = org.hl7.fhir.r4.model.Patient.SP_GENDER) StringParam gender,
            @OptionalParam(name = org.hl7.fhir.r4.model.Patient.SP_IDENTIFIER) StringParam identifier) {

        List<Patient> list = patientRepository.findAll();
        return list.stream()
                .filter(p -> name == null || (p.getFullName() != null && p.getFullName().toLowerCase().contains(name.getValue().toLowerCase())))
                .filter(p -> gender == null || (p.getGender() != null && p.getGender().equalsIgnoreCase(gender.getValue())))
                .filter(p -> identifier == null || (p.getPatientCode() != null && p.getPatientCode().equalsIgnoreCase(identifier.getValue())) || (p.getAbhaId() != null && p.getAbhaId().equalsIgnoreCase(identifier.getValue())))
                .map(Patient::toFhirResource)
                .collect(Collectors.toList());
    }

    @Create
    public MethodOutcome createPatient(@ResourceParam org.hl7.fhir.r4.model.Patient fhirPatient) {
        Patient entity = new Patient();
        if (fhirPatient.hasName()) {
            entity.setFullName(fhirPatient.getNameFirstRep().getNameAsSingleString());
        } else {
            entity.setFullName("Unknown Patient");
        }

        if (fhirPatient.hasGender()) {
            entity.setGender(fhirPatient.getGender().toCode().toUpperCase());
        }

        if (fhirPatient.hasBirthDate()) {
            entity.setDateOfBirth(fhirPatient.getBirthDate().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate());
        }

        entity.setPatientCode("MRN-" + System.currentTimeMillis());
        Patient saved = patientRepository.save(entity);

        MethodOutcome outcome = new MethodOutcome();
        outcome.setId(new IdType("Patient", saved.getId()));
        outcome.setResource(saved.toFhirResource());
        return outcome;
    }
}
