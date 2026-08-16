package com.sentinel.scheduling.dto;

public class AppointmentNoteRequestDTO {
    private String noteType;
    private String content;

    public AppointmentNoteRequestDTO() {}

    public AppointmentNoteRequestDTO(String noteType, String content) {
        this.noteType = noteType;
        this.content = content;
    }

    public String getNoteType() {
        return noteType;
    }

    public void setNoteType(String noteType) {
        this.noteType = noteType;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
