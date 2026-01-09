package com.applywise.assistant;

import com.applywise.analytics.AnalyticsService;
import com.applywise.application.Application;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.util.*;

@Service
public class AdvisorService {
    private final AnalyticsService analytics;
    private final ObjectMapper mapper;
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(8)).build();
    @Value("${applywise.ai.api-key:}") private String apiKey;
    @Value("${applywise.ai.model:gpt-4.1-mini}") private String model;
    @Value("${applywise.ai.url:https://api.openai.com/v1/chat/completions}") private String url;

    public record Answer(String answer, String source, String toolUsed) {}
    public record Question(String question) {}
    public AdvisorService(AnalyticsService analytics, ObjectMapper mapper) {
        this.analytics = analytics;
        this.mapper = mapper;
    }

    public Answer ask(String question) {
        if (question == null || question.isBlank()) throw new IllegalArgumentException("Write a question first.");
        String tool = chooseTool(question);
        Object data = runTool(tool);
        String defaultAnswer = localAnswer(tool, data);
        if (apiKey == null || apiKey.isBlank()) return new Answer(defaultAnswer, "local", tool);
        try {
            String instruction = "You are ApplyWise, a careful job-search analyst. Answer using ONLY the tool data below. " +
                "Avoid making up reasons for employer decisions. Give concise, actionable advice. " +
                "Never promise that an application or resume will succeed. Tool: " + tool + ". Data: " + mapper.writeValueAsString(data);
            String result = complete(instruction, question);
            return new Answer(result, "ai", tool);
        } catch (Exception ex) {
            return new Answer(defaultAnswer + " (AI provider unavailable; showing local analysis.)", "local", tool);
        }
    }

    private String chooseTool(String question) {
        String q = question.toLowerCase(Locale.ROOT);
        if (apiKey != null && !apiKey.isBlank()) {
            try {
                String chosen = complete("Choose exactly ONE tool name: summary, roles, resumes, followups. " +
                    "Return only that word. No punctuation.", question).trim().toLowerCase(Locale.ROOT);
                if (Set.of("summary", "roles", "resumes", "followups").contains(chosen)) return chosen;
            } catch (Exception ignored) { }
        }
        if (q.contains("resume") || q.contains("version")) return "resumes";
        if (q.contains("follow") || q.contains("old") || q.contains("pending")) return "followups";
        if (q.contains("role") || q.contains("java") || q.contains("backend") || q.contains("category")) return "roles";
        return "summary";
    }

    private Object runTool(String tool) {
        return switch (tool) {
            case "resumes" -> analytics.byResume();
            case "roles" -> analytics.byRole();
            case "followups" -> analytics.followUps();
            default -> analytics.summary();
        };
    }

    private String localAnswer(String tool, Object data) {
        return switch (tool) {
            case "resumes" -> breakdownAnswer("resume versions", analytics.byResume());
            case "roles" -> breakdownAnswer("role groups", analytics.byRole());
            case "followups" -> {
                List<Application> items = analytics.followUps();
                if (items.isEmpty()) yield "No applications are currently flagged for a 14-day follow-up. Add more applications or check again later.";
                yield "You have " + items.size() + " applications older than 14 days still marked Applied. " +
                    "Consider reviewing " + items.get(0).getCompany() + " first. Follow up when an appropriate contact exists; avoid repeated unsolicited messages.";
            }
            default -> {
                AnalyticsService.Summary s = analytics.summary();
                if (s.total() == 0) yield "Add your first application to see trends. I will compare outcomes rather than guess why recruiters respond.";
                yield "You tracked " + s.total() + " applications, " + s.responses() + " recorded positive responses (" +
                    s.responseRate() + "%), and " + s.interviews() + " interviews or offers. This is a descriptive metric, not a prediction. " +
                    "Compare role groups and resume versions before changing your approach.";
            }
        };
    }

    private String breakdownAnswer(String label, List<AnalyticsService.Breakdown> groups) {
        if (groups.isEmpty()) return "No " + label + " to compare yet. Add applications and their outcomes first.";
        StringBuilder text = new StringBuilder("Recorded outcomes across " + label + ": ");
        for (var b : groups) text.append(b.name()).append(" — ").append(b.responses()).append("/")
            .append(b.applied()).append(" responses (").append(b.responseRate()).append("%); ");
        return text.append("Small samples can be misleading. Compare similar roles and periods, and don't interpret missing responses as confirmed rejections.").toString();
    }

    private String complete(String system, String question) throws Exception {
        Map<String, Object> body = Map.of("model", model, "temperature", 0.2,
            "messages", List.of(Map.of("role", "system", "content", system), Map.of("role", "user", "content", question)));
        HttpRequest request = HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofSeconds(20))
            .header("Content-Type", "application/json").header("Authorization", "Bearer " + apiKey)
            .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body))).build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() / 100 != 2) throw new IllegalStateException("AI request failed");
        JsonNode node = mapper.readTree(response.body()).path("choices").path(0).path("message").path("content");
        if (!node.isTextual()) throw new IllegalStateException("Missing AI response");
        return node.asText();
    }
}
