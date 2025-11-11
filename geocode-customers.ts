import { drizzle } from 'drizzle-orm/mysql2';
import { customers } from './drizzle/schema';
import { eq } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL!);

// Simple geocoding using a free service (nominatim)
async function geocodeAddress(address: string, city: string, state: string, zip: string): Promise<{lat: number, lng: number} | null> {
  const fullAddress = `${address}, ${city}, ${state} ${zip}, USA`;
  const encodedAddress = encodeURIComponent(fullAddress);
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'SalesForce-Tracker-App'
        }
      }
    );
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
  } catch (error) {
    console.error(`Failed to geocode: ${fullAddress}`, error);
  }
  
  return null;
}

async function geocodeAllCustomers() {
  console.log('🌍 Geocoding all customer addresses...\n');
  
  const allCustomers = await db.select().from(customers);
  
  let success = 0;
  let failed = 0;
  
  for (const customer of allCustomers) {
    console.log(`Geocoding: ${customer.name}...`);
    
    const coords = await geocodeAddress(
      customer.address || '',
      customer.city || '',
      customer.state || '',
      customer.zipCode || ''
    );
    
    if (coords) {
      await db.update(customers)
        .set({
          latitude: coords.lat.toString(),
          longitude: coords.lng.toString()
        })
        .where(eq(customers.id, customer.id));
      
      console.log(`  ✅ ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
      success++;
    } else {
      console.log(`  ❌ Failed to geocode`);
      failed++;
    }
    
    // Rate limiting - wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n📊 Geocoding Summary:`);
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📦 Total: ${allCustomers.length}`);
}

geocodeAllCustomers().then(() => process.exit(0)).catch(console.error);
