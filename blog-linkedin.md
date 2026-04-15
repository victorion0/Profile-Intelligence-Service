🚀 Just built and deployed a full-stack Profile Intelligence API from scratch!

Here's what it does:
You send a name → it enriches it with gender, age, and nationality data using 3 external APIs, stores it in PostgreSQL, and serves it through clean REST endpoints.

🛠️ Tech Stack:
• Node.js + Express.js
• Neon (Serverless PostgreSQL)
• Vercel (deployment)
• Genderize, Agify, Nationalize APIs

📡 Live Endpoints:
✅ POST /api/profiles — Create with idempotency
✅ GET /api/profiles/:id — Retrieve by ID
✅ GET /api/profiles — List with filters (gender, country, age_group)
✅ DELETE /api/profiles/:id — Soft delete

💡 Key features:
• Idempotency (no duplicate profiles)
• Parallel external API calls (300ms response time)
• UUID v7 time-ordered IDs
• UTC ISO 8601 timestamps
• Case-insensitive filtering
• Clean error handling (400, 404, 422, 502, 500)

🐛 Biggest challenge:
Getting everything to work in Vercel's serverless environment. Traditional database drivers (pg) and ORMs (Prisma 7) had compatibility issues. The solution? Switched to Neon's HTTP client and wrote a custom UUID v7 generator in 20 lines.

📖 Full write-up on dev.to: [link to your post]

🔗 GitHub: https://github.com/victorion0/Profile-Intelligence-Service
🌐 Live API: https://profile-intelligence-service-beige.vercel.app

#BackendDevelopment #NodeJS #JavaScript #PostgreSQL #API #Vercel #WebDevelopment #OpenSource
