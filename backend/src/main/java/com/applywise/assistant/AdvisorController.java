package com.applywise.assistant;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/assistant")
public class AdvisorController {
    private final AdvisorService service;
    public AdvisorController(AdvisorService service) { this.service = service; }
    @PostMapping public ResponseEntity<?> ask(@RequestBody AdvisorService.Question request) {
        if (request.question() == null || request.question().isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Write a question first."));
        return ResponseEntity.ok(service.ask(request.question()));
    }
}
