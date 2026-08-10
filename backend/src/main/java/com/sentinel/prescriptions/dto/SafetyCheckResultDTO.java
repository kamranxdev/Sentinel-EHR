package com.sentinel.prescriptions.dto;

public class SafetyCheckResultDTO {
    private final boolean safe;
    private final String severity;
    private final String conflictingAllergen;
    private final String message;
    private final String alertType;

    public SafetyCheckResultDTO(boolean safe, String severity, String conflictingAllergen, String message) {
        this(safe, severity, conflictingAllergen, message, "NONE");
    }

    public SafetyCheckResultDTO(boolean safe, String severity, String conflictingAllergen, String message, String alertType) {
        this.safe = safe;
        this.severity = severity;
        this.conflictingAllergen = conflictingAllergen;
        this.message = message;
        this.alertType = alertType;
    }

    public boolean isSafe() { return safe; }
    public String getSeverity() { return severity; }
    public String getConflictingAllergen() { return conflictingAllergen; }
    public String getMessage() { return message; }
    public String getAlertType() { return alertType; }
}
