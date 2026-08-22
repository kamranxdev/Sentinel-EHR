package com.sentinel.fhir.provider;

import ca.uhn.fhir.rest.annotation.*;
import ca.uhn.fhir.rest.param.ReferenceParam;
import ca.uhn.fhir.rest.server.IResourceProvider;
import ca.uhn.fhir.rest.server.exceptions.ResourceNotFoundException;
import com.sentinel.pharmacy.entity.Prescription;
import com.sentinel.pharmacy.repository.PrescriptionRepository;
import org.hl7.fhir.instance.model.api.IBaseResource;
import org.hl7.fhir.r4.model.IdType;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class MedicationRequestResourceProvider implements IResourceProvider {

    private final PrescriptionRepository prescriptionRepository;

    public MedicationRequestResourceProvider(PrescriptionRepository prescriptionRepository) {
        this.prescriptionRepository = prescriptionRepository;
    }

    @Override
    public Class<? extends IBaseResource> getResourceType() {
        return org.hl7.fhir.r4.model.MedicationRequest.class;
    }

    @Read
    public org.hl7.fhir.r4.model.MedicationRequest getMedicationRequestById(@IdParam IdType id) {
        UUID rxId = UUID.fromString(id.getIdPart());
        Prescription rx = prescriptionRepository.findById(rxId)
                .orElseThrow(() -> new ResourceNotFoundException("MedicationRequest/" + rxId + " not found"));
        
        org.hl7.fhir.r4.model.MedicationRequest req = new org.hl7.fhir.r4.model.MedicationRequest();
        req.setId(rx.getId().toString());
        return req;
    }

    @Search
    public List<org.hl7.fhir.r4.model.MedicationRequest> searchMedicationRequests(
            @OptionalParam(name = org.hl7.fhir.r4.model.MedicationRequest.SP_PATIENT) ReferenceParam patientParam,
            @OptionalParam(name = "patientId") ReferenceParam patientIdParam) {

        ReferenceParam effectivePatient = patientParam != null ? patientParam : patientIdParam;
        List<Prescription> list;
        if (effectivePatient != null) {
            UUID patientId = UUID.fromString(effectivePatient.getIdPart());
            list = prescriptionRepository.findByPatientId(patientId);
        } else {
            list = prescriptionRepository.findAll();
        }

        return list.stream().map(rx -> {
            org.hl7.fhir.r4.model.MedicationRequest req = new org.hl7.fhir.r4.model.MedicationRequest();
            req.setId(rx.getId().toString());
            return req;
        }).toList();
    }
}
