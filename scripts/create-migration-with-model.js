import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const migrationName = process.argv[2];
if (!migrationName) {
  console.error("❌ Please provide a migration name.\nExample: npm run make-migration create_users_table");
  process.exit(1);
}

console.log(`🧱 Creating migration: ${migrationName}...`);
execSync(`npx node-pg-migrate create ${migrationName}`, { stdio: "inherit" });

// Extract table name (remove "create_" prefix and "_table" suffix)
let tableName = migrationName
  .replace(/^create_/, "")
  .replace(/_table$/, "");

// Capitalize model name properly
const modelClassName = `${tableName.charAt(0).toUpperCase()}${tableName.slice(1)}Model`;
const modelFileName = `${tableName}Model.js`;

const modelDir = path.join(process.cwd(), "models");
if (!fs.existsSync(modelDir)) {
  fs.mkdirSync(modelDir, { recursive: true });
}

const modelPath = path.join(modelDir, modelFileName);

if (!fs.existsSync(modelPath)) {
  const modelTemplate = `
import pool from "../db.js";

export default class ${modelClassName} {
  static async getAll() {
    const result = await pool.query("SELECT * FROM ${tableName}");
    return result.rows;
  }

  static async create(data) {
    // TODO: add field mappings
    return data;
  }
}
`;

  fs.writeFileSync(modelPath, modelTemplate.trim());
  console.log(`✅ Model created: models/${modelFileName}`);
} else {
  console.log(`⚠️ Model already exists: models/${modelFileName}`);
}
