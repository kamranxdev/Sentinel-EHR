package com.sentinel.fhir.config;

import ca.uhn.fhir.rest.api.server.RequestDetails;
import ca.uhn.fhir.rest.server.RestfulServer;
import ca.uhn.fhir.rest.server.provider.ServerCapabilityStatementProvider;
import jakarta.servlet.http.HttpServletRequest;
import org.hl7.fhir.r4.model.*;

import java.util.Date;
import java.util.List;

public class SentinelCapabilityStatementProvider extends ServerCapabilityStatementProvider {

    public SentinelCapabilityStatementProvider(RestfulServer theRestfulServer) {
        super(theRestfulServer);
    }

    @Override
    public CapabilityStatement getServerConformance(HttpServletRequest theRequest, RequestDetails theRequestDetails) {
        CapabilityStatement statement = (CapabilityStatement) super.getServerConformance(theRequest, theRequestDetails);
        if (statement == null) {
            statement = new CapabilityStatement();
        }

        statement.setId("sentinel-fhir-r4-conformance");
        statement.setStatus(Enumerations.PublicationStatus.ACTIVE);
        statement.setDate(new Date());
        statement.setKind(CapabilityStatement.CapabilityStatementKind.INSTANCE);
        statement.setPublisher("Sentinel Health Systems Engine");
        statement.setFhirVersion(Enumerations.FHIRVersion._4_0_1);

        CapabilityStatement.CapabilityStatementSoftwareComponent software = new CapabilityStatement.CapabilityStatementSoftwareComponent();
        software.setName("Sentinel EHR Interoperability Engine (Spring Boot + Embedded HAPI FHIR)");
        software.setVersion("1.0.0-GOLD-STANDARD");
        statement.setSoftware(software);

        if (!statement.getRest().isEmpty()) {
            CapabilityStatement.CapabilityStatementRestComponent rest = statement.getRest().get(0);
            rest.setMode(CapabilityStatement.RestfulCapabilityMode.SERVER);
            
            CapabilityStatement.CapabilityStatementRestSecurityComponent security = new CapabilityStatement.CapabilityStatementRestSecurityComponent();
            security.setCors(true);
            CodeableConcept oauthConcept = new CodeableConcept();
            oauthConcept.addCoding(new Coding(
                    "http://terminology.hl7.org/CodeSystem/restful-security-service",
                    "OAuth",
                    "OAuth2 / Bearer JWT Authentication"
            ));
            security.setService(List.of(oauthConcept));
            rest.setSecurity(security);
        }

        return statement;
    }
}
