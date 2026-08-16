package com.sentinel.fhir.provider;

import ca.uhn.fhir.rest.annotation.*;
import ca.uhn.fhir.rest.param.ReferenceParam;
import ca.uhn.fhir.rest.server.IResourceProvider;
import ca.uhn.fhir.rest.server.exceptions.ResourceNotFoundException;
import com.sentinel.scheduling.entity.Appointment;
import com.sentinel.scheduling.repository.AppointmentRepository;
import org.hl7.fhir.instance.model.api.IBaseResource;
import org.hl7.fhir.r4.model.IdType;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

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
        UUID apptId = UUID.fromString(id.getIdPart());
        Appointment appt = appointmentRepository.findById(apptId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment/" + apptId + " not found"));
        
        org.hl7.fhir.r4.model.Appointment fhir = new org.hl7.fhir.r4.model.Appointment();
        fhir.setId(appt.getId().toString());
        fhir.setStatus(org.hl7.fhir.r4.model.Appointment.AppointmentStatus.BOOKED);
        return fhir;
    }

    @Search
    public List<org.hl7.fhir.r4.model.Appointment> searchAppointments(
            @OptionalParam(name = org.hl7.fhir.r4.model.Appointment.SP_ACTOR) ReferenceParam actorParam) {

        List<Appointment> list;
        if (actorParam != null && actorParam.getIdPart() != null) {
            UUID patientId = UUID.fromString(actorParam.getIdPart());
            list = appointmentRepository.findByPatientIdOrderByStartsAtDesc(patientId);
        } else {
            list = appointmentRepository.findAll();
        }

        return list.stream().map(a -> {
            org.hl7.fhir.r4.model.Appointment fhir = new org.hl7.fhir.r4.model.Appointment();
            fhir.setId(a.getId().toString());
            fhir.setStatus(org.hl7.fhir.r4.model.Appointment.AppointmentStatus.BOOKED);
            return fhir;
        }).toList();
    }
}
