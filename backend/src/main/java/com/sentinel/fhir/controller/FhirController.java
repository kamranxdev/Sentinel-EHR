package com.sentinel.fhir.controller;

import com.sentinel.allergies.entity.Allergy;
import com.sentinel.diagnoses.entity.Diagnosis;
import com.sentinel.encounters.entity.Encounter;
import com.sentinel.fhir.service.FhirService;
import com.sentinel.patients.entity.Patient;
import com.sentinel.patients.service.PatientSecurityService;
import com.sentinel.prescriptions.entity.Prescription;
import com.sentinel.vitals.entity.Vitals;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/fhir/v1", "/api/v1/fhir"})
public class FhirController {

    private final FhirService fhirService;
    private final PatientSecurityService patientSecurityService;

    public FhirController(FhirService fhirService,
                          PatientSecurityService patientSecurityService) {
        this.fhirService = fhirService;
        this.patientSecurityService = patientSecurityService;
    }

    @GetMapping(value = "/metadata", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<Map<String, Object>> getMetadata() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(fhirService.getCapabilityStatement());
    }

    @GetMapping(value = "/Patient", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE', 'DOCTOR', 'AUDITOR')")
    public ResponseEntity<Map<String, Object>> searchPatients(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String identifier) {

        List<Patient> patients = fhirService.searchPatients(name, gender, identifier);

        List<Map<String, Object>> resources = patients.stream()
                .map(fhirService::toPatientResource)
                .collect(Collectors.toList());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(fhirService.buildBundle("Patient", resources));
    }

    @GetMapping(value = "/Patient/{id}", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("@patientSecurityService.canAccessPatient(authentication, #id)")
    public ResponseEntity<Map<String, Object>> getPatientById(@PathVariable Long id) {
        Optional<Patient> patientOpt = fhirService.getPatientEntityById(id);
        if (patientOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                    .body(fhirService.buildOperationOutcome("error", "not-found", "Patient/" + id + " does not exist."));
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(fhirService.toPatientResource(patientOpt.get()));
    }

    @PostMapping(value = "/Patient", consumes = MediaType.APPLICATION_JSON_VALUE, produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE', 'DOCTOR')")
    public ResponseEntity<Map<String, Object>> createPatient(@RequestBody Map<String, Object> fhirJson) {
        Patient saved = fhirService.createPatientFromFhir(fhirJson);
        Map<String, Object> createdResource = fhirService.toPatientResource(saved);

        return ResponseEntity.created(URI.create("/fhir/v1/Patient/" + saved.getId()))
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(createdResource);
    }

    @DeleteMapping(value = "/Patient/{id}", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deletePatient(@PathVariable Long id) {
        if (!fhirService.patientExists(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                    .body(fhirService.buildOperationOutcome("error", "not-found", "Patient/" + id + " does not exist."));
        }
        fhirService.deletePatientById(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(fhirService.buildOperationOutcome("information", "informational", "Patient/" + id + " deleted successfully."));
    }

    @GetMapping(value = "/Patient/{id}/$everything", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("@patientSecurityService.canAccessPatient(authentication, #id)")
    public ResponseEntity<Map<String, Object>> getPatientEverything(@PathVariable Long id) {
        Map<String, Object> bundle = fhirService.getPatientEverythingBundle(id);
        if ("OperationOutcome".equalsIgnoreCase((String) bundle.get("resourceType"))) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(bundle);
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(bundle);
    }

    @GetMapping(value = "/Encounter", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE', 'DOCTOR', 'AUDITOR')")
    public ResponseEntity<Map<String, Object>> searchEncounters(@RequestParam(required = false) Long patientId, Authentication auth) {
        if (patientId != null && !patientSecurityService.canAccessPatient(auth, patientId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Encounter> encounters = fhirService.searchEncounters(patientId).stream()
                .filter(e -> e.getPatient() != null && patientSecurityService.canAccessPatient(auth, e.getPatient().getId()))
                .collect(Collectors.toList());

        List<Map<String, Object>> resources = encounters.stream()
                .map(fhirService::toEncounterResource)
                .collect(Collectors.toList());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(fhirService.buildBundle("Encounter", resources));
    }

    @GetMapping(value = "/Encounter/{id}", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("@patientSecurityService.canAccessEncounter(authentication, #id)")
    public ResponseEntity<Map<String, Object>> getEncounterById(@PathVariable Long id) {
        Optional<Encounter> encounterOpt = fhirService.getEncounterById(id);
        if (encounterOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                    .body(fhirService.buildOperationOutcome("error", "not-found", "Encounter/" + id + " does not exist."));
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(fhirService.toEncounterResource(encounterOpt.get()));
    }

    @GetMapping(value = "/AllergyIntolerance", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE', 'DOCTOR', 'AUDITOR')")
    public ResponseEntity<Map<String, Object>> searchAllergies(@RequestParam(required = false) Long patientId, Authentication auth) {
        if (patientId != null && !patientSecurityService.canAccessPatient(auth, patientId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Allergy> allergies = fhirService.searchAllergies(patientId).stream()
                .filter(a -> a.getPatient() != null && patientSecurityService.canAccessPatient(auth, a.getPatient().getId()))
                .collect(Collectors.toList());

        List<Map<String, Object>> resources = allergies.stream()
                .map(fhirService::toAllergyResource)
                .collect(Collectors.toList());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(fhirService.buildBundle("AllergyIntolerance", resources));
    }

    @GetMapping(value = "/AllergyIntolerance/{id}", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("@patientSecurityService.canAccessAllergy(authentication, #id)")
    public ResponseEntity<Map<String, Object>> getAllergyById(@PathVariable Long id) {
        Optional<Allergy> allergyOpt = fhirService.getAllergyEntityById(id);
        if (allergyOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                    .body(fhirService.buildOperationOutcome("error", "not-found", "AllergyIntolerance/" + id + " does not exist."));
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(fhirService.toAllergyResource(allergyOpt.get()));
    }

    @GetMapping(value = "/Condition", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE', 'DOCTOR', 'AUDITOR')")
    public ResponseEntity<Map<String, Object>> searchConditions(@RequestParam(required = false) Long patientId, Authentication auth) {
        if (patientId != null && !patientSecurityService.canAccessPatient(auth, patientId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Diagnosis> diagnoses = fhirService.searchConditions(patientId).stream()
                .filter(d -> d.getPatient() != null && patientSecurityService.canAccessPatient(auth, d.getPatient().getId()))
                .collect(Collectors.toList());

        List<Map<String, Object>> resources = diagnoses.stream()
                .map(fhirService::toConditionResource)
                .collect(Collectors.toList());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(fhirService.buildBundle("Condition", resources));
    }

    @GetMapping(value = "/Condition/{id}", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("@patientSecurityService.canAccessDiagnosis(authentication, #id)")
    public ResponseEntity<Map<String, Object>> getConditionById(@PathVariable Long id) {
        Optional<Diagnosis> diagnosisOpt = fhirService.getConditionById(id);
        if (diagnosisOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                    .body(fhirService.buildOperationOutcome("error", "not-found", "Condition/" + id + " does not exist."));
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(fhirService.toConditionResource(diagnosisOpt.get()));
    }

    @GetMapping(value = "/MedicationRequest", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE', 'DOCTOR', 'AUDITOR')")
    public ResponseEntity<Map<String, Object>> searchMedications(@RequestParam(required = false) Long patientId, Authentication auth) {
        if (patientId != null && !patientSecurityService.canAccessPatient(auth, patientId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Prescription> prescriptions = fhirService.searchMedications(patientId).stream()
                .filter(p -> p.getPatient() != null && patientSecurityService.canAccessPatient(auth, p.getPatient().getId()))
                .collect(Collectors.toList());

        List<Map<String, Object>> resources = prescriptions.stream()
                .map(fhirService::toMedicationRequestResource)
                .collect(Collectors.toList());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(fhirService.buildBundle("MedicationRequest", resources));
    }

    @GetMapping(value = "/MedicationRequest/{id}", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("@patientSecurityService.canAccessPrescription(authentication, #id)")
    public ResponseEntity<Map<String, Object>> getMedicationById(@PathVariable Long id) {
        Optional<Prescription> prescriptionOpt = fhirService.getMedicationById(id);
        if (prescriptionOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                    .body(fhirService.buildOperationOutcome("error", "not-found", "MedicationRequest/" + id + " does not exist."));
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(fhirService.toMedicationRequestResource(prescriptionOpt.get()));
    }

    @GetMapping(value = "/Observation", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE', 'DOCTOR', 'AUDITOR')")
    public ResponseEntity<Map<String, Object>> searchObservations(@RequestParam(required = false) Long patientId, Authentication auth) {
        if (patientId != null && !patientSecurityService.canAccessPatient(auth, patientId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Vitals> vitals = fhirService.searchObservations(patientId).stream()
                .filter(v -> v.getPatient() != null && patientSecurityService.canAccessPatient(auth, v.getPatient().getId()))
                .collect(Collectors.toList());

        List<Map<String, Object>> resources = vitals.stream()
                .map(fhirService::toObservationResource)
                .collect(Collectors.toList());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(fhirService.buildBundle("Observation", resources));
    }

    @GetMapping(value = "/Observation/{id}", produces = {"application/fhir+json", MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("@patientSecurityService.canAccessVitals(authentication, #id)")
    public ResponseEntity<Map<String, Object>> getObservationById(@PathVariable Long id) {
        Optional<Vitals> vitalsOpt = fhirService.getObservationById(id);
        if (vitalsOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                    .body(fhirService.buildOperationOutcome("error", "not-found", "Observation/" + id + " does not exist."));
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/fhir+json;charset=UTF-8")
                .body(fhirService.toObservationResource(vitalsOpt.get()));
    }
}

