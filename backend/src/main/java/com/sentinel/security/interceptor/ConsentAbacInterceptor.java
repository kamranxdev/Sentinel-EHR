package com.sentinel.security.interceptor;

import ca.uhn.fhir.interceptor.api.Hook;
import ca.uhn.fhir.interceptor.api.Interceptor;
import ca.uhn.fhir.interceptor.api.Pointcut;
import ca.uhn.fhir.rest.api.server.RequestDetails;
import ca.uhn.fhir.rest.api.server.IPreResourceShowDetails;
import com.sentinel.identity.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

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
    }
}
