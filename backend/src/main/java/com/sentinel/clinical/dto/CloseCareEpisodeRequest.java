package com.sentinel.clinical.dto;

import java.time.OffsetDateTime;

public class CloseCareEpisodeRequest {
    private String outcome;
    private String closingNotes;
    private OffsetDateTime endedAt;

    public CloseCareEpisodeRequest() {}

    public String getOutcome() { return outcome; }
    public void setOutcome(String outcome) { this.outcome = outcome; }

    public String getClosingNotes() { return closingNotes; }
    public void setClosingNotes(String closingNotes) { this.closingNotes = closingNotes; }

    public OffsetDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(OffsetDateTime endedAt) { this.endedAt = endedAt; }
}
