import { drizzle } from 'drizzle-orm/mysql2';
import { customers, routes, routeStops } from './drizzle/schema';
import { eq, like } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL!);

async function createTestRoute() {
  console.log('🗺️  Creating NYC Test Route...\n');
  
  // Get NYC customers
  const nycCustomers = await db.select().from(customers).where(like(customers.city, '%New York%'));
  
  console.log(`Found ${nycCustomers.length} NYC customers\n`);
  
  // Filter to the specific 4 stores
  const targetStores = ['Gourmet Garage', "Zabar's", "Murray's Cheese", "Sahadi's"];
  const selectedCustomers = nycCustomers.filter(c => targetStores.includes(c.name));
  
  console.log('Selected customers for route:');
  selectedCustomers.forEach(c => console.log(`  - ${c.name} (${c.address})`));
  
  // Create the route
  const routeResult = await db.insert(routes).values({
    routeName: 'NYC Gourmet Stores Tour',
    routeDate: new Date(),
    userId: 1,
    status: 'planned',
  });
  
  const routeId = Number(routeResult[0].insertId);
  console.log(`\n✅ Created route #${routeId}: NYC Gourmet Stores Tour`);
  
  // Add route stops
  const stopTimes = [
    '09:00', // Gourmet Garage - Upper West Side
    '10:30', // Zabar's - Upper West Side
    '13:00', // Murray's Cheese - Greenwich Village
    '15:00', // Sahadi's - Brooklyn
  ];
  
  for (let i = 0; i < selectedCustomers.length; i++) {
    const customer = selectedCustomers[i];
    const plannedTime = new Date();
    const [hours, minutes] = stopTimes[i].split(':');
    plannedTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    await db.insert(routeStops).values({
      routeId,
      customerId: customer.id,
      stopOrder: i + 1,
      plannedArrival: plannedTime,
      status: 'pending',
    });
    
    console.log(`  ${i + 1}. ${customer.name} - Planned arrival: ${stopTimes[i]}`);
  }
  
  console.log('\n🎉 Test route created successfully!');
  console.log('\nNext steps:');
  console.log('  1. Go to Routes page to view the route');
  console.log('  2. Go to Live Tracking to see the route on the map');
  console.log('  3. Go to Visits to check in at each location');
  console.log('  4. Test GPS tracking and route progress features');
}

createTestRoute().then(() => process.exit(0)).catch(console.error);
