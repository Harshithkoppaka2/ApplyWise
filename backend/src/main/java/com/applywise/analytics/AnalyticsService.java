package com.applywise.analytics;

import com.applywise.application.*;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {
    private final ApplicationRepository repository;
    public AnalyticsService(ApplicationRepository repository) { this.repository = repository; }

    public record Summary(long total, long responses, long interviews, long offers, long rejected, double responseRate) {}
    public record Breakdown(String name, long applied, long responses, double responseRate) {}

    public Summary summary() {
        List<Application> items = repository.findAll();
        long responses = items.stream().filter(a -> hasResponse(a.getStatus())).count();
        long interviews = items.stream().filter(a -> a.getStatus() == ApplicationStatus.INTERVIEW || a.getStatus() == ApplicationStatus.OFFER).count();
        long offers = items.stream().filter(a -> a.getStatus() == ApplicationStatus.OFFER).count();
        long rejected = items.stream().filter(a -> a.getStatus() == ApplicationStatus.REJECTED).count();
        return new Summary(items.size(), responses, interviews, offers, rejected, percent(responses, items.size()));
    }

    public List<Breakdown> byRole() {
        return breakdown(repository.findAll().stream().collect(Collectors.groupingBy(a -> {
            String role = a.getRole().toLowerCase();
            if (role.contains("backend") || role.contains("java")) return "Java / Backend";
            if (role.contains("full") || role.contains("frontend")) return "Full Stack / Frontend";
            if (role.contains("ai") || role.contains("machine learning")) return "AI / ML";
            return "Other software roles";
        })));
    }

    public List<Breakdown> byResume() {
        return breakdown(repository.findAll().stream().collect(Collectors.groupingBy(a ->
            a.getResumeVersion() == null || a.getResumeVersion().isBlank() ? "Default" : a.getResumeVersion())));
    }

    public List<Application> followUps() {
        LocalDate cutoff = LocalDate.now().minusDays(14);
        return repository.findAll().stream()
            .filter(a -> a.getStatus() == ApplicationStatus.APPLIED && a.getAppliedOn() != null && !a.getAppliedOn().isAfter(cutoff))
            .sorted(Comparator.comparing(Application::getAppliedOn))
            .limit(20).toList();
    }

    private List<Breakdown> breakdown(Map<String, List<Application>> groups) {
        return groups.entrySet().stream().map(e -> {
            long responses = e.getValue().stream().filter(a -> hasResponse(a.getStatus())).count();
            return new Breakdown(e.getKey(), e.getValue().size(), responses, percent(responses, e.getValue().size()));
        }).sorted(Comparator.comparingLong(Breakdown::applied).reversed()).toList();
    }

    private boolean hasResponse(ApplicationStatus status) {
        return status == ApplicationStatus.ASSESSMENT || status == ApplicationStatus.INTERVIEW || status == ApplicationStatus.OFFER;
    }

    private double percent(long count, long total) {
        return total == 0 ? 0 : Math.round(1000.0 * count / total) / 10.0;
    }
}
