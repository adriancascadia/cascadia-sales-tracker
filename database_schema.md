# Database Schema Design for SalesForce Tracker

## Tables Overview

### 1. users (Already exists)
- id (PK)
- openId
- name
- email
- role (admin/user)
- createdAt
- updatedAt
- lastSignedIn

### 2. customers
Stores customer/account information
- id (PK, auto-increment)
- userId (FK to users) - sales rep assigned
- name (varchar 255)
- address (text)
- city (varchar 100)
- state (varchar 50)
- zipCode (varchar 20)
- phone (varchar 50)
- email (varchar 320)
- latitude (decimal or text)
- longitude (decimal or text)
- notes (text)
- createdAt (timestamp)
- updatedAt (timestamp)

### 3. routes
Daily route planning
- id (PK, auto-increment)
- userId (FK to users)
- routeName (varchar 255)
- routeDate (date)
- status (enum: 'planned', 'in_progress', 'completed')
- createdAt (timestamp)
- updatedAt (timestamp)

### 4. route_stops
Individual stops in a route
- id (PK, auto-increment)
- routeId (FK to routes)
- customerId (FK to customers)
- stopOrder (int) - sequence in the route
- plannedArrival (datetime)
- createdAt (timestamp)

### 5. visits
Check-in/check-out records
- id (PK, auto-increment)
- userId (FK to users)
- customerId (FK to customers)
- routeStopId (FK to route_stops, nullable)
- checkInTime (datetime)
- checkInLatitude (text)
- checkInLongitude (text)
- checkOutTime (datetime, nullable)
- checkOutLatitude (text, nullable)
- checkOutLongitude (text, nullable)
- visitDuration (int) - minutes, calculated
- visitType (enum: 'scheduled', 'unscheduled')
- status (enum: 'in_progress', 'completed')
- createdAt (timestamp)
- updatedAt (timestamp)

### 6. visit_activities
Sales call details and notes
- id (PK, auto-increment)
- visitId (FK to visits)
- activityType (enum: 'sales_call', 'merchandising', 'service', 'delivery', 'other')
- notes (text)
- outcome (enum: 'order_placed', 'follow_up', 'no_action', 'issue_resolved')
- competitorInfo (text, nullable)
- createdAt (timestamp)

### 7. products
Product catalog
- id (PK, auto-increment)
- sku (varchar 100, unique)
- name (varchar 255)
- description (text)
- price (text) - store as string to avoid decimal issues
- category (varchar 100)
- active (boolean)
- createdAt (timestamp)
- updatedAt (timestamp)

### 8. orders
Order records
- id (PK, auto-increment)
- visitId (FK to visits)
- userId (FK to users)
- customerId (FK to customers)
- orderNumber (varchar 100, unique)
- orderDate (datetime)
- totalAmount (text) - store as string
- status (enum: 'pending', 'submitted', 'confirmed', 'cancelled')
- distributorId (varchar 100, nullable) - external distributor reference
- submittedAt (datetime, nullable)
- notes (text)
- createdAt (timestamp)
- updatedAt (timestamp)

### 9. order_items
Line items for orders
- id (PK, auto-increment)
- orderId (FK to orders)
- productId (FK to products)
- quantity (int)
- unitPrice (text)
- lineTotal (text)
- createdAt (timestamp)

### 10. photos
Photo documentation
- id (PK, auto-increment)
- visitId (FK to visits)
- userId (FK to users)
- customerId (FK to customers)
- fileKey (varchar 500) - S3 key
- url (text) - S3 URL
- photoType (enum: 'before', 'after', 'merchandising', 'pos', 'display', 'other')
- caption (text, nullable)
- latitude (text, nullable)
- longitude (text, nullable)
- takenAt (datetime)
- createdAt (timestamp)

### 11. gps_tracks
GPS location history for real-time tracking
- id (PK, auto-increment)
- userId (FK to users)
- latitude (text)
- longitude (text)
- accuracy (int) - meters
- speed (text, nullable) - km/h
- heading (text, nullable) - degrees
- timestamp (datetime)
- createdAt (timestamp)

### 12. mileage_logs
Mileage tracking
- id (PK, auto-increment)
- userId (FK to users)
- routeId (FK to routes, nullable)
- startTime (datetime)
- endTime (datetime, nullable)
- startLocation (text)
- endLocation (text, nullable)
- totalDistance (text) - km or miles
- status (enum: 'active', 'completed')
- createdAt (timestamp)
- updatedAt (timestamp)

## Indexes for Performance
- customers: userId, (latitude, longitude)
- routes: userId, routeDate, status
- route_stops: routeId, customerId
- visits: userId, customerId, checkInTime, status
- visit_activities: visitId
- orders: userId, customerId, orderDate, status
- order_items: orderId, productId
- photos: visitId, userId, customerId
- gps_tracks: userId, timestamp
- mileage_logs: userId, routeId

## Key Design Decisions
1. Using text for decimal values (prices, coordinates) to avoid MySQL decimal precision issues
2. Separate tables for visits and visit_activities to allow multiple activities per visit
3. GPS tracks stored separately for efficient real-time tracking queries
4. Photos linked to visits, users, and customers for flexible querying
5. Route stops separate from visits to distinguish planned vs actual
6. Mileage logs separate from routes for independent tracking
