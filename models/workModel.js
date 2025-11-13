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
        listing_style,
        provider_id,
        build_area,
        cost_finsh,
        suggest_cost,
        total_cost,
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
            build_area,
            cost_finsh,
            suggest_cost,
            total_cost,
            created_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'Awaiting Review',NOW())
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
            build_area,
            cost_finsh,
            suggest_cost,
            total_cost,
            status,
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
            listing_style || null,     
            provider_id?.length ? provider_id : null,
            build_area || null,  
            cost_finsh || null,  
            suggest_cost || null,  
            total_cost || null,  
        ]
    );


    return result.rows[0];
    }
}

module.exports = WorkModel;