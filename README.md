# ApplyWise

**A job application tracker that helps you understand what's actually working in your job search.**

## Why I built this

I started working on ApplyWise because I ran into a problem during my own job search.

After applying to hundreds of software engineering positions, I realized that keeping track of applications wasn't the difficult part. Understanding the results was.

I could see how many jobs I'd applied to, but I couldn't easily answer questions like:

- Am I getting more responses for backend roles or full-stack roles?
- Does one version of my resume perform better than another?
- Which applications haven't received a response?
- Am I targeting the right kinds of positions?

I didn't want another tool that automatically submits more applications. I wanted something that would help me make better decisions about the applications I'd already submitted.

That's where ApplyWise started.

## What ApplyWise does

ApplyWise brings job applications, their outcomes, and basic analytics into one place.

**Application tracking**

Add, edit, search, and delete applications. Each record can include the company, position, application date, resume version, and current status.

Applications can move through six statuses: Applied, Assessment, Interview, Offer, Rejected, and Withdrawn.

**Job search analytics**

The dashboard helps identify patterns in application results, including:

- Total applications and response rates
- Responses by job category
- Performance across different resume versions
- Applications that may need follow-up

For example, if Java backend positions are consistently receiving more responses than other roles, that's useful information when deciding where to focus next.

**AI-assisted insights**

ApplyWise also includes an advisor that answers questions using the application's actual data.

You can ask questions such as:

- "Which job categories are getting the most responses?"
- "Which resume version is performing better?"
- "What applications should I follow up on?"
- "How is my overall job search going?"

Instead of guessing, the advisor retrieves relevant statistics from the backend and uses those results to form its response.

**Demo data**

The application includes ten fictional job applications so anyone can explore the dashboard without entering personal information.

## Tech stack

| Area             | Technology                         |
| ---------------- | ---------------------------------- |
| Frontend         | React, TypeScript, Vite            |
| Backend          | Java 17, Spring Boot 3.5           |
| API              | REST                               |
| Persistence      | Spring Data JPA, H2                |
| AI integration   | Optional OpenAI-compatible LLM API |
| Testing          | JUnit, Mockito                     |
| Containerization | Docker, Docker Compose             |

I intentionally kept the application as a single Spring Boot backend with a separate React frontend.

I chose H2 for the database because it makes local setup straightforward. I wanted to spend more time working on the application logic and less time configuring infrastructure.

## How the application works

```text
              React Frontend
                    |
                REST API
                    |
             Spring Boot
                    |
        +-----------+-----------+
        |           |           |
   Applications  Analytics   AI Advisor
        |           |           |
        +-----------+-----------+
                    |
                 H2 Database
```

The application follows a fairly standard Spring Boot structure.

- **Controllers** handle incoming HTTP requests.
- **Services** contain business logic.
- **Repositories** handle database access.
- **Entities** represent the application records.

Keeping these responsibilities separate makes the code easier to understand, test, and extend.

### How the AI advisor works

I wanted the AI feature to do more than generate generic career advice.

The advisor has access to four read-only analytics operations:

`summary` · `roles` · `resumes` · `followups`

When a user asks a question, the application selects the relevant operation and runs the calculations in Java. If an LLM API is configured, the model can help select the operation and explain the results.

Without an API key, the same feature uses a simple rule-based approach and locally generated summaries.

This means the application can still provide useful insights without requiring a paid AI service.

I also kept the advisor read-only. It cannot submit job applications, delete records, or make changes without the user.

## Getting started

### Requirements

- Java 17 or newer
- Maven 3.6.3 or newer
- Node.js 20 or newer
- npm

### 1. Clone the repository

```bash
git clone https://github.com/Harshithkoppaka2/ApplyWise.git
cd ApplyWise
```

### 2. Start the backend

Open a terminal:

```bash
cd backend
mvn spring-boot:run
```

The Spring Boot API runs at:

`http://localhost:8080`

### 3. Start the frontend

Open another terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

Open:

`http://localhost:5173`

When the dashboard opens, select **Load demo data** to explore the application.

### 4. Optional: Enable the AI model

The advisor works without an API key, but you can connect an OpenAI-compatible provider for model-based responses.

On macOS or Linux:

```bash
export OPENAI_API_KEY="your-api-key"
```

Then start the Spring Boot application from that same terminal.

Depending on the provider, you can also configure `AI_MODEL` and `AI_URL`.

API usage may incur charges. When enabled, relevant application analytics and the question are sent to the configured model provider.

### 5. Run with Docker

Alternatively, from the project root:

```bash
docker compose up --build
```

Open `http://localhost:5173`.

## Running tests

The backend includes tests for the application analytics logic.

```bash
cd backend
mvn test
```

## Project structure

```text
ApplyWise/
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/applywise/
│       │   │   ├── application/
│       │   │   ├── analytics/
│       │   │   ├── assistant/
│       │   │   └── demo/
│       │   └── resources/
│       └── test/
├── frontend/
│   ├── src/
│   └── package.json
├── docs/
│   └── LEARNING_GUIDE.md
├── Dockerfile.backend
├── Dockerfile.frontend
├── docker-compose.yml
└── README.md
```

## Engineering decisions and limitations

There are a few things I intentionally kept simple.

**A single backend instead of microservices.** The application doesn't need multiple independently deployed services yet. A single Spring Boot application makes development and debugging easier.

**Local database storage.** H2 is sufficient for the current single-user version. A future deployment could use PostgreSQL with proper database migrations.

**No automatic job applications.** ApplyWise focuses on understanding application outcomes, not increasing the number of applications submitted.

**No fabricated rejection explanations.** The application can compare response rates and identify patterns, but it cannot determine exactly why an employer rejected an application.

**Read-only AI tools.** The advisor retrieves information and recommends actions without modifying user records.

This is currently a local portfolio application. It doesn't include user authentication or account isolation, so it shouldn't be publicly deployed with real personal job-search data in its current form.

## What I'd like to improve next

There are several features I'd like to explore as the project grows:

- Import applications from CSV files
- Upload and manage actual resume versions
- Extract skills from job descriptions
- Add authentication and separate user accounts
- Move from H2 to PostgreSQL
- Add pagination for larger application histories
- Expand the advisor's ability to investigate application trends

I'm keeping these as future improvements rather than adding unnecessary complexity to the first version.

## What I learned

ApplyWise gave me an opportunity to work on a practical problem while bringing together several areas of backend development: REST API design, persistence, business logic, analytics, testing, and AI integration.

One of the more interesting parts was separating the actual data analysis from the AI-generated explanation. The backend is responsible for calculating the numbers, while the AI helps interpret them.

That separation makes the results easier to verify and keeps the application useful even without an AI provider.

The project also reinforced something I value in software development: a useful application doesn't have to be complicated. Sometimes a straightforward solution to a problem you've personally experienced is more valuable than adding technologies just to make the architecture look impressive.

---

**Built by Harshith Koppaka**

[GitHub](https://github.com/Harshithkoppaka2) · [ApplyWise Repository](https://github.com/Harshithkoppaka2/ApplyWise)
