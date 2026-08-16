package com.sentinel.vitals.mapper;

import com.sentinel.vitals.dto.VitalsRequestDTO;
import com.sentinel.vitals.dto.VitalsResponseDTO;
import com.sentinel.vitals.entity.Vitals;
import org.springframework.stereotype.Component;

@Component
public class VitalsMapper {

    public Vitals toEntity(VitalsRequestDTO dto) {
        if (dto == null) return null;

        Vitals vitals = new Vitals();
        if (dto.getSystolicBp() != null) vitals.setSystolicBp(dto.getSystolicBp());
        if (dto.getDiastolicBp() != null) vitals.setDiastolicBp(dto.getDiastolicBp());
        
        vitals.setHeartRate(dto.getHeartRate());
        vitals.setTemperature(dto.getTemperature());
        vitals.setOxygenSaturation(dto.getOxygenSaturation());
        vitals.setRespiratoryRate(dto.getRespiratoryRate());
        vitals.setWeightKg(dto.getWeightKg());
        vitals.setHeightCm(dto.getHeightCm());
        vitals.setBloodGlucose(dto.getBloodGlucose());
        vitals.setPainScore(dto.getPainScore());
        vitals.setFluidIntakeMl(dto.getFluidIntakeMl());
        vitals.setFluidOutputMl(dto.getFluidOutputMl());
        if (dto.getRecordedAt() != null) {
            vitals.setRecordedAt(dto.getRecordedAt());
        }
        return vitals;
    }

    public VitalsResponseDTO toResponseDTO(Vitals entity) {
        if (entity == null) return null;

        VitalsResponseDTO dto = new VitalsResponseDTO();
        dto.setId(entity.getId());
        dto.setSystolicBp(entity.getSystolicBp());
        dto.setDiastolicBp(entity.getDiastolicBp());
        dto.setHeartRate(entity.getHeartRate());
        dto.setTemperature(entity.getTemperature());
        dto.setOxygenSaturation(entity.getOxygenSaturation());
        dto.setRespiratoryRate(entity.getRespiratoryRate());
        dto.setWeightKg(entity.getWeightKg());
        dto.setHeightCm(entity.getHeightCm());
        dto.setBmi(entity.getBmi());
        dto.setBloodGlucose(entity.getBloodGlucose());
        dto.setPainScore(entity.getPainScore());
        dto.setFluidIntakeMl(entity.getFluidIntakeMl());
        dto.setFluidOutputMl(entity.getFluidOutputMl());
        dto.setRecordedAt(entity.getRecordedAt());

        if (entity.getPatient() != null) {
            dto.setPatientId(entity.getPatient().getId());
            dto.setPatientName(entity.getPatient().getFullName());
            dto.setPatientCode(entity.getPatient().getPatientCode());
        }

        if (entity.getRecordedBy() != null) {
            dto.setRecordedById(entity.getRecordedBy().getId());
            dto.setRecordedByName(entity.getRecordedBy().getFullName());
        }

        return dto;
    }
}
