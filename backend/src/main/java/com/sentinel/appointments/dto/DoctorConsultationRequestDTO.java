package com.sentinel.appointments.dto;

import com.sentinel.diagnoses.dto.DiagnosisRequestDTO;
import com.sentinel.prescriptions.dto.PrescriptionRequestDTO;

import java.util.List;

public class DoctorConsultationRequestDTO {
    private String doctorNotes;
    private String followUpDate;
    private List<DiagnosisRequestDTO> diagnoses;
    private List<PrescriptionRequestDTO> prescriptions;
    private List<AppointmentLabOrderDTO> labOrders;

    public DoctorConsultationRequestDTO() {}

    public String getDoctorNotes() {
        return doctorNotes;
    }

    public void setDoctorNotes(String doctorNotes) {
        this.doctorNotes = doctorNotes;
    }

    public String getFollowUpDate() {
        return followUpDate;
    }

    public void setFollowUpDate(String followUpDate) {
        this.followUpDate = followUpDate;
    }

    public List<DiagnosisRequestDTO> getDiagnoses() {
        return diagnoses;
    }

    public void setDiagnoses(List<DiagnosisRequestDTO> diagnoses) {
        this.diagnoses = diagnoses;
    }

    public List<PrescriptionRequestDTO> getPrescriptions() {
        return prescriptions;
    }

    public void setPrescriptions(List<PrescriptionRequestDTO> prescriptions) {
        this.prescriptions = prescriptions;
    }

    public List<AppointmentLabOrderDTO> getLabOrders() {
        return labOrders;
    }

    public void setLabOrders(List<AppointmentLabOrderDTO> labOrders) {
        this.labOrders = labOrders;
    }
}
