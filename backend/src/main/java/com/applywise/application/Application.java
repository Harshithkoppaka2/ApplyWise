package com.applywise.application;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Entity
@Table(name = "applications")
public class Application {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank private String company;
    @NotBlank private String role;
    private String location;
    @Enumerated(EnumType.STRING) private ApplicationStatus status = ApplicationStatus.APPLIED;
    @NotNull private LocalDate appliedOn = LocalDate.now();
    private String resumeVersion = "Default";
    private String jobUrl;
    @Column(length = 12000) private String jobDescription;
    @Column(length = 2000) private String notes;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }
    public LocalDate getAppliedOn() { return appliedOn; }
    public void setAppliedOn(LocalDate appliedOn) { this.appliedOn = appliedOn; }
    public String getResumeVersion() { return resumeVersion; }
    public void setResumeVersion(String resumeVersion) { this.resumeVersion = resumeVersion; }
    public String getJobUrl() { return jobUrl; }
    public void setJobUrl(String jobUrl) { this.jobUrl = jobUrl; }
    public String getJobDescription() { return jobDescription; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
