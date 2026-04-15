const { Pool } = require('pg');

// Lazy-init database pool
let pool = null;

function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

// Create the table if it doesn't exist
async function ensureSchema() {
  const client = await getPool().connect();
  try {
    await client.query(`
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
    `);
  } finally {
    client.release();
  }
}

class ProfileService {
  async init() {
    await ensureSchema();
  }

  async create(profileData) {
    const client = await getPool().connect();
    try {
      const result = await client.query(
        `INSERT INTO profiles (id, name, gender, gender_probability, sample_size, age, age_group, country_id, country_probability, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         RETURNING *`,
        [
          profileData.id,
          profileData.name,
          profileData.gender,
          profileData.genderProbability,
          profileData.sampleSize,
          profileData.age,
          profileData.ageGroup,
          profileData.countryId,
          profileData.countryProbability
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async findById(id) {
    const client = await getPool().connect();
    try {
      const result = await client.query('SELECT * FROM profiles WHERE id = $1', [id]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async findByName(name) {
    const client = await getPool().connect();
    try {
      const result = await client.query('SELECT * FROM profiles WHERE name = $1', [name.toLowerCase()]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async findAll(filters = {}) {
    const client = await getPool().connect();
    try {
      let query = 'SELECT * FROM profiles WHERE 1=1';
      const values = [];
      let paramIndex = 1;

      if (filters.gender) {
        query += ` AND gender = $${paramIndex++}`;
        values.push(filters.gender.toLowerCase());
      }

      if (filters.country_id) {
        query += ` AND country_id = $${paramIndex++}`;
        values.push(filters.country_id.toUpperCase());
      }

      if (filters.age_group) {
        query += ` AND age_group = $${paramIndex++}`;
        values.push(filters.age_group.toLowerCase());
      }

      query += ' ORDER BY created_at DESC';

      const result = await client.query(query, values);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async deleteById(id) {
    const client = await getPool().connect();
    try {
      await client.query('DELETE FROM profiles WHERE id = $1', [id]);
    } finally {
      client.release();
    }
  }
}

module.exports = new ProfileService();
