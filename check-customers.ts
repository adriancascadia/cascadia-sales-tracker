import { drizzle } from 'drizzle-orm/mysql2';
import { customers } from './drizzle/schema';

const db = drizzle(process.env.DATABASE_URL!);

async function checkCustomers() {
  const allCustomers = await db.select().from(customers);
  console.log('All imported customers:\n');
  allCustomers.forEach(c => {
    console.log(`${c.id}. ${c.name} - ${c.city}, ${c.state}`);
  });
}

checkCustomers().then(() => process.exit(0)).catch(console.error);
