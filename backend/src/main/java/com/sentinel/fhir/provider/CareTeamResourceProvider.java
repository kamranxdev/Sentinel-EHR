package com.sentinel.fhir.provider;

import ca.uhn.fhir.rest.annotation.*;
import ca.uhn.fhir.rest.param.ReferenceParam;
import ca.uhn.fhir.rest.server.IResourceProvider;
import com.sentinel.patient.entity.Patient;
import com.sentinel.patient.repository.PatientRepository;
import org.hl7.fhir.instance.model.api.IBaseResource;
import org.hl7.fhir.r4.model.CareTeam;
import org.hl7.fhir.r4.model.IdType;
import org.hl7.fhir.r4.model.Reference;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class CareTeamResourceProvider implements IResourceProvider {

    private final PatientRepository patientRepository;

    public CareTeamResourceProvider(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @Override
    public Class<? extends IBaseResource> getResourceType() {
        return CareTeam.class;
    }

    @Read
    public CareTeam getCareTeamById(@IdParam IdType id) {
        UUID patientId = UUID.fromString(id.getIdPart());
        Patient p = patientRepository.findById(patientId).orElse(null);

        CareTeam team = new CareTeam();
        team.setId("CareTeam/" + id.getIdPart());
        team.setStatus(CareTeam.CareTeamStatus.ACTIVE);
        team.setName("Primary Care Team");
        if (p != null) {
            team.setSubject(new Reference("Patient/" + p.getId()));
        }
        return team;
    }

    @Search
    public List<CareTeam> searchCareTeams(@OptionalParam(name = CareTeam.SP_PATIENT) ReferenceParam patientParam) {
        List<CareTeam> results = new ArrayList<>();
        if (patientParam != null) {
            CareTeam team = getCareTeamById(new IdType(patientParam.getIdPart()));
            results.add(team);
        }
        return results;
    }
}
