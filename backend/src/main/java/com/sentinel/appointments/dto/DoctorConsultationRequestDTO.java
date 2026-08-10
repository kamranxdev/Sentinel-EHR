package com.sentinel.appointments.dto;

import com.sentinel.appointments.entity.AppointmentLabOrder;
import com.sentinel.diagnoses.entity.Diagnosis;
import com.sentinel.prescriptions.entity.Prescription;

import java.util.List;

public class DoctorConsultationRequestDTO {
    private String doctorNotes;
    private String followUpDate;
    private List<Diagnosis> diagnoses;
    private List<Prescription> prescriptions;
    private List<AppointmentLabOrder> labOrders;

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

    public List<Diagnosis> getDiagnoses() {
        return diagnoses;
    }

    public void setDiagnoses(List<Diagnosis> diagnoses) {
        this.diagnoses = diagnoses;
    }

    public List<Prescription> getPrescriptions() {
        return prescriptions;
    }

    public void setPrescriptions(List<Prescription> prescriptions) {
        this.prescriptions = prescriptions;
    }

    public List<AppointmentLabOrder> getLabOrders() {
        return labOrders;
    }

    public void setLabOrders(List<AppointmentLabOrder> labOrders) {
        this.labOrders = labOrders;
    }
}
