package com.sentinel.fhir.provider;

import ca.uhn.fhir.rest.annotation.*;
import ca.uhn.fhir.rest.param.ReferenceParam;
import ca.uhn.fhir.rest.server.IResourceProvider;
import ca.uhn.fhir.rest.server.exceptions.ResourceNotFoundException;
import com.sentinel.appointments.entity.Appointment;
import com.sentinel.appointments.repository.AppointmentRepository;
import org.hl7.fhir.instance.model.api.IBaseResource;
import org.hl7.fhir.r4.model.IdType;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class AppointmentResourceProvider implements IResourceProvider {

    private final AppointmentRepository appointmentRepository;

    public AppointmentResourceProvider(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    @Override
    public Class<? extends IBaseResource> getResourceType() {
        return org.hl7.fhir.r4.model.Appointment.class;
    }

    @Read
    public org.hl7.fhir.r4.model.Appointment getAppointmentById(@IdParam IdType id) {
        Long apptId = id.getIdPartAsLong();
        Appointment appt = appointmentRepository.findById(apptId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment/" + apptId + " not found"));
        return appt.toFhirResource();
    }

    @Search
    public List<org.hl7.fhir.r4.model.Appointment> searchAppointments(
            @OptionalParam(name = org.hl7.fhir.r4.model.Appointment.SP_ACTOR) ReferenceParam actorParam) {

        List<Appointment> list;
        if (actorParam != null && actorParam.getIdPart() != null) {
            Long patientId = Long.parseLong(actorParam.getIdPart());
            list = appointmentRepository.findByPatientId(patientId);
        } else {
            list = appointmentRepository.findAll();
        }

        return list.stream()
                .map(Appointment::toFhirResource)
                .collect(Collectors.toList());
    }
}
