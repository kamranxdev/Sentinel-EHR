package com.sentinel.abdm.service;

import org.hl7.fhir.r4.model.Identifier;
import org.springframework.stereotype.Service;

@Service
public class AbhaIdentifierService {

    public static final String ABHA_NUMBER_SYSTEM = "https://healthid.ndhm.gov.in";
    public static final String ABHA_ADDRESS_SYSTEM = "https://healthid.ndhm.gov.in/abha-address";
    public static final String LOCAL_MRN_SYSTEM = "urn:sentinel:mrn";

    public Identifier buildAbhaNumberIdentifier(String abhaNumber) {
        return new Identifier()
                .setSystem(ABHA_NUMBER_SYSTEM)
                .setValue(abhaNumber);
    }

    public Identifier buildAbhaAddressIdentifier(String abhaAddress) {
        return new Identifier()
                .setSystem(ABHA_ADDRESS_SYSTEM)
                .setValue(abhaAddress);
    }

    public Identifier buildLocalMrnIdentifier(String mrn) {
        return new Identifier()
                .setSystem(LOCAL_MRN_SYSTEM)
                .setValue(mrn);
    }

    public boolean isAbhaNumberSystem(String system) {
        return ABHA_NUMBER_SYSTEM.equalsIgnoreCase(system);
    }

    public boolean isAbhaAddressSystem(String system) {
        return ABHA_ADDRESS_SYSTEM.equalsIgnoreCase(system);
    }
}
