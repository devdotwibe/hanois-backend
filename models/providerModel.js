const pool = require("../db/pool");
const bcrypt = require("bcrypt");

class ProviderModel {
  static async getAll() {
    const result = await pool.query("SELECT * FROM providers");
    return result.rows;
  }

  static async updatePassword(providerId, hashedPassword) {
    const result = await pool.query(
      "UPDATE providers SET password = $1 WHERE id = $2 RETURNING id, email",
      [hashedPassword, providerId]
    );
    return result.rows[0];
  }

  static async create(data) {
    const {
      name,
      email,
      phone,
      register_no,
      password,
      location,
      team_size,
      service_id, // ✅ now expecting array
      website,
      social_media,
    } = data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO providers 
       (name, email, phone, register_no, password, location, team_size, service_id, website, social_media, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
       RETURNING id, name, email, phone, location, service_id, created_at`,
      [
        name,
        email,
        phone,
        register_no,
        hashedPassword,
        location,
        team_size,
        service_id, // ✅ correctly saved to integer[]
        website,
        social_media,
      ]
    );

    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query(
      "SELECT * FROM providers WHERE email = $1",
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT
         id,
         name,
         email,
         phone,
         location,
         team_size,
         website,
         social_media,
         notes,
         facebook,
         instagram,
         other_link,
         professional_headline,
         image,
         categories_id,
         service_id,
         created_at
       FROM providers
       WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async updateById(id, data) {
    const fields = [];
    const values = [];
    let index = 1;

    const addField = (column, value) => {
      if (value === undefined) return;
      fields.push(`${column} = $${index++}`);
      values.push(value);
    };

    addField("name", data.name);
    addField("email", data.email);
    addField("phone", data.phone);

    if (data.password) {
      const hashedPassword = await bcrypt.hash(
        data.password.toString(),
        10
      );
      addField("password", hashedPassword);
    }

    addField("location", data.location);
    addField("team_size", data.team_size);
    addField("website", data.website);
    addField("social_media", data.social_media);
    addField("notes", data.notes);
    addField("facebook", data.facebook);
    addField("instagram", data.instagram);
    addField("other_link", data.other_link || data.other);
    addField("professional_headline", data.professional_headline);
    addField("image", data.image);

    // ✅ updated array fields
    addField("categories_id", data.categories_id);
    addField("service_id", data.service_id);

    if (fields.length === 0) {
      const existing = await pool.query(
        "SELECT * FROM providers WHERE id = $1",
        [id]
      );
      return existing.rows[0];
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE providers 
       SET ${fields.join(", ")} 
       WHERE id = $${index}
       RETURNING id, name, email, phone, location, team_size, website, social_media, notes, facebook, instagram, other_link, professional_headline, image, categories_id, service_id, created_at`,
      values
    );

    return result.rows[0];
  }

  static async deleteById(id) {
    const result = await pool.query(
      "DELETE FROM providers WHERE id = $1 RETURNING id",
      [id]
    );
    return result.rows[0];
  }

  static async updateProfile(providerId, data) {
    const fields = [];
    const values = [];
    let index = 1;

    if (data.image !== undefined) {
      fields.push(`image = $${index++}`);
      values.push(data.image);
    }

    if (data.professional_headline !== undefined) {
      fields.push(`professional_headline = $${index++}`);
      values.push(data.professional_headline);
    }

    if (fields.length === 0) {
      const result = await pool.query(
        "SELECT id, name, email, image, professional_headline FROM providers WHERE id = $1",
        [providerId]
      );
      return result.rows[0];
    }

    values.push(providerId);

    const result = await pool.query(
      `UPDATE providers
       SET ${fields.join(", ")}
       WHERE id = $${index}
       RETURNING id, name, email, image, professional_headline`,
      values
    );

    return result.rows[0];
  }

  static async getByCategory(categoryName) {
    const result = await pool.query(
      `SELECT providers.*
       FROM providers
       JOIN categories ON categories.id = ANY(providers.categories_id)
       WHERE categories.name = $1`,
      [categoryName]
    );
    return result.rows;
  }
}

module.exports = ProviderModel;
