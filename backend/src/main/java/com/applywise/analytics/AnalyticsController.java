package com.applywise.analytics;

import com.applywise.application.Application;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
    private final AnalyticsService service;
    public AnalyticsController(AnalyticsService service) { this.service = service; }
    @GetMapping("/summary") public AnalyticsService.Summary summary() { return service.summary(); }
    @GetMapping("/roles") public List<AnalyticsService.Breakdown> roles() { return service.byRole(); }
    @GetMapping("/resumes") public List<AnalyticsService.Breakdown> resumes() { return service.byResume(); }
    @GetMapping("/follow-ups") public List<Application> followUps() { return service.followUps(); }
}
