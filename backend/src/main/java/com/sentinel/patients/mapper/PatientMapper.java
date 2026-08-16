package com.sentinel.patients.mapper;

import com.sentinel.patients.dto.EmergencyContactDTO;
import com.sentinel.patients.dto.PatientRequestDTO;
import com.sentinel.patients.dto.PatientResponseDTO;
import com.sentinel.patients.entity.EmergencyContact;
import com.sentinel.patients.entity.Patient;
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

        Patient patient = new Patient();
        patient.setPatientCode(dto.getPatientCode());
        patient.setAbhaId(dto.getAbhaId());
        patient.setNationalId(dto.getNationalId());
        patient.setFullName(dto.getFullName());
        patient.setDateOfBirth(dto.getDateOfBirth());
        patient.setGender(dto.getGender());
        patient.setBloodType(dto.getBloodType());
        patient.setPhone(dto.getPhone());
        patient.setEmail(dto.getEmail());
        patient.setAddress(dto.getAddress());
        patient.setPinCode(dto.getPinCode());
        patient.setEmergencyContact(toEmergencyContactEntity(dto.getEmergencyContact()));
        patient.setInsuranceProvider(dto.getInsuranceProvider());
        patient.setInsurancePolicyNumber(dto.getInsurancePolicyNumber());
        patient.setInsuranceGroupNumber(dto.getInsuranceGroupNumber());
        patient.setCoveragePlan(dto.getCoveragePlan());
        patient.setDepartment(dto.getDepartment());
        patient.setMedicalAlerts(dto.getMedicalAlerts());
        patient.setDietaryHabits(dto.getDietaryHabits());
        patient.setSmokingStatus(dto.getSmokingStatus());
        patient.setAlcoholConsumption(dto.getAlcoholConsumption());
        patient.setExerciseRoutine(dto.getExerciseRoutine());
        patient.setFoodAllergies(dto.getFoodAllergies());
        patient.setPastMedicalHistory(dto.getPastMedicalHistory());
        patient.setSeriousConditions(dto.getSeriousConditions());
        patient.setSurgeriesAndProcedures(dto.getSurgeriesAndProcedures());
        patient.setFamilyMedicalHistory(dto.getFamilyMedicalHistory());
        return patient;
    }

    public void updateEntityFromDTO(PatientRequestDTO dto, Patient patient) {
        if (dto == null || patient == null) return;

        if (dto.getAbhaId() != null) patient.setAbhaId(dto.getAbhaId());
        if (dto.getNationalId() != null) patient.setNationalId(dto.getNationalId());
        if (dto.getFullName() != null) patient.setFullName(dto.getFullName());
        if (dto.getDateOfBirth() != null) patient.setDateOfBirth(dto.getDateOfBirth());
        if (dto.getGender() != null) patient.setGender(dto.getGender());
        if (dto.getBloodType() != null) patient.setBloodType(dto.getBloodType());
        if (dto.getPhone() != null) patient.setPhone(dto.getPhone());
        if (dto.getEmail() != null) patient.setEmail(dto.getEmail());
        if (dto.getAddress() != null) patient.setAddress(dto.getAddress());
        if (dto.getPinCode() != null) patient.setPinCode(dto.getPinCode());
        
        if (dto.getEmergencyContact() != null) {
            if (patient.getEmergencyContact() == null) {
                patient.setEmergencyContact(toEmergencyContactEntity(dto.getEmergencyContact()));
            } else {
                EmergencyContact contact = patient.getEmergencyContact();
                if (dto.getEmergencyContact().getName() != null) contact.setName(dto.getEmergencyContact().getName());
                if (dto.getEmergencyContact().getRelationship() != null) contact.setRelationship(dto.getEmergencyContact().getRelationship());
                if (dto.getEmergencyContact().getPhone() != null) contact.setPhone(dto.getEmergencyContact().getPhone());
                if (dto.getEmergencyContact().getEmail() != null) contact.setEmail(dto.getEmergencyContact().getEmail());
                if (dto.getEmergencyContact().getAddress() != null) contact.setAddress(dto.getEmergencyContact().getAddress());
            }
        }

        if (dto.getInsuranceProvider() != null) patient.setInsuranceProvider(dto.getInsuranceProvider());
        if (dto.getInsurancePolicyNumber() != null) patient.setInsurancePolicyNumber(dto.getInsurancePolicyNumber());
        if (dto.getInsuranceGroupNumber() != null) patient.setInsuranceGroupNumber(dto.getInsuranceGroupNumber());
        if (dto.getCoveragePlan() != null) patient.setCoveragePlan(dto.getCoveragePlan());
        if (dto.getDepartment() != null) patient.setDepartment(dto.getDepartment());
        if (dto.getMedicalAlerts() != null) patient.setMedicalAlerts(dto.getMedicalAlerts());
        if (dto.getDietaryHabits() != null) patient.setDietaryHabits(dto.getDietaryHabits());
        if (dto.getSmokingStatus() != null) patient.setSmokingStatus(dto.getSmokingStatus());
        if (dto.getAlcoholConsumption() != null) patient.setAlcoholConsumption(dto.getAlcoholConsumption());
        if (dto.getExerciseRoutine() != null) patient.setExerciseRoutine(dto.getExerciseRoutine());
        if (dto.getFoodAllergies() != null) patient.setFoodAllergies(dto.getFoodAllergies());
        if (dto.getPastMedicalHistory() != null) patient.setPastMedicalHistory(dto.getPastMedicalHistory());
        if (dto.getSeriousConditions() != null) patient.setSeriousConditions(dto.getSeriousConditions());
        if (dto.getSurgeriesAndProcedures() != null) patient.setSurgeriesAndProcedures(dto.getSurgeriesAndProcedures());
        if (dto.getFamilyMedicalHistory() != null) patient.setFamilyMedicalHistory(dto.getFamilyMedicalHistory());
    }

    public PatientResponseDTO toResponseDTO(Patient entity) {
        if (entity == null) return null;

        PatientResponseDTO dto = new PatientResponseDTO();
        dto.setId(entity.getId());
        dto.setPatientCode(entity.getPatientCode());
        dto.setAbhaId(entity.getAbhaId());
        dto.setNationalId(entity.getNationalId());
        dto.setFullName(entity.getFullName());
        dto.setDateOfBirth(entity.getDateOfBirth());
        dto.setGender(entity.getGender());
        dto.setBloodType(entity.getBloodType());
        dto.setPhone(entity.getPhone());
        dto.setEmail(entity.getEmail());
        dto.setAddress(entity.getAddress());
        dto.setPinCode(entity.getPinCode());
        dto.setEmergencyContact(toEmergencyContactDTO(entity.getEmergencyContact()));
        dto.setInsuranceProvider(entity.getInsuranceProvider());
        dto.setInsurancePolicyNumber(entity.getInsurancePolicyNumber());
        dto.setInsuranceGroupNumber(entity.getInsuranceGroupNumber());
        dto.setCoveragePlan(entity.getCoveragePlan());
        dto.setDepartment(entity.getDepartment());
        dto.setMedicalAlerts(entity.getMedicalAlerts());
        dto.setDietaryHabits(entity.getDietaryHabits());
        dto.setSmokingStatus(entity.getSmokingStatus());
        dto.setAlcoholConsumption(entity.getAlcoholConsumption());
        dto.setExerciseRoutine(entity.getExerciseRoutine());
        dto.setFoodAllergies(entity.getFoodAllergies());
        dto.setPastMedicalHistory(entity.getPastMedicalHistory());
        dto.setSeriousConditions(entity.getSeriousConditions());
        dto.setSurgeriesAndProcedures(entity.getSurgeriesAndProcedures());
        dto.setFamilyMedicalHistory(entity.getFamilyMedicalHistory());
        dto.setCreatedAt(entity.getCreatedAt());

        if (entity.getUser() != null) {
            dto.setUserId(entity.getUser().getId());
            dto.setUsername(entity.getUser().getUsername());
        }

        return dto;
    }
}
