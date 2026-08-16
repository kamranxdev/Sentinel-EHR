package com.sentinel.clinical.dto;

public class CreateDocumentVersionRequest {
    private String content;
    private String amendmentReason;

    public CreateDocumentVersionRequest() {}

    public CreateDocumentVersionRequest(String content, String amendmentReason) {
        this.content = content;
        this.amendmentReason = amendmentReason;
    }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getAmendmentReason() { return amendmentReason; }
    public void setAmendmentReason(String amendmentReason) { this.amendmentReason = amendmentReason; }
}
