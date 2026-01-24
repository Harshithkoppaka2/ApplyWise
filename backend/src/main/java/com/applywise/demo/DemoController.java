package com.applywise.demo;

import com.applywise.application.*;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/demo")
public class DemoController {
    private final ApplicationRepository repository;
    public DemoController(ApplicationRepository repository) { this.repository = repository; }
    @PostMapping("/load") public Map<String, Object> load() {
        if (repository.count() > 0) return Map.of("added", 0, "message", "Demo data loads only into an empty database.");
        List<Application> records = new ArrayList<>();
        String[][] data = {
            {"Northstar Labs", "Java Backend Engineer", "INTERVIEW", "Backend v2", "22"},
            {"ClearPath", "Software Engineer - Java", "ASSESSMENT", "Backend v2", "18"},
            {"Orbit Systems", "Backend Developer", "REJECTED", "Backend v1", "37"},
            {"Cedar Cloud", "Full Stack Engineer", "APPLIED", "Full Stack", "20"},
            {"Maple Analytics", "AI Software Engineer", "APPLIED", "AI v1", "8"},
            {"Peak Financial", "Java Software Engineer", "INTERVIEW", "Backend v2", "31"},
            {"Westline", "Frontend Engineer", "REJECTED", "Full Stack", "14"},
            {"Horizon Apps", "Java Backend Engineer", "APPLIED", "Backend v1", "29"},
            {"Atlas Data", "AI Engineer", "REJECTED", "AI v1", "42"},
            {"Brightbase", "Software Engineer", "OFFER", "Backend v2", "48"}
        };
        for (String[] row : data) {
            Application a = new Application();
            a.setCompany(row[0]); a.setRole(row[1]); a.setStatus(ApplicationStatus.valueOf(row[2]));
            a.setResumeVersion(row[3]); a.setAppliedOn(LocalDate.now().minusDays(Long.parseLong(row[4])));
            a.setLocation("United States");
            records.add(a);
        }
        repository.saveAll(records);
        return Map.of("added", records.size());
    }
}
