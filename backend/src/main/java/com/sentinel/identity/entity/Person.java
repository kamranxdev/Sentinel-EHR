package com.sentinel.identity.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "persons", schema = "identity")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Person {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String firstName;

    @Column(length = 100)
    private String middleName;

    @Column(length = 100)
    private String lastName;

    @Column(length = 150)
    private String preferredName;

    private LocalDate dateOfBirth;

    @Column(nullable = false)
    private Boolean dateOfBirthEstimated = false;

    @Column(length = 30)
    private String sexAtBirth;

    @Column(length = 50)
    private String genderIdentity;

    @Column(length = 50)
    private String maritalStatus;

    @Column(length = 100)
    private String nationality;

    @Column(length = 100)
    private String preferredLanguage;

    @Transient
    private String email;

    @Transient
    private String phone;

    @Column(nullable = false)
    private Boolean deceased = false;

    private OffsetDateTime deceasedAt;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public Person() {}

    public Person(String firstName, String lastName, String sexAtBirth, LocalDate dateOfBirth) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.sexAtBirth = sexAtBirth;
        this.dateOfBirth = dateOfBirth;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getMiddleName() { return middleName; }
    public void setMiddleName(String middleName) { this.middleName = middleName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPreferredName() { return preferredName; }
    public void setPreferredName(String preferredName) { this.preferredName = preferredName; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public Boolean getDateOfBirthEstimated() { return dateOfBirthEstimated; }
    public void setDateOfBirthEstimated(Boolean dateOfBirthEstimated) { this.dateOfBirthEstimated = dateOfBirthEstimated; }

    public String getSexAtBirth() { return sexAtBirth; }
    public void setSexAtBirth(String sexAtBirth) { this.sexAtBirth = sexAtBirth; }

    public String getGenderIdentity() { return genderIdentity; }
    public void setGenderIdentity(String genderIdentity) { this.genderIdentity = genderIdentity; }

    public String getMaritalStatus() { return maritalStatus; }
    public void setMaritalStatus(String maritalStatus) { this.maritalStatus = maritalStatus; }

    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }

    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Boolean getDeceased() { return deceased; }
    public void setDeceased(Boolean deceased) { this.deceased = deceased; }

    public OffsetDateTime getDeceasedAt() { return deceasedAt; }
    public void setDeceasedAt(OffsetDateTime deceasedAt) { this.deceasedAt = deceasedAt; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getFullName() {
        StringBuilder sb = new StringBuilder();
        if (firstName != null && !firstName.isEmpty()) sb.append(firstName);
        if (middleName != null && !middleName.isEmpty()) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(middleName);
        }
        if (lastName != null && !lastName.isEmpty()) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(lastName);
        }
        return sb.toString();
    }
}
