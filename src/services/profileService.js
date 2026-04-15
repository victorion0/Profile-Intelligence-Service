const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

// Create the table if it doesn't exist (idempotent startup)
async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      gender VARCHAR(50),
      gender_probability FLOAT,
      sample_size INT,
      age INT,
      age_group VARCHAR(50),
      country_id VARCHAR(10),
      country_probability FLOAT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

class ProfileService {
  async init() {
    await ensureSchema();
  }

  async create(profileData) {
    const rows = await sql`
      INSERT INTO profiles (id, name, gender, gender_probability, sample_size, age, age_group, country_id, country_probability, created_at)
      VALUES (
        ${profileData.id},
        ${profileData.name},
        ${profileData.gender},
        ${profileData.genderProbability},
        ${profileData.sampleSize},
        ${profileData.age},
        ${profileData.ageGroup},
        ${profileData.countryId},
        ${profileData.countryProbability},
        NOW()
      )
      RETURNING *
    `;
    return rows[0];
  }

  async findById(id) {
    const rows = await sql`SELECT * FROM profiles WHERE id = ${id}`;
    return rows[0] || null;
  }

  async findByName(name) {
    const rows = await sql`SELECT * FROM profiles WHERE name = ${name.toLowerCase()}`;
    return rows[0] || null;
  }

  async findAll(filters = {}) {
    const rows = await sql`
      SELECT * FROM profiles 
      WHERE 1=1
      ${filters.gender ? sql` AND gender = ${filters.gender.toLowerCase()}` : sql``}
      ${filters.country_id ? sql` AND country_id = ${filters.country_id.toUpperCase()}` : sql``}
      ${filters.age_group ? sql` AND age_group = ${filters.age_group.toLowerCase()}` : sql``}
      ORDER BY created_at DESC
    `;

    return rows;
  }

  async deleteById(id) {
    await sql`DELETE FROM profiles WHERE id = ${id}`;
  }
}

module.exports = new ProfileService();
