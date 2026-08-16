package com.sentinel.patient.mapper;

import com.sentinel.identity.entity.Person;
import com.sentinel.patient.dto.EmergencyContactDTO;
import com.sentinel.patient.dto.PatientRequestDTO;
import com.sentinel.patient.dto.PatientResponseDTO;
import com.sentinel.patient.entity.EmergencyContact;
import com.sentinel.patient.entity.Patient;
import org.springframework.stereotype.Component;

@Component
public class PatientMapper {

    public EmergencyContact toEmergencyContactEntity(EmergencyContactDTO dto) {
        if (dto == null) return null;
        EmergencyContact contact = new EmergencyContact();
        contact.setId(dto.getId());
        contact.setName(dto.getName());
        contact.setRelationship(dto.getRelationship());
        contact.setPhone(dto.getPhone());
        contact.setEmail(dto.getEmail());
        contact.setAddress(dto.getAddress());
        return contact;
    }

    public EmergencyContactDTO toEmergencyContactDTO(EmergencyContact entity) {
        if (entity == null) return null;
        EmergencyContactDTO dto = new EmergencyContactDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setRelationship(entity.getRelationship());
        dto.setPhone(entity.getPhone());
        dto.setEmail(entity.getEmail());
        dto.setAddress(entity.getAddress());
        return dto;
    }

    public Patient toEntity(PatientRequestDTO dto) {
        if (dto == null) return null;

        Person person = new Person();
        person.setFirstName(dto.getFullName() != null ? dto.getFullName() : "");
        person.setDateOfBirth(dto.getDateOfBirth());
        person.setSexAtBirth(dto.getGender());

        Patient patient = new Patient(person);
        return patient;
    }

    public PatientResponseDTO toResponseDTO(Patient entity) {
        if (entity == null) return null;

        PatientResponseDTO dto = new PatientResponseDTO();
        dto.setId(entity.getId());
        dto.setCreatedAt(entity.getCreatedAt());

        if (entity.getPerson() != null) {
            dto.setFullName(entity.getPerson().getFullName());
            dto.setDateOfBirth(entity.getPerson().getDateOfBirth());
            dto.setGender(entity.getPerson().getSexAtBirth());
        }

        return dto;
    }
}
