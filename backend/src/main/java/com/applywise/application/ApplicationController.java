package com.applywise.application;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {
    private final ApplicationService service;

    public ApplicationController(ApplicationService service) { this.service = service; }

    @GetMapping public List<Application> list() { return service.list(); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public Application create(@Valid @RequestBody Application application) { return service.create(application); }
    @PutMapping("/{id}") public Application update(@PathVariable Long id, @Valid @RequestBody Application application) {
        return service.update(id, application);
    }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }
}
