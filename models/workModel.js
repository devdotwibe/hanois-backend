const pool = require("../db/pool");
const bcrypt = require('bcrypt');

class WorkModel {

    static async createMyProject(data) {
    const {
        user_id,
        title,
        notes,
        project_type,
        location,
        land_size,
        luxury_level,
        service_ids,
        construction_budget,
        basement,
        listing_style
    } = data;

    const result = await pool.query(
        `
        INSERT INTO work (
            user_id,
            title,
            notes,
            project_type,
            location,
            land_size,
            luxury_level,
            service_ids,
            construction_budget,
            basement,
            listing_style,
            provider_id,
            created_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, NOW())
        RETURNING 
            id,
            user_id,
            title,
            notes,
            project_type,
            location,
            land_size,
            luxury_level,
            service_ids,
            construction_budget,
            basement,
            listing_style,
            provider_id,
            created_at
        `,
        [
        user_id || null,
        title || null,
        notes || null,
        Number(project_type) || null,
        location || null,
        land_size || null,
        Number(luxury_level) || null,
        service_ids?.length ? service_ids : null,   
        construction_budget || null,
        basement || null,
        provider_id?.length ? provider_id : null,
        ]
    );

    return result.rows[0];
    }
}

module.exports = WorkModel;