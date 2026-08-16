package com.sentinel.fhir.provider;

import ca.uhn.fhir.rest.annotation.*;
import ca.uhn.fhir.rest.param.StringParam;
import ca.uhn.fhir.rest.server.IResourceProvider;
import ca.uhn.fhir.rest.server.exceptions.ResourceNotFoundException;
import com.sentinel.identity.entity.User;
import com.sentinel.identity.repository.UserRepository;
import org.hl7.fhir.instance.model.api.IBaseResource;
import org.hl7.fhir.r4.model.IdType;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

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
        UUID userId = UUID.fromString(id.getIdPart());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Practitioner/" + userId + " not found"));
        
        org.hl7.fhir.r4.model.Practitioner practitioner = new org.hl7.fhir.r4.model.Practitioner();
        practitioner.setId(user.getId().toString());
        practitioner.addName().addGiven(user.getFullName());
        return practitioner;
    }

    @Search
    public List<org.hl7.fhir.r4.model.Practitioner> searchPractitioners(
            @OptionalParam(name = org.hl7.fhir.r4.model.Practitioner.SP_NAME) StringParam name) {
        List<User> list = userRepository.findAll();
        return list.stream().map(u -> {
            org.hl7.fhir.r4.model.Practitioner practitioner = new org.hl7.fhir.r4.model.Practitioner();
            practitioner.setId(u.getId().toString());
            practitioner.addName().addGiven(u.getFullName());
            return practitioner;
        }).toList();
    }
}
