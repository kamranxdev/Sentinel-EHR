package com.sentinel.fhir.provider;

import ca.uhn.fhir.rest.annotation.*;
import ca.uhn.fhir.rest.param.ReferenceParam;
import ca.uhn.fhir.rest.server.IResourceProvider;
import org.hl7.fhir.instance.model.api.IBaseResource;
import org.hl7.fhir.r4.model.Consent;
import org.hl7.fhir.r4.model.IdType;
import org.hl7.fhir.r4.model.Reference;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ConsentResourceProvider implements IResourceProvider {

    @Override
    public Class<? extends IBaseResource> getResourceType() {
        return Consent.class;
    }

    @Read
    public Consent getConsentById(@IdParam IdType id) {
        Consent consent = new Consent();
        consent.setId("Consent/" + id.getIdPart());
        consent.setStatus(Consent.ConsentState.ACTIVE);
        consent.setScope(new org.hl7.fhir.r4.model.CodeableConcept().addCoding(
                new org.hl7.fhir.r4.model.Coding("http://terminology.hl7.org/CodeSystem/consentscope", "patient-privacy", "Privacy Consent")
        ));
        consent.setPatient(new Reference("Patient/" + id.getIdPart()));
        return consent;
    }

    @Search
    public List<Consent> searchConsents(@OptionalParam(name = Consent.SP_PATIENT) ReferenceParam patientParam) {
        List<Consent> results = new ArrayList<>();
        if (patientParam != null) {
            Consent consent = getConsentById(new IdType(patientParam.getIdPart()));
            results.add(consent);
        }
        return results;
    }
}
