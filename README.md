# ApplyWise

A small job-search workspace for tracking applications and learning what actually gets responses.

I wanted something more useful than a spreadsheet and less complicated than an auto-apply bot. ApplyWise keeps applications, resume versions and outcomes in one place. The advisor reads real summary data before making suggestions — it doesn't invent reasons for rejections.

## What it does

- Save, edit, search and delete job applications.
- Track status: Applied, Assessment, Interview, Offer, Rejected, Withdrawn.
- Compare response rates across role types and resume versions.
- Show applications older than 14 days that may need follow-up.
- Ask questions like "Which roles get the most responses?" and "Which resume performs better?"
- Load 10 fictional applications to explore the app without personal data.
- Run for free with deterministic local insights. An optional OpenAI-compatible API key adds model-based tool selection and explanations.

## Stack

React + TypeScript + Vite, Java 17 + Spring Boot 3.5, Spring Data JPA, file-backed H2, JUnit + Mockito, Docker Compose (optional).

H2 keeps the first version easy to run. You don't need to set up PostgreSQL before learning how the project works.

## Run locally

**Requirements:** Java 17+, Maven 3.6.3+, Node 20+.

Open two terminals:

```bash
cd backend
mvn spring-boot:run
```

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. Click **Load demo data** on the empty dashboard.

The backend runs on port 8080. Vite proxies `/api` to the backend during development. The database is stored at `backend/data/` and survives application restarts.

### Optional AI provider

```bash
export OPENAI_API_KEY="your-key"
# Optional: export AI_MODEL="gpt-4.1-mini"
# Optional: export AI_URL="https://api.openai.com/v1/chat/completions"
```

Start the backend *in the same terminal* after setting the variable. Without a key, the advisor uses local analytics and costs nothing. An AI key may incur provider charges. The provider receives your question and relevant application analytics; **do not use sensitive personal data** with a third-party API unless you are comfortable sending it.

### Docker

```bash
docker compose up --build
```

Open **http://localhost:5173**.

## How the code is organized

- `backend/.../application`: entity, repository, service and REST controller for application records.
- `backend/.../analytics`: calculations for response rates, role groups, resume groups, and follow-ups.
- `backend/.../assistant`: chooses one read-only analytics tool and explains its output.
- `backend/.../demo`: loads fictional data only when your database is empty.
- `frontend/src/api.ts`: network requests to the backend.
- `frontend/src/main.tsx`: page layout, forms, and application state.
- `frontend/src/styles.css`: UI styling.

### The agent, without magic

1. The user asks a question.
2. With a model key, the model selects one of four permitted tools: `summary`, `roles`, `resumes`, `followups`. Without a key, a small rule-based router selects the tool.
3. Java executes the actual analytics query. The model has no direct database access.
4. With a key, the model explains the result. Without one, Java generates a factual summary.

This is deliberately a *small, single-step tool-using agent*, not a multi-agent system. It cannot apply for jobs or modify application records on its own.

## Important limitations

- This is a **local single-user portfolio app**, not a production multi-tenant service. There is no login or account isolation; do not deploy it publicly with personal application data.
- Responses count Assessment, Interview, and Offer. This does not mean a rejection with no earlier positive outcome is a response; it is not counted.
- The app compares outcomes but cannot prove why a recruiter rejected someone.
- Sample data is fictional, and the AI can still make mistakes. Review its suggestions.
- H2 `ddl-auto=update` is convenient for local development; production deployments should use migrations, authentication, and a managed database.

## Tests

```bash
cd backend
mvn test
```

## Next improvements

CSV import, authentication, pagination, resume upload/extraction, and PostgreSQL support. Intentionally not included in v0.1 to keep the project easy to understand.
