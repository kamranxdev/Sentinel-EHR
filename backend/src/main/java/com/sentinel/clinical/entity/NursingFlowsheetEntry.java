package com.sentinel.clinical.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "nursing_flowsheet_entries", schema = "clinical")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class NursingFlowsheetEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "flowsheet_id", nullable = false)
    private NursingFlowsheet flowsheet;

    @Column(nullable = false, length = 100)
    private String itemKey;

    private String itemValue;

    public NursingFlowsheetEntry() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public NursingFlowsheet getFlowsheet() { return flowsheet; }
    public void setFlowsheet(NursingFlowsheet flowsheet) { this.flowsheet = flowsheet; }

    public String getItemKey() { return itemKey; }
    public void setItemKey(String itemKey) { this.itemKey = itemKey; }

    public String getItemValue() { return itemValue; }
    public void setItemValue(String itemValue) { this.itemValue = itemValue; }
}
