package com.sentinel.pharmacy.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "medication_products", schema = "pharmacy")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MedicationProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medication_id", nullable = false)
    private Medication medication;

    @Column(name = "product_code", length = 100)
    private String productCode;

    @Column(length = 255)
    private String manufacturer;

    @Column(name = "package_description", length = 255)
    private String packageDescription;

    public MedicationProduct() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Medication getMedication() { return medication; }
    public void setMedication(Medication medication) { this.medication = medication; }

    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }

    public String getManufacturer() { return manufacturer; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }

    public String getPackageDescription() { return packageDescription; }
    public void setPackageDescription(String packageDescription) { this.packageDescription = packageDescription; }
}
