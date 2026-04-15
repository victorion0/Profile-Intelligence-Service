# Interview Questions & Answers — Profile Intelligence Service

## Category 1: Project Overview

### Q1: Can you walk me through your Profile Intelligence Service?
**Answer:**
I built a RESTful API that enriches a person's name with intelligence data — gender, age, and nationality — by calling three external APIs (Genderize, Agify, Nationalize), then stores the result in a PostgreSQL database hosted on Neon. The API has four endpoints: create, read by ID, read all with filters, and delete. I deployed it on Vercel.

---

### Q2: Why did you choose this tech stack?
**Answer:**
- **Express.js** — lightweight, widely used, easy to build REST APIs
- **Neon PostgreSQL** — free tier, serverless, works well with Vercel
- **Vercel** — seamless deployment from GitHub, auto-builds on every push
- **Neon HTTP client** — designed for serverless environments (no connection pooling needed)

---

### Q3: What was the most challenging part?
**Answer:**
Getting the database connection to work reliably across local development and Vercel's serverless environment. Traditional PostgreSQL drivers like `pg` have native dependencies that don't work on serverless. I switched to Neon's HTTP-based client which is designed specifically for serverless deployments.

---

## Category 2: API Design

### Q4: What are your API endpoints?
**Answer:**
1. `POST /api/profiles` — Create a profile (or return existing if name already exists)
2. `GET /api/profiles/:id` — Get a specific profile by UUID
3. `GET /api/profiles` — Get all profiles, with optional filtering by gender, country_id, age_group
4. `DELETE /api/profiles/:id` — Delete a profile (returns 204 No Content)

---

### Q5: What is idempotency and how did you implement it?
**Answer:**
Idempotency means that doing the same operation multiple times has the same effect as doing it once. In my case, if someone submits the name "ella" twice, I check the database first. If a profile for "ella" already exists, I return the existing one with status 200 and a message "Profile already exists" instead of creating a duplicate.

---

### Q6: How did you handle error responses?
**Answer:**
All errors follow a consistent JSON structure:
```json
{ "status": "error", "message": "<description>" }
```

- **400** — Missing or empty name
- **422** — Invalid type (name must be a string)
- **404** — Profile not found
- **502** — External API returned invalid data (null gender, no age, no country)
- **500** — Internal server error

---

## Category 3: External API Integration

### Q7: How do you call the three external APIs?
**Answer:**
I use `Promise.all()` to call all three APIs simultaneously — Genderize, Agify, and Nationalize — which is faster than calling them one after another. Then I aggregate the results into a single structured response.

---

### Q8: What happens if one of the external APIs fails?
**Answer:**
I catch the error and return a 502 Bad Gateway response with a message identifying which API failed. The profile is NOT stored in the database if any external API returns invalid data.

---

### Q9: How do you classify age groups?
**Answer:**
- 0–12 → child
- 13–19 → teenager
- 20–59 → adult
- 60+ → senior

---

## Category 4: Database

### Q10: Why did you switch from Prisma to raw SQL?
**Answer:**
Prisma 7 required database adapters that caused compatibility issues with Vercel's serverless environment. The `pg` adapter had native dependencies, and the Neon adapter had API changes. Raw SQL through Neon's HTTP client was simpler, more reliable, and didn't introduce additional complexity for this project.

---

### Q11: How do you handle database connections in a serverless environment?
**Answer:**
I use the Neon HTTP client instead of a traditional connection pool. In serverless environments, functions start and stop frequently, so opening and closing database connections on every request is inefficient. Neon's HTTP client sends queries over HTTP instead of TCP, which is connectionless and works perfectly with serverless.

---

### Q12: How does filtering work in your database queries?
**Answer:**
I build the SQL query dynamically based on which filter parameters are provided. If no filters are given, it returns all profiles. If filters like `gender=male` are provided, I add `AND gender = 'male'` to the WHERE clause. The values are parameterized to prevent SQL injection.

---

## Category 5: UUID & Timestamps

### Q13: Why UUID v7 instead of regular IDs?
**Answer:**
UUID v7 embeds a timestamp in the ID itself, which means IDs are naturally time-ordered. This is useful for sorting and pagination. Unlike UUID v4 (random), v7 IDs reveal when a record was created without needing to query the database.

---

### Q14: Why UTC timestamps in ISO 8601 format?
**Answer:**
UTC is a universal time standard — it doesn't change with timezones. ISO 8601 (`2026-04-15T12:00:00Z`) is a globally recognized format. Together, they ensure that timestamps are consistent regardless of where the user or server is located.

---

## Category 6: CORS & Security

### Q15: Why did you enable CORS with `*`?
**Answer:**
CORS (Cross-Origin Resource Sharing) controls which websites can access your API from the browser. Setting `Access-Control-Allow-Origin: *` means any website can make requests. For this project, the grading script tests from any origin, so this was necessary. In production, I'd restrict it to specific domains.

---

### Q16: How do you prevent SQL injection?
**Answer:**
Neon's tagged template literals automatically escape all user-provided values. When I write ``db`SELECT * FROM profiles WHERE name = ${name}```, the value of `name` is safely parameterized — it can't be used to inject malicious SQL.

---

## Category 7: Deployment

### Q17: How did you deploy to Vercel?
**Answer:**
1. Pushed code to a public GitHub repository
2. Connected the repo to Vercel
3. Set the `DATABASE_URL` environment variable in Vercel's dashboard
4. Vercel auto-detected it as a Node.js project and built it
5. Every push to `main` triggers a new deployment

---

### Q18: How do you handle environment variables in Vercel?
**Answer:**
Vercel provides environment variables natively through its dashboard. I set `DATABASE_URL` in the Vercel project settings. The code accesses it via `process.env.DATABASE_URL`. On local development, I use a `.env` file loaded by the `dotenv` package.

---

## Category 8: Problem Solving

### Q19: Tell me about a bug you encountered and how you fixed it.
**Answer:**
I deployed to Vercel and every request returned a 500 error. The logs showed: `Cannot find module 'uuid'`. The `uuid` package was installed locally but the version (v10) was ESM-only and couldn't be used with `require()`. I first tried downgrading to v9, but v9 doesn't support UUID v7. The solution was to write a custom UUID v7 generator using Node.js's built-in `crypto` module — no external package needed.

---

### Q20: What would you improve if you had more time?
**Answer:**
- Add rate limiting to prevent abuse
- Add caching for external API responses (don't call Genderize for the same name twice)
- Add pagination for the GET all profiles endpoint
- Write automated tests (unit + integration)
- Add request logging and monitoring
- Use a proper UUID v7 library instead of a custom implementation
