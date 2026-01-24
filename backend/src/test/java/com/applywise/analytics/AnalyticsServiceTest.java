package com.applywise.analytics;

import com.applywise.application.*;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AnalyticsServiceTest {
    @Test void countsOnlyPositiveResponses() {
        ApplicationRepository repository = mock(ApplicationRepository.class);
        Application applied = new Application(); applied.setStatus(ApplicationStatus.APPLIED);
        Application rejected = new Application(); rejected.setStatus(ApplicationStatus.REJECTED);
        Application interview = new Application(); interview.setStatus(ApplicationStatus.INTERVIEW);
        when(repository.findAll()).thenReturn(List.of(applied, rejected, interview));
        AnalyticsService.Summary result = new AnalyticsService(repository).summary();
        assertEquals(3, result.total());
        assertEquals(1, result.responses());
        assertEquals(33.3, result.responseRate());
    }
}
