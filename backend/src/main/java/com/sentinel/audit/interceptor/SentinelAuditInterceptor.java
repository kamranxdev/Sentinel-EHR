package com.sentinel.audit.interceptor;

import ca.uhn.fhir.interceptor.api.Hook;
import ca.uhn.fhir.interceptor.api.Interceptor;
import ca.uhn.fhir.interceptor.api.Pointcut;
import ca.uhn.fhir.rest.api.server.RequestDetails;
import ca.uhn.fhir.rest.api.server.ResponseDetails;
import com.sentinel.audit.service.AuditService;
import org.hl7.fhir.r4.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;

@Component
@Interceptor
public class SentinelAuditInterceptor {

    private static final Logger log = LoggerFactory.getLogger(SentinelAuditInterceptor.class);
    private final AuditService auditService;

    public SentinelAuditInterceptor(AuditService auditService) {
        this.auditService = auditService;
    }

    @Hook(Pointcut.SERVER_OUTGOING_RESPONSE)
    public void recordAccess(RequestDetails req, ResponseDetails resp) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = (auth != null && auth.isAuthenticated()) ? auth.getName() : "ANONYMOUS";
            String userRole = com.sentinel.audit.service.AuditTrailService.resolvePrimaryRole(auth);

            AuditEvent event = new AuditEvent();
            event.setType(new Coding("http://terminology.hl7.org/CodeSystem/audit-event-type", "rest", "RESTful Operation"));
            event.setAction(mapVerbToAction(req.getRequestType() != null ? req.getRequestType().name() : "GET"));
            event.setRecorded(new Date());

            AuditEvent.AuditEventAgentComponent agent = new AuditEvent.AuditEventAgentComponent();
            agent.setWho(new Reference("Practitioner/" + username));
            agent.setRequestor(true);
            event.addAgent(agent);

            int statusCode = resp != null ? resp.getResponseCode() : 200;
            event.setOutcome(statusCode < 400
                    ? AuditEvent.AuditEventOutcome._0
                    : AuditEvent.AuditEventOutcome._4);

            event.setPurposeOfEvent(List.of(new CodeableConcept().addCoding(
                    new Coding("http://terminology.hl7.org/CodeSystem/v3-ActReason", "TREAT", "treatment"))));

            String actionName = (req.getRequestType() != null ? req.getRequestType().name() : "ACCESS") + " " + req.getCompleteUrl();
            String resourceName = req.getResourceName() != null ? req.getResourceName() : "RESOURCE";
            auditService.logAction(username, userRole, actionName, "FHIR_R4", resourceName, "HTTP " + statusCode);

            log.debug("FHIR AuditEvent recorded: user='{}' role='{}' action='{}' status={}", username, userRole, actionName, statusCode);
        } catch (Exception e) {
            log.warn("Failed to record FHIR AuditEvent: {}", e.getMessage());
        }
    }

    private AuditEvent.AuditEventAction mapVerbToAction(String verb) {
        return switch (verb.toUpperCase()) {
            case "POST" -> AuditEvent.AuditEventAction.C;
            case "GET" -> AuditEvent.AuditEventAction.R;
            case "PUT", "PATCH" -> AuditEvent.AuditEventAction.U;
            case "DELETE" -> AuditEvent.AuditEventAction.D;
            default -> AuditEvent.AuditEventAction.E;
        };
    }
}
