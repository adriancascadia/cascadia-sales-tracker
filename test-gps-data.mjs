import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Get Bill's user ID and company ID
const [users] = await connection.execute(
  'SELECT id, companyId FROM users WHERE email = ?',
  ['Bill@cascadiafoodbev.com']
);

if (!users.length) {
  console.error('User not found');
  process.exit(1);
}

const userId = users[0].id;
const companyId = users[0].companyId;

console.log(`Creating GPS data for user ${userId} in company ${companyId}`);

// Create GPS tracking data for Bill's current location
const now = new Date();
const gpsData = [
  {
    userId,
    companyId,
    latitude: 40.7128,
    longitude: -74.0060,
    accuracy: 10,
    speed: 25,
    heading: 180,
    timestamp: new Date(now.getTime() - 5 * 60000), // 5 minutes ago
  },
  {
    userId,
    companyId,
    latitude: 40.7150,
    longitude: -74.0080,
    accuracy: 12,
    speed: 22,
    heading: 175,
    timestamp: new Date(now.getTime() - 3 * 60000), // 3 minutes ago
  },
  {
    userId,
    companyId,
    latitude: 40.7160,
    longitude: -74.0090,
    accuracy: 8,
    speed: 20,
    heading: 170,
    timestamp: now, // Just now
  },
];

for (const data of gpsData) {
  await connection.execute(
    'INSERT INTO gps_tracks (userId, companyId, latitude, longitude, accuracy, speed, heading, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [data.userId, data.companyId, data.latitude, data.longitude, data.accuracy, data.speed, data.heading, data.timestamp]
  );
}

console.log('✓ GPS data created successfully');
console.log(`  - 3 location points for Bill at NYC coordinates`);
console.log(`  - Latest position: ${gpsData[2].latitude}, ${gpsData[2].longitude}`);

await connection.end();
