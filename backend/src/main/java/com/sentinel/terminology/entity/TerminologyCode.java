package com.sentinel.terminology.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "terminology_codes", schema = "terminology",
       uniqueConstraints = @UniqueConstraint(columnNames = {"code_system_id", "code"}))
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TerminologyCode {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "code_system_id", nullable = false)
    private CodeSystem codeSystem;

    @Column(nullable = false, length = 150)
    private String code;

    @Column(length = 500)
    private String display;

    @Column(name = "parent_code", length = 150)
    private String parentCode;

    @Column(name = "valid_from")
    private LocalDate validFrom;

    @Column(name = "valid_to")
    private LocalDate validTo;

    @Column(nullable = false)
    private Boolean active = true;

    public TerminologyCode() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public CodeSystem getCodeSystem() { return codeSystem; }
    public void setCodeSystem(CodeSystem codeSystem) { this.codeSystem = codeSystem; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDisplay() { return display; }
    public void setDisplay(String display) { this.display = display; }

    public String getParentCode() { return parentCode; }
    public void setParentCode(String parentCode) { this.parentCode = parentCode; }

    public LocalDate getValidFrom() { return validFrom; }
    public void setValidFrom(LocalDate validFrom) { this.validFrom = validFrom; }

    public LocalDate getValidTo() { return validTo; }
    public void setValidTo(LocalDate validTo) { this.validTo = validTo; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
