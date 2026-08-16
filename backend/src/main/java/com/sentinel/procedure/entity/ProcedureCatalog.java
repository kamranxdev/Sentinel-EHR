package com.sentinel.procedure.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "procedure_catalog", schema = "procedures")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ProcedureCatalog {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(length = 100)
    private String code;

    @Column(name = "code_system", length = 50)
    private String codeSystem;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false)
    private Boolean active = true;

    public ProcedureCatalog() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getCodeSystem() { return codeSystem; }
    public void setCodeSystem(String codeSystem) { this.codeSystem = codeSystem; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
