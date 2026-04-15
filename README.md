# Profile Intelligence Service

A RESTful API service that enrichs names with gender, age, and nationality data using multiple external APIs and persists the results in a PostgreSQL database.

## Features

- **Multi-API Integration**: Genderize, Agify, and Nationalize APIs
- **Data Persistence**: PostgreSQL with Prisma ORM
- **Idempotency**: Prevents duplicate profiles
- **Filtering**: Query profiles by gender, country_id, and age_group
- **CORS Enabled**: Accessible from any origin
- **UUID v7 IDs**: Modern, time-ordered unique identifiers
- **UTC Timestamps**: ISO 8601 format

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Stage_1B_HNG
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Update the `.env` file with your database connection string:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/profile_intelligence?schema=public"
```

4. Generate Prisma client and run migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
```

### Running Locally

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### 1. Create Profile
```http
POST /api/profiles
Content-Type: application/json

{
  "name": "ella"
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": "b3f9c1e2-7d4a-4c91-9c2a-1f0a8e5b6d12",
    "name": "ella",
    "gender": "female",
    "gender_probability": 0.99,
    "sample_size": 1234,
    "age": 46,
    "age_group": "adult",
    "country_id": "DRC",
    "country_probability": 0.85,
    "created_at": "2026-04-01T12:00:00Z"
  }
}
```

**Idempotent Response (200):**
```json
{
  "status": "success",
  "message": "Profile already exists",
  "data": { "..." }
}
```

### 2. Get Profile by ID
```http
GET /api/profiles/{id}
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "...",
    "name": "ella",
    "gender": "female",
    "gender_probability": 0.99,
    "sample_size": 1234,
    "age": 46,
    "age_group": "adult",
    "country_id": "DRC",
    "country_probability": 0.85,
    "created_at": "2026-04-01T12:00:00Z"
  }
}
```

### 3. Get All Profiles (with optional filters)
```http
GET /api/profiles?gender=male&country_id=NG&age_group=adult
```

**Success Response (200):**
```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "id": "id-1",
      "name": "emmanuel",
      "gender": "male",
      "age": 25,
      "age_group": "adult",
      "country_id": "NG"
    }
  ]
}
```

### 4. Delete Profile
```http
DELETE /api/profiles/{id}
```

**Success Response (204 No Content)**

## Error Handling

All errors follow this structure:
```json
{
  "status": "error",
  "message": "<error message>"
}
```

| Status Code | Description |
|-------------|-------------|
| 400 | Missing or empty name |
| 404 | Profile not found |
| 422 | Invalid type |
| 502 | External API returned invalid response |
| 500 | Internal server error |

## Edge Cases Handled

- Genderize returns `gender: null` or `count: 0` → 502 error
- Agify returns `age: null` → 502 error
- Nationalize returns no country data → 502 error

## Project Structure

```
├── api/
│   └── index.js              # Vercel serverless entry point
├── prisma/
│   └── schema.prisma         # Database schema
├── src/
│   ├── controllers/
│   │   └── profileController.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── routes/
│   │   └── profileRoutes.js
│   ├── services/
│   │   ├── externalApiService.js
│   │   └── profileService.js
│   ├── utils/
│   └── index.js              # Express app entry point
├── .env
├── package.json
└── vercel.json
```

## Deployment to Vercel

1. Push your code to a public GitHub repository
2. Install Vercel CLI: `npm i -g vercel`
3. Run `vercel` in your project directory
4. Add your `DATABASE_URL` environment variable:
   - Via CLI: `vercel env add DATABASE_URL`
   - Or in Vercel dashboard: Project Settings > Environment Variables
5. Deploy: `vercel --prod`

**Important:** Make sure your PostgreSQL database is accessible from Vercel's servers. You can use:
- Supabase (free tier)
- Neon (free tier)
- Railway PostgreSQL

## License

ISC
