package com.sentinel.abdm;

import com.sentinel.abdm.service.AbhaIdentifierService;
import org.hl7.fhir.r4.model.Identifier;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class AbdmConformanceTest {

    @Test
    public void testAbhaIdentifiers() {
        AbhaIdentifierService service = new AbhaIdentifierService();
        Identifier abhaNum = service.buildAbhaNumberIdentifier("91-1234-5678-9012");
        assertEquals(AbhaIdentifierService.ABHA_NUMBER_SYSTEM, abhaNum.getSystem());
        assertEquals("91-1234-5678-9012", abhaNum.getValue());

        Identifier abhaAddr = service.buildAbhaAddressIdentifier("kamran@sbx");
        assertEquals(AbhaIdentifierService.ABHA_ADDRESS_SYSTEM, abhaAddr.getSystem());
        assertEquals("kamran@sbx", abhaAddr.getValue());
    }
}
