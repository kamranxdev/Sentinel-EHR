package com.sentinel.clinical.dto;

public class CreateClinicalDocumentRequest {
    private String documentType;
    private String title;
    private String content;

    public CreateClinicalDocumentRequest() {}

    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
