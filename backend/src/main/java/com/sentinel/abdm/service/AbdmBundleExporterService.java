package com.sentinel.abdm.service;

import com.sentinel.diagnoses.entity.Diagnosis;
import com.sentinel.encounters.entity.Encounter;
import com.sentinel.patients.entity.Patient;
import com.sentinel.prescriptions.entity.Prescription;
import com.sentinel.vitals.entity.Vitals;
import org.hl7.fhir.r4.model.*;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class AbdmBundleExporterService {

    /**
     * Builds NRCeS OPConsultRecord Bundle for ABDM exchange
     */
    public Bundle createOpConsultRecordBundle(Patient patient, Encounter encounter, List<Diagnosis> diagnoses, List<Prescription> prescriptions, List<Vitals> vitals) {
        Bundle bundle = new Bundle();
        bundle.setId("opconsult-" + UUID.randomUUID());
        bundle.setType(Bundle.BundleType.DOCUMENT);
        bundle.setTimestamp(new Date());

        // Meta profile for NRCeS OPConsultRecord
        Meta meta = new Meta();
        meta.addProfile("https://nrces.in/ndhm/fhir/r4/StructureDefinition/OPConsultRecord");
        bundle.setMeta(meta);

        // 1. Composition
        Composition composition = new Composition();
        composition.setId("Composition/" + UUID.randomUUID());
        composition.setStatus(Composition.CompositionStatus.FINAL);
        composition.setType(new CodeableConcept().addCoding(
                new Coding("http://snomed.info/sct", "371530004", "Clinical consultation report")
        ));
        composition.setTitle("Outpatient Consultation Record");
        composition.setDate(new Date());

        if (patient != null) {
            composition.setSubject(new Reference("Patient/" + patient.getId()));
        }

        if (encounter != null && encounter.getAttendingProvider() != null) {
            composition.addAuthor(new Reference("Practitioner/" + encounter.getAttendingProvider().getId()));
        }

        // Add Composition to Bundle as first entry
        bundle.addEntry().setResource(composition);

        // 2. Patient
        if (patient != null) {
            bundle.addEntry().setResource(patient.toFhirResource());
        }

        // 3. Encounter
        if (encounter != null) {
            bundle.addEntry().setResource(encounter.toFhirResource());
        }

        // 4. Conditions
        if (diagnoses != null) {
            for (Diagnosis d : diagnoses) {
                bundle.addEntry().setResource(d.toFhirResource());
            }
        }

        // 5. Prescriptions
        if (prescriptions != null) {
            for (Prescription rx : prescriptions) {
                bundle.addEntry().setResource(rx.toFhirResource());
            }
        }

        // 6. Vitals
        if (vitals != null) {
            for (Vitals v : vitals) {
                bundle.addEntry().setResource(v.toFhirResource());
            }
        }

        return bundle;
    }

    /**
     * Builds NRCeS DischargeSummaryRecord Bundle for Inpatient Discharges
     */
    public Bundle createDischargeSummaryRecordBundle(Patient patient, Encounter encounter, List<Diagnosis> diagnoses, List<Prescription> prescriptions) {
        Bundle bundle = new Bundle();
        bundle.setId("dischargesummary-" + UUID.randomUUID());
        bundle.setType(Bundle.BundleType.DOCUMENT);
        bundle.setTimestamp(new Date());

        Meta meta = new Meta();
        meta.addProfile("https://nrces.in/ndhm/fhir/r4/StructureDefinition/DischargeSummaryRecord");
        bundle.setMeta(meta);

        Composition composition = new Composition();
        composition.setId("Composition/" + UUID.randomUUID());
        composition.setStatus(Composition.CompositionStatus.FINAL);
        composition.setType(new CodeableConcept().addCoding(
                new Coding("http://snomed.info/sct", "373942005", "Discharge summary")
        ));
        composition.setTitle("Inpatient Discharge Summary");
        composition.setDate(new Date());

        if (patient != null) {
            composition.setSubject(new Reference("Patient/" + patient.getId()));
        }

        bundle.addEntry().setResource(composition);

        if (patient != null) bundle.addEntry().setResource(patient.toFhirResource());
        if (encounter != null) bundle.addEntry().setResource(encounter.toFhirResource());
        if (diagnoses != null) {
            for (Diagnosis d : diagnoses) bundle.addEntry().setResource(d.toFhirResource());
        }
        if (prescriptions != null) {
            for (Prescription rx : prescriptions) bundle.addEntry().setResource(rx.toFhirResource());
        }

        return bundle;
    }
}
