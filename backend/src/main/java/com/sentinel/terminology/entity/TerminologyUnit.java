package com.sentinel.terminology.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "units", schema = "terminology")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TerminologyUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(length = 100)
    private String display;

    @Column(name = "ucum_code", length = 50)
    private String ucumCode;

    public TerminologyUnit() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDisplay() { return display; }
    public void setDisplay(String display) { this.display = display; }

    public String getUcumCode() { return ucumCode; }
    public void setUcumCode(String ucumCode) { this.ucumCode = ucumCode; }
}
