package com.sentinel.documents.dto;

public class CreateDocumentVersionRequest {
    private String storageKey;
    private String checksum;
    private Long fileSize;

    public CreateDocumentVersionRequest() {}

    public String getStorageKey() { return storageKey; }
    public void setStorageKey(String storageKey) { this.storageKey = storageKey; }
    public String getChecksum() { return checksum; }
    public void setChecksum(String checksum) { this.checksum = checksum; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
}
