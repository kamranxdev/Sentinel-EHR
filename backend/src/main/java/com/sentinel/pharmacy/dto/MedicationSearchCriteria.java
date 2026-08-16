package com.sentinel.pharmacy.dto;

public class MedicationSearchCriteria {
    private String query;
    private String form;

    public MedicationSearchCriteria() {}

    public MedicationSearchCriteria(String query, String form) {
        this.query = query;
        this.form = form;
    }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
    public String getForm() { return form; }
    public void setForm(String form) { this.form = form; }
}
