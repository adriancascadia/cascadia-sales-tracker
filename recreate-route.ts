import { drizzle } from 'drizzle-orm/mysql2';
import { customers, routes, routeStops } from './drizzle/schema';
import { eq, inArray } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL!);

async function recreateRoute() {
  console.log('🗺️  Creating NYC Test Route with all 4 stores...\n');
  
  // Delete existing route
  await db.delete(routeStops).where(eq(routeStops.routeId, 1));
  await db.delete(routes).where(eq(routes.id, 1));
  console.log('✅ Cleared previous test route\n');
  
  // Get the 4 specific customers by ID
  const customerIds = [1, 3, 17, 18]; // Gourmet Garage, Zabar's, Murray's Cheese, Sahadi's
  const selectedCustomers = await db.select().from(customers).where(inArray(customers.id, customerIds));
  
  // Sort them in the order we want
  const orderedCustomers = [
    selectedCustomers.find(c => c.id === 1)!,  // Gourmet Garage
    selectedCustomers.find(c => c.id === 3)!,  // Zabar's
    selectedCustomers.find(c => c.id === 17)!, // Murray's Cheese
    selectedCustomers.find(c => c.id === 18)!, // Sahadi's
  ];
  
  console.log('Selected customers for route:');
  orderedCustomers.forEach(c => console.log(`  - ${c.name} (${c.address}, ${c.city})`));
  
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
  
  console.log('\nRoute stops:');
  for (let i = 0; i < orderedCustomers.length; i++) {
    const customer = orderedCustomers[i];
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
    
    console.log(`  ${i + 1}. ${customer.name} - ${stopTimes[i]}`);
  }
  
  console.log('\n🎉 Test route created successfully!');
  console.log('\n📍 Route Summary:');
  console.log('   Route: NYC Gourmet Stores Tour');
  console.log('   Stops: 4 locations');
  console.log('   Area: Manhattan & Brooklyn');
  console.log('\n✨ You can now:');
  console.log('   • View the route in the Routes page');
  console.log('   • See it on the map in Live Tracking');
  console.log('   • Check in at each location in Visits');
  console.log('   • Watch real-time progress tracking');
}

recreateRoute().then(() => process.exit(0)).catch(console.error);
