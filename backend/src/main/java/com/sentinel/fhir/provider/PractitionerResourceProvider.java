package com.sentinel.fhir.provider;

import ca.uhn.fhir.rest.annotation.*;
import ca.uhn.fhir.rest.param.StringParam;
import ca.uhn.fhir.rest.server.IResourceProvider;
import ca.uhn.fhir.rest.server.exceptions.ResourceNotFoundException;
import com.sentinel.users.entity.User;
import com.sentinel.users.repository.UserRepository;
import org.hl7.fhir.instance.model.api.IBaseResource;
import org.hl7.fhir.r4.model.IdType;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class PractitionerResourceProvider implements IResourceProvider {

    private final UserRepository userRepository;

    public PractitionerResourceProvider(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public Class<? extends IBaseResource> getResourceType() {
        return org.hl7.fhir.r4.model.Practitioner.class;
    }

    @Read
    public org.hl7.fhir.r4.model.Practitioner getPractitionerById(@IdParam IdType id) {
        Long userId = id.getIdPartAsLong();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Practitioner/" + userId + " not found"));
        return user.toFhirPractitioner();
    }

    @Search
    public List<org.hl7.fhir.r4.model.Practitioner> searchPractitioners(
            @OptionalParam(name = org.hl7.fhir.r4.model.Practitioner.SP_NAME) StringParam name) {
        List<User> list = userRepository.findAll();
        return list.stream()
                .filter(u -> name == null || (u.getFullName() != null && u.getFullName().toLowerCase().contains(name.getValue().toLowerCase())))
                .map(User::toFhirPractitioner)
                .collect(Collectors.toList());
    }
}
