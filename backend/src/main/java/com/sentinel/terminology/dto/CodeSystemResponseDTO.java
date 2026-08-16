package com.sentinel.terminology.dto;

import java.util.UUID;

public class CodeSystemResponseDTO {
    private UUID id;
    private String code;
    private String name;
    private String uri;
    private String version;

    public CodeSystemResponseDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getUri() { return uri; }
    public void setUri(String uri) { this.uri = uri; }
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
}
