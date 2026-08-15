package com.sentinel.authorization.interceptor;

import ca.uhn.fhir.interceptor.api.Hook;
import ca.uhn.fhir.interceptor.api.Interceptor;
import ca.uhn.fhir.interceptor.api.Pointcut;
import ca.uhn.fhir.rest.api.server.RequestDetails;
import ca.uhn.fhir.rest.api.server.IPreResourceShowDetails;
import ca.uhn.fhir.rest.server.exceptions.ForbiddenOperationException;
import com.sentinel.users.entity.User;
import com.sentinel.users.repository.UserRepository;
import org.hl7.fhir.instance.model.api.IBaseResource;
import org.hl7.fhir.r4.model.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@Interceptor
public class ConsentAbacInterceptor {

    private final UserRepository userRepository;

    public ConsentAbacInterceptor(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Hook(Pointcut.STORAGE_PRESHOW_RESOURCES)
    public void filterResources(IPreResourceShowDetails details, RequestDetails req) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return;
        }

        List<String> roles = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(a -> a.replace("ROLE_", ""))
                .toList();

        if (roles.contains("ADMIN") || roles.contains("AUDITOR")) {
            return;
        }

        boolean isBreakGlassActive = isBreakGlassHeaderPresent(req);
        String username = auth.getName();
        Optional<User> currentUserOpt = userRepository.findByUsername(username);

        for (int i = 0; i < details.size(); i++) {
            IBaseResource resource = details.getResource(i);
            if (!(resource instanceof Resource fhirResource)) continue;

            String patientReferenceId = extractPatientId(fhirResource);
            if (patientReferenceId == null) continue;

            boolean restrictedCategory = isCategoryRestricted(fhirResource);
            if (restrictedCategory && !isBreakGlassActive) {
                throw new ForbiddenOperationException("Access to clinical resource for patient " + patientReferenceId + " is restricted under ABAC consent policy");
            }

            // Doctor assignment policy check for encounters
            if (roles.contains("DOCTOR") && fhirResource instanceof Encounter encounter && currentUserOpt.isPresent()) {
                Long currentUserId = currentUserOpt.get().getId();
                boolean isAssignedDoctor = false;
                if (encounter.hasParticipant()) {
                    for (Encounter.EncounterParticipantComponent p : encounter.getParticipant()) {
                        if (p.hasIndividual() && p.getIndividual().getReference() != null) {
                            String ref = p.getIndividual().getReference();
                            if (ref.endsWith("/" + currentUserId) || ref.equals("Practitioner/" + currentUserId)) {
                                isAssignedDoctor = true;
                                break;
                            }
                        }
                    }
                }
                if (!isAssignedDoctor && !isBreakGlassActive) {
                    throw new ForbiddenOperationException("Doctor " + username + " is not assigned to Encounter/" + encounter.getIdElement().getIdPart());
                }
            }
        }
    }

    private boolean isBreakGlassHeaderPresent(RequestDetails req) {
        if (req == null) return false;
        String breakGlassHeader = req.getHeader("X-Break-Glass");
        return "true".equalsIgnoreCase(breakGlassHeader) || "EMERGENCY".equalsIgnoreCase(breakGlassHeader);
    }

    private boolean isCategoryRestricted(Resource resource) {
        if (resource instanceof Condition condition) {
            if (condition.hasCategory()) {
                return condition.getCategory().stream().anyMatch(c ->
                        c.getCoding().stream().anyMatch(coding -> "PSYCH".equalsIgnoreCase(coding.getCode()) || "HIV".equalsIgnoreCase(coding.getCode())));
            }
        }
        return false;
    }

    public String extractPatientId(Resource resource) {
        if (resource instanceof Patient patient) {
            return patient.getIdElement().getIdPart();
        } else if (resource instanceof Observation observation && observation.hasSubject()) {
            return observation.getSubject().getReferenceElement().getIdPart();
        } else if (resource instanceof Condition condition && condition.hasSubject()) {
            return condition.getSubject().getReferenceElement().getIdPart();
        } else if (resource instanceof MedicationRequest medReq && medReq.hasSubject()) {
            return medReq.getSubject().getReferenceElement().getIdPart();
        } else if (resource instanceof Encounter encounter && encounter.hasSubject()) {
            return encounter.getSubject().getReferenceElement().getIdPart();
        } else if (resource instanceof AllergyIntolerance allergy && allergy.hasPatient()) {
            return allergy.getPatient().getReferenceElement().getIdPart();
        } else if (resource instanceof Appointment appointment) {
            return appointment.getParticipant().stream()
                    .filter(p -> p.hasActor() && p.getActor().getReference().startsWith("Patient/"))
                    .map(p -> p.getActor().getReferenceElement().getIdPart())
                    .findFirst().orElse(null);
        }
        return null;
    }
}
