package com.sentinel.pharmacy.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "medication_order_doses", schema = "pharmacy")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MedicationOrderDose {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medication_order_id", nullable = false)
    private Prescription medicationOrder;

    @Column(nullable = false, precision = 12, scale = 4)
    private BigDecimal dose;

    @Column(name = "dose_unit", nullable = false, length = 50)
    private String doseUnit;

    @Column(length = 100)
    private String route;

    @Column(length = 100)
    private String frequency;

    @Column(name = "is_prn", nullable = false)
    private Boolean isPrn = false;

    @Column(name = "prn_reason", length = 255)
    private String prnReason;

    public MedicationOrderDose() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Prescription getMedicationOrder() { return medicationOrder; }
    public void setMedicationOrder(Prescription medicationOrder) { this.medicationOrder = medicationOrder; }

    public BigDecimal getDose() { return dose; }
    public void setDose(BigDecimal dose) { this.dose = dose; }

    public String getDoseUnit() { return doseUnit; }
    public void setDoseUnit(String doseUnit) { this.doseUnit = doseUnit; }

    public String getRoute() { return route; }
    public void setRoute(String route) { this.route = route; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public Boolean getIsPrn() { return isPrn; }
    public void setIsPrn(Boolean isPrn) { this.isPrn = isPrn; }

    public String getPrnReason() { return prnReason; }
    public void setPrnReason(String prnReason) { this.prnReason = prnReason; }
}
