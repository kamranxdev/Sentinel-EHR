package com.sentinel.fhir.provider;

import ca.uhn.fhir.rest.annotation.*;
import ca.uhn.fhir.rest.param.ReferenceParam;
import ca.uhn.fhir.rest.server.IResourceProvider;
import ca.uhn.fhir.rest.server.exceptions.ResourceNotFoundException;
import com.sentinel.prescriptions.entity.Prescription;
import com.sentinel.prescriptions.repository.PrescriptionRepository;
import org.hl7.fhir.instance.model.api.IBaseResource;
import org.hl7.fhir.r4.model.IdType;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

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
        Long rxId = id.getIdPartAsLong();
        Prescription rx = prescriptionRepository.findById(rxId)
                .orElseThrow(() -> new ResourceNotFoundException("MedicationRequest/" + rxId + " not found"));
        return rx.toFhirResource();
    }

    @Search
    public List<org.hl7.fhir.r4.model.MedicationRequest> searchMedicationRequests(
            @OptionalParam(name = org.hl7.fhir.r4.model.MedicationRequest.SP_PATIENT) ReferenceParam patientParam) {

        List<Prescription> list;
        if (patientParam != null) {
            Long patientId = Long.parseLong(patientParam.getIdPart());
            list = prescriptionRepository.findByPatientId(patientId);
        } else {
            list = prescriptionRepository.findAll();
        }

        return list.stream()
                .map(Prescription::toFhirResource)
                .collect(Collectors.toList());
    }
}
