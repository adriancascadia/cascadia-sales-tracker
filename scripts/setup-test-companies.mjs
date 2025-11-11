#!/usr/bin/env node

/**
 * Setup Test Companies Script
 * Creates test companies and users for multi-company isolation testing
 * 
 * Usage: node scripts/setup-test-companies.mjs
 */

import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DATABASE_URL?.split("@")[1]?.split("/")[0] || "localhost",
  user: process.env.DATABASE_URL?.split("://")[1]?.split(":")[0] || "root",
  password: process.env.DATABASE_URL?.split(":")[2]?.split("@")[0] || "",
  database: process.env.DATABASE_URL?.split("/").pop() || "salesforce_tracker",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const testCompanies = [
  {
    id: 1,
    name: "Cascadia",
    domain: "cascadiafoodbev.com",
    logoUrl: "/cascadia-logo.png",
  },
  {
    id: 2,
    name: "Tech Corp",
    domain: "techcorp.com",
    logoUrl: "/techcorp-logo.png",
  },
  {
    id: 3,
    name: "Global Foods",
    domain: "globalfoods.com",
    logoUrl: "/globalfoods-logo.png",
  },
];

const testUsers = [
  {
    companyId: 1,
    openId: "cascadia-user-1",
    name: "Alice Johnson",
    email: "alice@cascadiafoodbev.com",
    role: "admin",
  },
  {
    companyId: 1,
    openId: "cascadia-user-2",
    name: "Bob Smith",
    email: "bob@cascadiafoodbev.com",
    role: "user",
  },
  {
    companyId: 2,
    openId: "techcorp-user-1",
    name: "Charlie Brown",
    email: "charlie@techcorp.com",
    role: "admin",
  },
  {
    companyId: 2,
    openId: "techcorp-user-2",
    name: "Diana Prince",
    email: "diana@techcorp.com",
    role: "user",
  },
  {
    companyId: 3,
    openId: "globalfoods-user-1",
    name: "Eve Wilson",
    email: "eve@globalfoods.com",
    role: "admin",
  },
];

async function setupTestCompanies() {
  const connection = await pool.getConnection();

  try {
    console.log("Setting up test companies...");

    // Insert companies
    for (const company of testCompanies) {
      await connection.execute(
        "INSERT INTO companies (id, name, domain, logoUrl) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=?, domain=?, logoUrl=?",
        [company.id, company.name, company.domain, company.logoUrl, company.name, company.domain, company.logoUrl]
      );
      console.log(`✓ Created company: ${company.name}`);
    }

    // Insert test users
    for (const user of testUsers) {
      await connection.execute(
        "INSERT INTO users (companyId, openId, name, email, role, createdAt, updatedAt, lastSignedIn) VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW()) ON DUPLICATE KEY UPDATE name=?, email=?, role=?",
        [user.companyId, user.openId, user.name, user.email, user.role, user.name, user.email, user.role]
      );
      console.log(`✓ Created user: ${user.name} (${user.email})`);
    }

    console.log("\n✅ Test companies and users created successfully!");
    console.log("\nTest Accounts:");
    console.log("─────────────────────────────────────────────");
    testUsers.forEach((user) => {
      console.log(`${user.name} (${user.email})`);
    });
    console.log("─────────────────────────────────────────────");
    console.log("\nYou can now test multi-company isolation by:");
    console.log("1. Sign in with alice@cascadiafoodbev.com");
    console.log("2. Verify you see only Cascadia customers");
    console.log("3. Sign out and sign in with charlie@techcorp.com");
    console.log("4. Verify you see only Tech Corp customers");
  } catch (error) {
    console.error("Error setting up test companies:", error);
    process.exit(1);
  } finally {
    await connection.release();
    await pool.end();
  }
}

setupTestCompanies();
