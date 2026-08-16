package com.sentinel.procedure.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateProcedureNoteRequest {
    private String noteType;
    @NotBlank(message = "Content is required")
    private String content;

    public CreateProcedureNoteRequest() {}

    public String getNoteType() { return noteType; }
    public void setNoteType(String noteType) { this.noteType = noteType; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
