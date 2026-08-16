package com.sentinel.terminology.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateCodeSystemRequest {
    @NotBlank(message = "Code is required")
    private String code;
    @NotBlank(message = "Name is required")
    private String name;
    private String uri;
    private String version;

    public CreateCodeSystemRequest() {}

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getUri() { return uri; }
    public void setUri(String uri) { this.uri = uri; }
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
}
