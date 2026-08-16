package com.sentinel.laboratory.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sentinel.identity.entity.User;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "specimen_collections", schema = "laboratory")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class SpecimenCollection {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "specimen_id", nullable = false)
    private Specimen specimen;

    @Column(name = "collection_method", length = 100)
    private String collectionMethod;

    @Column(name = "collection_site", length = 255)
    private String collectionSite;

    @Column(length = 100)
    private String container;

    @Column(name = "collected_at", nullable = false)
    private OffsetDateTime collectedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collected_by")
    private User collectedBy;

    public SpecimenCollection() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Specimen getSpecimen() { return specimen; }
    public void setSpecimen(Specimen specimen) { this.specimen = specimen; }

    public String getCollectionMethod() { return collectionMethod; }
    public void setCollectionMethod(String collectionMethod) { this.collectionMethod = collectionMethod; }

    public String getCollectionSite() { return collectionSite; }
    public void setCollectionSite(String collectionSite) { this.collectionSite = collectionSite; }

    public String getContainer() { return container; }
    public void setContainer(String container) { this.container = container; }

    public OffsetDateTime getCollectedAt() { return collectedAt; }
    public void setCollectedAt(OffsetDateTime collectedAt) { this.collectedAt = collectedAt; }

    public User getCollectedBy() { return collectedBy; }
    public void setCollectedBy(User collectedBy) { this.collectedBy = collectedBy; }
}
