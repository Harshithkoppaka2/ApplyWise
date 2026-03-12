# ApplyWise learning guide

Start with one feature: **Add application**.

1. `main.tsx` takes the form values and calls `api.create(draft)`.
2. `api.ts` sends a POST request to `/api/applications`.
3. `ApplicationController` receives the JSON and validates required fields.
4. `ApplicationService` checks the business operation and saves through `ApplicationRepository`.
5. Spring Data JPA saves an `Application` record to H2.
6. The frontend fetches applications again and updates the screen.

Next, follow **response rate**:

`AnalyticsController` -> `AnalyticsService.summary()` -> `ApplicationRepository.findAll()` -> count Assessment/Interview/Offer -> divide by all applications.

Finally, follow **AI advisor**:

`AdvisorController` -> `AdvisorService.ask()` -> choose allowed tool -> `AnalyticsService` -> response.

No LLM key means deterministic fallback. With a key, the LLM selects the tool and explains the returned data; Java still computes the statistics.

Try adding one APPLIED application and then changing it to ASSESSMENT. Watch the response rate update. Then write a unit test for a 0-application case.
