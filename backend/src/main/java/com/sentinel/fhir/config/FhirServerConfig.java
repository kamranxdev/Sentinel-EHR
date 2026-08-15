package com.sentinel.fhir.config;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.rest.server.RestfulServer;
import ca.uhn.fhir.rest.server.interceptor.ResponseHighlighterInterceptor;
import ca.uhn.fhir.rest.server.IResourceProvider;
import com.sentinel.audit.interceptor.SentinelAuditInterceptor;
import com.sentinel.auth.security.SentinelAuthorizationInterceptor;
import com.sentinel.authorization.interceptor.ConsentAbacInterceptor;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class FhirServerConfig {

    @Bean
    public FhirContext fhirContext() {
        return FhirContext.forR4Cached();
    }

    @Bean
    public ServletRegistrationBean<RestfulServer> fhirServletRegistration(
            FhirContext fhirContext,
            SentinelAuthorizationInterceptor authInterceptor,
            ConsentAbacInterceptor consentInterceptor,
            SentinelAuditInterceptor auditInterceptor,
            List<IResourceProvider> resourceProviders) {

        RestfulServer fhirServer = new RestfulServer(fhirContext);
        fhirServer.setResourceProviders(resourceProviders);
        
        // Register Interceptors
        fhirServer.registerInterceptor(authInterceptor);      // RBAC - who can call which operation
        fhirServer.registerInterceptor(consentInterceptor);   // ABAC - patient-level consent & careteam filtering
        fhirServer.registerInterceptor(auditInterceptor);     // Automated AuditEvent recorder
        fhirServer.registerInterceptor(new ResponseHighlighterInterceptor()); // Pretty HTML viewer for browser visits

        // Capability Statement
        SentinelCapabilityStatementProvider capabilityStatementProvider = new SentinelCapabilityStatementProvider(fhirServer);
        fhirServer.setServerConformanceProvider(capabilityStatementProvider);

        ServletRegistrationBean<RestfulServer> registration =
                new ServletRegistrationBean<>(fhirServer, "/fhir/*");
        registration.setName("SentinelFhirServlet");
        registration.setLoadOnStartup(1);
        return registration;
    }
}
