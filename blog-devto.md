# Building a Profile Intelligence API with Node.js, PostgreSQL & Vercel — A Beginner's Journey

> I went from zero to a fully deployed API that enriches names with AI-powered intelligence data. Here's how I built it, the bugs that nearly broke me, and what I learned.

---

## What I Built

A RESTful API service that takes a name and enriches it with:
- 🧬 **Gender** prediction (with probability)
- 📅 **Age** estimation (with age group classification)
- 🌍 **Nationality** prediction (most likely country)

The data comes from three free external APIs, gets aggregated, stored in a PostgreSQL database, and served through clean REST endpoints.

**Live demo:** `https://profile-intelligence-service-beige.vercel.app/api/profiles`  
**GitHub:** `https://github.com/victorion0/Profile-Intelligence-Service`

---

## The Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Runtime | Node.js + Express.js | Fast, simple, great for APIs |
| Database | Neon (PostgreSQL) | Free tier, serverless-native, HTTP-based |
| ORM | Raw SQL (tagged templates) | Prisma 7 caused too many serverless issues |
| Hosting | Vercel | Free, auto-deploy from GitHub |
| External APIs | Genderize, Agify, Nationalize | Free, no API key needed |

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Genderize │     │              │     │             │
├─────────────┤     │              │     │   Neon DB   │
├─────────────┤────▶│  Express.js  │────▶│  (Storage)  │
│   Agify     │     │    Server    │     │             │
├─────────────┤     │              │     │             │
│ Nationalize │     │              │     └─────────────┘
└─────────────┘     └──────────────┘
```

---

## API Endpoints

### `POST /api/profiles` — Create Profile
```json
// Request
{ "name": "ella" }

// Response (201 Created)
{
  "status": "success",
  "data": {
    "id": "019d9246-47a0-7a95-3fe6-5d86ee4a9d03",
    "name": "ella",
    "gender": "female",
    "gender_probability": 0.99,
    "sample_size": 97517,
    "age": 53,
    "age_group": "adult",
    "country_id": "CM",
    "country_probability": 0.097,
    "created_at": "2026-04-15T17:52:52.648Z"
  }
}
```

**Bonus:** If you submit the same name twice, it returns the existing profile with a `"Profile already exists"` message (idempotency).

### `GET /api/profiles/:id` — Get by ID
Returns the full profile data for a given UUID.

### `GET /api/profiles?gender=female&country_id=NG` — List & Filter
Returns all profiles matching the provided filters. Supports `gender`, `country_id`, and `age_group`.

### `DELETE /api/profiles/:id` — Delete
Removes a profile. Returns `204 No Content`.

---

## The Bugs That Nearly Broke Me 🐛

### Bug #1: Prisma 7 vs Serverless
I started with Prisma as my ORM — a great choice on paper. But Prisma 7 changed its architecture and required adapters that didn't play well with Vercel's serverless environment. After hours of debugging, I switched to raw SQL with Neon's HTTP client and everything just worked.

**Lesson:** Sometimes the simplest solution is the best one.

### Bug #2: The `uuid` Package Drama
I needed UUID v7 IDs. The `uuid` package v10 is ESM-only, but my project uses CommonJS (`require()`). I tried v9, but it doesn't support UUID v7. The fix? I wrote a custom UUID v7 generator in 20 lines using Node.js's built-in `crypto` module.

**Lesson:** Don't add a dependency when you can write 20 lines of code.

### Bug #3: `pg` Native Dependencies on Vercel
The `pg` PostgreSQL driver has native C++ bindings that don't compile on Vercel's build servers. The error message was cryptic but the solution was clear: use an HTTP-based client instead.

**Lesson:** Serverless environments have different constraints than your local machine.

---

## Key Technical Decisions

### Why Neon HTTP over `pg`?
Serverless functions are stateless — they start fresh on every request. Traditional database connection pools waste time opening/closing connections. Neon's HTTP client sends queries over HTTPS, which is connectionless and perfect for serverless.

### Why UUID v7?
Unlike random UUIDs (v4), UUID v7 embeds a timestamp. This means:
- IDs are naturally sorted by creation time
- Great for pagination and indexing
- No extra database query needed to find "recent" records

### Why Parallel API Calls?
I call Genderize, Agify, and Nationalize simultaneously using `Promise.all()`. This cuts response time from ~900ms (sequential) to ~300ms (parallel).

---

## Error Handling Strategy

Every error returns a consistent JSON structure:
```json
{ "status": "error", "message": "descriptive message" }
```

| Status | When |
|--------|------|
| 400 | Name is missing or empty |
| 422 | Invalid type (name must be string) |
| 404 | Profile not found |
| 502 | External API returned invalid data |
| 500 | Internal server error |

Edge cases are handled too:
- Genderize returns `null` gender → 502, don't store
- Agify returns `null` age → 502, don't store
- Nationalize returns no countries → 502, don't store

---

## Deployment Pipeline

```
GitHub (push to main)
    ↓
Vercel (auto-detect & build)
    ↓
Database migrations applied
    ↓
Live on the internet 🌍
```

Environment variables (like `DATABASE_URL`) are set in Vercel's dashboard — never committed to code.

---

## What I'd Add Next

- ⏱️ **Rate limiting** — prevent abuse
- 🗂️ **Caching** — don't call external APIs for the same name twice
- 📄 **Pagination** — handle large result sets
- ✅ **Automated tests** — Jest + Supertest
- 📊 **Monitoring** — track response times and error rates
- 🔐 **API key authentication** — protect the endpoints

---

## Lessons Learned

1. **Debugging is 80% of the job.** Writing code is the easy part. Making it work in production is the real challenge.
2. **Serverless has different rules.** What works locally might fail on Vercel. Always test in the deployment environment.
3. **Simplicity wins.** My raw SQL solution was more reliable than three different ORM attempts.
4. **Don't give up.** Every error message is a clue, not a dead end.

---

**⭐ If this was helpful, drop a like or share it with someone learning backend development!**

**🔗 GitHub Repo:** https://github.com/victorion0/Profile-Intelligence-Service  
**🌐 Live API:** https://profile-intelligence-service-beige.vercel.app

---

*Tags:* #nodejs #javascript #backend #postgresql #vercel #api #webdev #beginners #learning
