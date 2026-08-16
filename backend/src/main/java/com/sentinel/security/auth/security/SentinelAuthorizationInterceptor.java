package com.sentinel.security.auth.security;

import ca.uhn.fhir.rest.api.server.RequestDetails;
import ca.uhn.fhir.rest.server.interceptor.auth.AuthorizationInterceptor;
import ca.uhn.fhir.rest.server.interceptor.auth.IAuthRule;
import ca.uhn.fhir.rest.server.interceptor.auth.RuleBuilder;
import org.hl7.fhir.r4.model.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SentinelAuthorizationInterceptor extends AuthorizationInterceptor {

    @Override
    public List<IAuthRule> buildRuleList(RequestDetails requestDetails) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equalsIgnoreCase(auth.getName())) {
            return new RuleBuilder()
                    .allow().metadata().andThen()
                    .denyAll("unauthenticated-access-denied")
                    .build();
        }

        List<String> roles = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(a -> a.replace("ROLE_", ""))
                .toList();

        RuleBuilder builder = new RuleBuilder();

        builder.allow().metadata().andThen();

        boolean isAdmin = roles.contains("SUPER_ADMIN") || roles.contains("ORGANIZATION_ADMIN");
        boolean isDoctor = roles.contains("PHYSICIAN");
        boolean isNurse = roles.contains("NURSE");
        boolean isPharmacist = roles.contains("PHARMACIST");
        boolean isReceptionist = roles.contains("RECEPTIONIST");
        boolean isAuditor = roles.contains("AUDITOR");
        boolean isPatient = roles.contains("PATIENT");

        if (isAdmin) {
            return builder.allowAll().build();
        }

        if (isDoctor) {
            builder.allow().read().allResources().withAnyId().andThen()
                    .allow().write().resourcesOfType(Condition.class).withAnyId().andThen()
                    .allow().write().resourcesOfType(MedicationRequest.class).withAnyId().andThen()
                    .allow().write().resourcesOfType(ServiceRequest.class).withAnyId().andThen()
                    .allow().write().resourcesOfType(Procedure.class).withAnyId().andThen()
                    .allow().write().resourcesOfType(CarePlan.class).withAnyId().andThen()
                    .allow().write().resourcesOfType(Observation.class).withAnyId().andThen()
                    .allow().write().resourcesOfType(Encounter.class).withAnyId().andThen()
                    .allow().write().resourcesOfType(Patient.class).withAnyId().andThen()
                    .allow().write().resourcesOfType(AllergyIntolerance.class).withAnyId().andThen()
                    .allow().write().resourcesOfType(CareTeam.class).withAnyId().andThen()
                    .allow().write().resourcesOfType(Consent.class).withAnyId();
            return builder.build();
        }

        if (isNurse) {
            builder.allow().read().resourcesOfType(Patient.class).withAnyId().andThen()
                    .allow().read().resourcesOfType(Encounter.class).withAnyId().andThen()
                    .allow().read().resourcesOfType(Condition.class).withAnyId().andThen()
                    .allow().read().resourcesOfType(MedicationRequest.class).withAnyId().andThen()
                    .allow().read().resourcesOfType(AllergyIntolerance.class).withAnyId().andThen()
                    .allow().read().resourcesOfType(CareTeam.class).withAnyId().andThen()
                    .allow().write().resourcesOfType(Observation.class).withAnyId().andThen()
                    .allow().write().resourcesOfType(MedicationAdministration.class).withAnyId();
            return builder.build();
        }

        if (isPharmacist) {
            builder.allow().read().resourcesOfType(Patient.class).withAnyId().andThen()
                    .allow().read().resourcesOfType(MedicationRequest.class).withAnyId().andThen()
                    .allow().read().resourcesOfType(AllergyIntolerance.class).withAnyId().andThen()
                    .allow().write().resourcesOfType(MedicationDispense.class).withAnyId();
            return builder.build();
        }

        if (isReceptionist) {
            builder.allow().read().resourcesOfType(Patient.class).withAnyId().andThen()
                    .allow().write().resourcesOfType(Patient.class).withAnyId().andThen()
                    .allow().write().resourcesOfType(Appointment.class).withAnyId().andThen()
                    .allow().write().resourcesOfType(Schedule.class).withAnyId().andThen()
                    .allow().write().resourcesOfType(Slot.class).withAnyId();
            return builder.build();
        }

        if (isPatient) {
            builder.allow().read().resourcesOfType(Patient.class).withAnyId().andThen()
                    .allow().read().resourcesOfType(Encounter.class).withAnyId().andThen()
                    .allow().read().resourcesOfType(Condition.class).withAnyId().andThen()
                    .allow().read().resourcesOfType(MedicationRequest.class).withAnyId().andThen()
                    .allow().read().resourcesOfType(Observation.class).withAnyId().andThen()
                    .allow().read().resourcesOfType(Appointment.class).withAnyId();
            return builder.build();
        }

        if (isAuditor) {
            builder.allow().read().allResources().withAnyId();
            return builder.build();
        }

        return builder.denyAll("role-default-deny").build();
    }
}
