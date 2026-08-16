package com.sentinel.abdm.service;

import com.sentinel.clinical.entity.Diagnosis;
import com.sentinel.clinical.entity.Encounter;
import com.sentinel.patient.entity.Patient;
import com.sentinel.pharmacy.entity.Prescription;
import com.sentinel.clinical.entity.Vitals;
import org.hl7.fhir.r4.model.*;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class AbdmBundleExporterService {

    public Bundle createOpConsultRecordBundle(Patient patient, Encounter encounter, List<Diagnosis> diagnoses, List<Prescription> prescriptions, List<Vitals> vitals) {
        Bundle bundle = new Bundle();
        bundle.setId("opconsult-" + UUID.randomUUID());
        bundle.setType(Bundle.BundleType.DOCUMENT);
        bundle.setTimestamp(new Date());

        Meta meta = new Meta();
        meta.addProfile("https://nrces.in/ndhm/fhir/r4/StructureDefinition/OPConsultRecord");
        bundle.setMeta(meta);

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

        if (encounter != null) {
            composition.setEncounter(new Reference("Encounter/" + encounter.getId()));
        }

        bundle.addEntry().setResource(composition);

        if (diagnoses != null) {
            for (Diagnosis d : diagnoses) {
                Condition condition = new Condition();
                condition.setId("Condition/" + d.getId());
                condition.setCode(new CodeableConcept().setText(d.getDiagnosisName()));
                if (patient != null) {
                    condition.setSubject(new Reference("Patient/" + patient.getId()));
                }
                bundle.addEntry().setResource(condition);
            }
        }

        if (prescriptions != null) {
            for (Prescription p : prescriptions) {
                MedicationRequest req = new MedicationRequest();
                req.setId("MedicationRequest/" + p.getId());
                req.setMedication(new CodeableConcept().setText(p.getMedicationName()));
                if (patient != null) {
                    req.setSubject(new Reference("Patient/" + patient.getId()));
                }
                bundle.addEntry().setResource(req);
            }
        }

        if (vitals != null) {
            for (Vitals v : vitals) {
                Observation obs = new Observation();
                obs.setId("Observation/" + v.getId());
                obs.setCode(new CodeableConcept().setText("Vital Signs"));
                if (patient != null) {
                    obs.setSubject(new Reference("Patient/" + patient.getId()));
                }
                bundle.addEntry().setResource(obs);
            }
        }

        return bundle;
    }

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
        composition.setTitle("Discharge Summary Record");
        composition.setDate(new Date());

        if (patient != null) {
            composition.setSubject(new Reference("Patient/" + patient.getId()));
        }

        if (encounter != null) {
            composition.setEncounter(new Reference("Encounter/" + encounter.getId()));
        }

        bundle.addEntry().setResource(composition);

        if (diagnoses != null) {
            for (Diagnosis d : diagnoses) {
                Condition condition = new Condition();
                condition.setId("Condition/" + d.getId());
                condition.setCode(new CodeableConcept().setText(d.getDiagnosisName()));
                if (patient != null) {
                    condition.setSubject(new Reference("Patient/" + patient.getId()));
                }
                bundle.addEntry().setResource(condition);
            }
        }

        if (prescriptions != null) {
            for (Prescription p : prescriptions) {
                MedicationRequest req = new MedicationRequest();
                req.setId("MedicationRequest/" + p.getId());
                req.setMedication(new CodeableConcept().setText(p.getMedicationName()));
                if (patient != null) {
                    req.setSubject(new Reference("Patient/" + patient.getId()));
                }
                bundle.addEntry().setResource(req);
            }
        }

        return bundle;
    }
}
