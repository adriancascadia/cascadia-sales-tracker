import { readFileSync } from 'fs';
import { drizzle } from 'drizzle-orm/mysql2';
import { customers } from './drizzle/schema.ts';

const db = drizzle(process.env.DATABASE_URL);

const csvContent = readFileSync('/home/ubuntu/upload/Top_50_Gourmet_Food_Stores.csv', 'utf-8');
const lines = csvContent.trim().split('\n');
const headers = lines[0].split(',');

console.log('📥 Importing customers from CSV...\n');

let imported = 0;
let errors = 0;

for (let i = 1; i < lines.length; i++) {
  const values = lines[i].split(',');
  
  const customer = {
    name: values[0],
    address: values[1],
    city: values[2],
    state: values[3],
    zipCode: values[4],
    email: values[5] ? `contact@${values[0].toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : null,
    phone: null,
    notes: `Website: ${values[5] || 'N/A'}`,
    userId: 1, // Default to first user
  };
  
  try {
    await db.insert(customers).values(customer);
    console.log(`✅ Imported: ${customer.name}`);
    imported++;
  } catch (error) {
    console.error(`❌ Failed to import ${customer.name}:`, error.message);
    errors++;
  }
}

console.log(`\n📊 Import Summary:`);
console.log(`   ✅ Successfully imported: ${imported}`);
console.log(`   ❌ Errors: ${errors}`);
console.log(`   📦 Total processed: ${lines.length - 1}`);

process.exit(0);
