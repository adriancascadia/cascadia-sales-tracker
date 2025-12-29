
import { drizzle } from "drizzle-orm/mysql2";
import { eq, isNull, or } from "drizzle-orm";
import { customers } from "../../drizzle/schema";
import { geocodeAddress } from "../services/geocodingService";
import mysql from "mysql2/promise";
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function run() {
    console.log("Starting Retroactive Geocoding...");

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error("DATABASE_URL not found in environment");
        process.exit(1);
    }

    // Create connection
    const poolConnection = mysql.createPool(databaseUrl);
    const db = drizzle(poolConnection);

    try {
        // Find customers without coordinates
        const customersToUpdate = await db.select().from(customers).where(
            or(
                isNull(customers.latitude),
                eq(customers.latitude, ""),
                isNull(customers.longitude),
                eq(customers.longitude, "")
            )
        );

        console.log(`Found ${customersToUpdate.length} customers to process.`);

        let successCount = 0;
        let failCount = 0;

        for (const customer of customersToUpdate) {
            console.log(`Processing: ${customer.name} (${customer.address}, ${customer.city})`);

            const coords = await geocodeAddress(
                customer.address || undefined,
                customer.city || undefined,
                customer.state || undefined,
                customer.zipCode || undefined
            );

            if (coords) {
                await db.update(customers)
                    .set({
                        latitude: coords.lat.toString(),
                        longitude: coords.lng.toString(),
                        updatedAt: new Date()
                    })
                    .where(eq(customers.id, customer.id));

                console.log(`✅ Updated: ${customer.name} -> ${coords.lat}, ${coords.lng}`);
                successCount++;
            } else {
                console.log(`❌ Failed to geocode: ${customer.name}`);
                failCount++;
            }

            // Be nice to the API
            await new Promise(r => setTimeout(r, 1000));
        }

        console.log(`\nFinished! Success: ${successCount}, Failed: ${failCount}`);

    } catch (error) {
        console.error("Error running script:", error);
    } finally {
        await poolConnection.end();
    }
}

run();
