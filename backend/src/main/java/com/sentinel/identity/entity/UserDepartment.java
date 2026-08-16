package com.sentinel.identity.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sentinel.tenancy.entity.Department;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "user_departments", schema = "identity",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "department_id"}))
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class UserDepartment {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    public UserDepartment() {}

    public UserDepartment(User user, Department department) {
        this.user = user;
        this.department = department;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
}
