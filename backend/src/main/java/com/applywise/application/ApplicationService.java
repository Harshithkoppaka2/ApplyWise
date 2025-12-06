package com.applywise.application;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ApplicationService {
    private final ApplicationRepository repository;

    public ApplicationService(ApplicationRepository repository) { this.repository = repository; }

    public List<Application> list() {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "appliedOn", "id"));
    }

    public Application create(Application application) {
        application.setId(null);
        return repository.save(application);
    }

    public Application update(Long id, Application changes) {
        Application current = repository.findById(id).orElseThrow(() -> new ApplicationNotFoundException(id));
        current.setCompany(changes.getCompany());
        current.setRole(changes.getRole());
        current.setLocation(changes.getLocation());
        current.setStatus(changes.getStatus());
        current.setAppliedOn(changes.getAppliedOn());
        current.setResumeVersion(changes.getResumeVersion());
        current.setJobUrl(changes.getJobUrl());
        current.setJobDescription(changes.getJobDescription());
        current.setNotes(changes.getNotes());
        return repository.save(current);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) throw new ApplicationNotFoundException(id);
        repository.deleteById(id);
    }
}
