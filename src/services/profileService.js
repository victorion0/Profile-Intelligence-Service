const { neon } = require('@neondatabase/serverless');

// Lazy-init database connection
let sql = null;
let initialized = false;

async function getDb() {
  if (!initialized) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }
    sql = neon(process.env.DATABASE_URL);
    initialized = true;
  }
  return sql;
}

async function ensureSchema() {
  const db = await getDb();
  await db`
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
    const db = await getDb();
    const rows = await db`
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
    const db = await getDb();
    const rows = await db`SELECT * FROM profiles WHERE id = ${id}`;
    return rows[0] || null;
  }

  async findByName(name) {
    const db = await getDb();
    const rows = await db`SELECT * FROM profiles WHERE name = ${name.toLowerCase()}`;
    return rows[0] || null;
  }

  async findAll(filters = {}) {
    const db = await getDb();
    const rows = await db`
      SELECT * FROM profiles 
      WHERE 1=1
      ${filters.gender ? db` AND gender = ${filters.gender.toLowerCase()}` : db``}
      ${filters.country_id ? db` AND country_id = ${filters.country_id.toUpperCase()}` : db``}
      ${filters.age_group ? db` AND age_group = ${filters.age_group.toLowerCase()}` : db``}
      ORDER BY created_at DESC
    `;
    return rows;
  }

  async deleteById(id) {
    const db = await getDb();
    await db`DELETE FROM profiles WHERE id = ${id}`;
  }
}

module.exports = new ProfileService();
