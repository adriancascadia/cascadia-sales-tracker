# SalesForce Tracker - Project TODO

## Database & Backend Setup
- [x] Implement database schema with all tables
- [x] Create database helper functions for all features
- [x] Push database schema to production

## Backend API (tRPC Procedures)
- [x] Customer management procedures (CRUD)
- [x] Route management procedures
- [x] Visit check-in/check-out procedures
- [x] Visit activity logging procedures
- [x] Order creation and submission procedures
- [x] Product catalog procedures
- [x] Photo upload and retrieval procedures
- [x] Real-time GPS tracking procedures
- [x] Mileage tracking procedures
- [x] Dashboard analytics procedures

## Frontend - Core Layout & Navigation
- [x] Design app navigation structure
- [x] Implement main layout with sidebar navigation
- [x] Create dashboard home page with analytics

## Frontend - Customer Management
- [x] Customer list page with search
- [x] Add new customer form
- [x] Edit customer details
- [x] Delete customer functionality

## Frontend - Route Planning
- [x] Route creation page
- [x] Route list view with status badges
- [ ] Add customers to route with map view
- [ ] Drag-and-drop route stop reordering
- [ ] Route optimization suggestions

## Frontend - GPS & Real-Time Tracking
- [x] Real-time GPS location capture from browser
- [x] Live tracking page showing all active sales reps
- [x] GPS coordinates display
- [ ] Interactive map visualization with Google Maps
- [ ] GPS breadcrumb trail visualization
- [ ] Location accuracy indicators

## Frontend - Check-In/Check-Out
- [x] One-tap check-in button with GPS capture
- [x] Check-out button with duration display
- [x] Visit status indicators
- [x] Check-in history list
- [x] Active visit indicator
- [ ] Geofencing validation for customer locations

## Frontend - Sales Call Logging
- [x] Visit activity form with activity types
- [x] Notes and observations text area
- [x] Outcome selection
- [x] Competitor information capture
- [ ] Activity history timeline view

## Frontend - Order Management
- [x] Product catalog browser
- [x] Order creation form
- [x] Add multiple products to order
- [x] Order summary with total calculation
- [x] Submit order to distributor
- [x] Order history and status tracking
- [ ] Order detail view with line items
- [ ] Return processing form

## Frontend - Product Management
- [x] Product list page with search
- [x] Add new product form
- [x] Edit product details
- [x] Product pricing display
- [x] Product categories

## Frontend - Photo Documentation
- [x] Photo upload page
- [x] Camera integration for photo capture
- [x] File upload from device
- [x] Photo type categorization (before/after/merchandising/POS)
- [x] Photo caption and notes
- [ ] Photo gallery view by visit
- [ ] Photo gallery view by customer
- [ ] Before/after photo pairing
- [ ] Photo compression for mobile

## Frontend - Reporting & Analytics
- [x] Admin dashboard with key metrics
- [x] Visit completion rate display
- [x] Sales performance metrics
- [x] Time spent per visit analysis
- [x] Total revenue tracking
- [ ] Mileage reports by rep and date range
- [ ] Photo gallery reports
- [ ] Export reports to PDF/Excel

## Frontend - Mileage Tracking
- [ ] Start mileage tracking button
- [ ] End mileage tracking with distance calculation
- [ ] Mileage log history
- [ ] Mileage summary reports

## Mobile Optimization
- [x] Touch-friendly UI for all forms
- [x] Responsive design for mobile screens
- [x] GPS location capture from mobile browsers
- [x] Camera access for photo capture
- [ ] Offline mode support with local caching
- [ ] PWA configuration for app-like experience
- [ ] Battery-efficient GPS polling

## Testing & Documentation
- [ ] Test all API procedures
- [ ] Test GPS tracking accuracy
- [ ] Test photo upload and storage
- [ ] Test offline mode sync
- [ ] Create user documentation
- [ ] Create admin guide
- [ ] Create deployment guide

## New Feature Request
- [x] Add interactive Google Maps view to Live Tracking page
- [x] Display all active sales reps as markers on the map
- [x] Show rep names and last update time in map markers
- [x] Add auto-refresh for real-time position updates

## Route Visualization Enhancement
- [x] Display sales rep's daily route when clicking their marker
- [x] Show all customer stops on the route with numbered markers
- [x] Draw connecting lines between route stops
- [x] Add route info panel with stop details
- [x] Add clear route button to reset view

## Real-Time Route Progress Tracking
- [x] Detect which route stop is currently active based on GPS proximity (100m radius)
- [x] Show completed stops with green checkmark markers
- [x] Show current stop with animated yellow marker
- [x] Show upcoming stops with gray numbered markers
- [x] Display progress bar showing route completion percentage
- [x] Add route progress panel with stop status list
- [x] Color-coded status badges (Done/Active/Pending)

## Automated Alert System for Managers
- [x] Create alerts database table to track notifications
- [x] Implement route deviation detection (500m threshold from planned route)
- [x] Implement delay detection (30 min threshold comparing actual vs planned arrival)
- [x] Create alert generation procedure for route deviations
- [x] Create alert generation procedure for significant delays
- [x] Add notification system to send alerts to managers (owner notifications)
- [x] Create alerts dashboard for managers to view all alerts
- [x] Add severity levels (low/medium/high) and alert types
- [x] Add mark as read functionality for individual and bulk alerts
- [x] Display alert metadata with expandable details

## Customer Import and Management Enhancements
- [x] Add contact person field to customers table
- [x] Enhance customer form with all required fields
- [x] Implement Excel/CSV bulk import for customers
- [x] Add file upload component for customer import
- [x] Parse Excel/CSV files and validate data
- [x] Create bulk customer insert API endpoint
- [x] Add import preview/validation before saving
- [x] Display import results (success/errors)
- [x] Add sample Excel template download

## Route Deviation Notes Feature
- [x] Add notes field to alerts table for justifications
- [x] Add API endpoint to update alert with notes (addNotes mutation)
- [x] Add API endpoint for reps to view their own alerts (getMyAlerts)


## Distributor Management System
- [x] Create distributors database table with company info and email
- [x] Add distributorId field to products table
- [x] Create Distributors management page (CRUD operations)
- [x] Update Products page to assign distributor to each product
- [x] Create distributor selection UI in product form

## Automatic Order Submission
- [x] Implement email service for sending orders to distributors
- [x] Create order email template with all order details
- [x] Add automatic email trigger when order is created
- [x] Track email sent status in orders table
- [x] Add sentToDistributor timestamp field to orders
- [ ] Display email sent status in Orders page
- [ ] Group order items by distributor if multiple distributors in one order

## Real-time Photo Gallery for Managers
- [ ] Create photo gallery page with grid/list view
- [ ] Add filters: by sales rep, customer, date range, photo type (before/after)
- [ ] Display photo metadata (who, when, where, customer)
- [ ] Add lightbox for full-size photo viewing
- [ ] Add auto-refresh for real-time updates
- [ ] Show photo upload notifications


## Manager Order Dashboard
- [x] Create dedicated manager dashboard page for order tracking
- [x] Add order status overview cards (pending, sent to distributor, completed)
- [x] Create orders table with comprehensive filters (status, distributor, date range, sales rep)
- [x] Display email sent status and timestamp for each order
- [x] Add distributor breakdown showing order counts per distributor
- [x] Show sales rep performance metrics (orders created, total value)
- [ ] Add export functionality for order reports
- [ ] Implement real-time updates for order status changes


## Customer Map Visualization
- [x] Create customer map page showing all customer locations
- [x] Geocode customer addresses to get latitude/longitude (100% success rate)
- [x] Display markers for each customer on Google Maps
- [x] Add info windows with customer details
- [x] Add statistics cards showing total customers and distribution
- [x] Add state-by-state breakdown table
- [x] Auto-fit map bounds to show all locations

## Customer Map State Filter
- [x] Add state filter dropdown to customer map
- [x] Filter displayed markers based on selected state
- [x] Update map bounds when filter changes
- [x] Show filtered customer count
- [x] Make state breakdown cards clickable to filter
- [x] Display "All States" option with total count


## Enhanced Customer Information Card
- [x] Create detailed customer info card component
- [x] Display card when map marker is clicked
- [x] Show all customer details (name, address, phone, email, contact person)
- [x] Add action buttons (create order, start visit, edit customer)
- [x] Display customer location coordinates
- [x] Add close button to dismiss
- [x] Sticky card positioning on right side
- [x] Clickable phone and email links


## Pre-filled Order Form from Customer Card
- [x] Update Orders page to accept customer ID from URL parameters
- [x] Pre-fill customer field when customer ID is provided
- [x] Auto-open order creation dialog with customer pre-selected
- [x] Test order creation flow from customer map card


## Enhanced Product Selection in Order Form
- [x] Add searchable product dropdown with filter functionality
- [x] Display product details (SKU, price, distributor) in dropdown
- [x] Show product description in selection
- [x] Auto-fill unit price when product is selected
- [x] Add product search by name or SKU
- [x] Display distributor name for each product
- [x] Created reusable ProductSelector component
- [x] Real-time search filtering
- [x] Visual badges for SKU and distributor


## Order Form Visual Enhancements
- [x] Add visible "Line Total" column for each order item
- [x] Add increment/decrement buttons for quantity adjustment
- [x] Make grand total more prominent with larger styling
- [x] Show item count in grand total section
- [x] Display line total calculation (qty × price) for each item
- [x] Enhanced layout with bordered item cards
- [x] Real-time calculation updates


## PDF Invoice Generation
- [x] Add "Download Invoice" button to all orders
- [x] Create PDF invoice template with professional layout
- [x] Include order details (order ID, date, customer info)
- [x] Display line items table with products, quantities, prices
- [x] Show grand total calculation
- [x] Implement server-side PDF generation with PDFKit
- [x] Add download functionality for generated invoices
- [x] Base64 encoding for PDF transfer from server to client
- [x] Automatic filename generation with timestamp


## Order Notes and Special Instructions
- [x] Add notes field to orders table schema (already existed)
- [x] Add notes textarea to order creation form
- [x] Update order creation API to save notes
- [x] Include notes section in PDF invoice template
- [x] Notes only appear in PDF if they exist


## Separate Customer-Facing and Internal Notes
- [x] Add internalNotes field to orders table
- [x] Rename notes to specialInstructions for clarity
- [x] Update order form with two separate note fields
- [x] Ensure only specialInstructions appear on PDF invoices
- [x] Update email service to use specialInstructions
- [ ] Display internal notes in manager dashboard
- [ ] Show internal notes in order details view (not on customer PDFs)


## Internal Notes Search and Filter for Managers
- [x] Add search input field to Manager Dashboard for keyword search
- [x] Implement backend search query for internal notes (client-side filtering)
- [x] Filter orders table by internal notes keywords
- [x] Highlight matching keywords in search results with yellow background
- [x] Add clear search button to reset filters
- [x] Display internal notes column in orders table
- [x] Truncate long notes with hover tooltip


## Internal Notes Author Tracking and Timestamps
- [x] Add internalNotesAuthor field to orders table
- [x] Add internalNotesTimestamp field to orders table
- [x] Automatically capture current user when internal notes are created
- [x] Automatically capture timestamp when internal notes are created
- [x] Display author name and timestamp in Manager Dashboard
- [x] Format timestamp in readable format with toLocaleString()
- [x] Show "Added by [Name] on [Date]" in notes display


## Manager Notifications for Internal Notes
- [x] Add notification trigger when internal notes are added to orders
- [x] Use built-in notifyOwner function to send alerts to managers
- [x] Include order details in notification (order number, customer, author)
- [x] Display internal note content in notification
- [x] Send notification only when internal notes are not empty
- [x] Error handling for notification failures


## Centralized Internal Notes History Dashboard
- [x] Create dedicated Internal Notes History page for managers
- [x] Display all orders with internal notes in chronological order
- [x] Show order details (number, customer, date, total)
- [x] Display internal note content with author and timestamp
- [x] Add search functionality to filter by keywords
- [x] Add filters for sales rep selection
- [x] Add sorting options (newest first, oldest first, by rep)
- [x] Highlight search terms with yellow background
- [x] Add navigation link in sidebar
- [x] Statistics cards showing total notes, active reps, filtered results


## Multi-Distributor Order Splitting
- [x] Analyze order items to detect multiple distributors
- [x] Group order items by distributor automatically
- [x] Send separate emails to each distributor with only their products
- [x] Update order record to track multiple distributor emails sent
- [x] Calculate distributor-specific totals in split emails
- [x] Add distributor name to email header when order is split
- [x] Log successful sends per distributor
- [ ] Display distributor breakdown in order details UI
- [ ] Show which items went to which distributor in Manager Dashboard
- [ ] Add visual indicator in Orders page when order has multiple distributors


## Real-Time Photo Gallery for Managers
- [x] Create dedicated Photo Gallery page
- [x] Display all uploaded photos in grid layout
- [x] Show photo metadata (date, time, rep name, customer, visit)
- [x] Add filter by sales rep
- [x] Add filter by photo type (before/after)
- [x] Add search by customer name or rep name
- [x] Implement lightbox for full-size photo viewing
- [x] Add photo download functionality
- [x] Show photo count and statistics
- [x] Add auto-refresh to show new photos in real-time
- [x] Display thumbnail grid with lazy loading
- [x] Add navigation link in sidebar
- [ ] Add filter by date range (future enhancement)
- [ ] Add filter by customer (future enhancement)


## Mileage Tracking UI for Sales Reps
- [x] Create Mileage Tracking page for sales reps
- [x] Add "Start Mileage Log" button to begin tracking
- [x] Display active mileage log with start time and start odometer
- [x] Add "End Mileage Log" form with end odometer and notes
- [x] Calculate total distance automatically (end - start)
- [x] Display mileage log history with all completed logs
- [x] Show distance, duration, and date for each log
- [x] Add delete functionality for mileage logs
- [x] Display current active log status prominently
- [x] Add form validation for odometer readings

## Mileage Reports Dashboard for Managers
- [x] Create Mileage Reports page for managers
- [x] Display summary statistics (total miles, average per rep, total reps)
- [x] Create mileage table showing all logs by rep and date
- [x] Add filters: date range, sales rep, status (active/completed)
- [x] Calculate mileage reimbursement (miles × rate)
- [x] Display reimbursement totals by rep
- [x] Add export functionality (CSV)
- [x] Add navigation link to sidebar
- [ ] Show mileage trends and charts (future enhancement)


## Reports Dashboard
- [x] Create comprehensive Reports page for managers
- [x] Add Sales Performance by Rep section with metrics (visits, orders, revenue)
- [x] Display top performing reps with ranking
- [x] Add Customer Visit Frequency analysis
- [x] Show most visited customers and visit trends
- [x] Add Order Volume by Distributor section
- [x] Display distributor breakdown with order counts and totals
- [x] Add Route Efficiency Metrics section
- [x] Calculate average visit duration and stops per route
- [x] Add Photo Documentation Reports section
- [x] Show photo count by rep and customer
- [x] Add date range filters for all reports
- [x] Add export functionality (CSV) for each report section
- [x] Display key metrics with summary statistics
- [ ] Create visual charts for key metrics (future enhancement)
- [ ] Add comparison period (month-over-month, year-over-year) (future enhancement)


## Offline Mode Implementation
- [x] Create offline storage service using IndexedDB
- [x] Implement network status detection (online/offline)
- [x] Create sync queue for pending operations
- [x] Add offline indicator UI component
- [x] Implement local data caching for reads
- [x] Create sync engine for data reconciliation
- [ ] Add conflict resolution for offline changes (future enhancement)
- [x] Implement background sync when connection returns
- [x] Add sync status notifications
- [ ] Create offline mode toggle in settings (future enhancement)
- [ ] Test offline functionality with all features (future enhancement)
- [ ] Add data export/import for offline backup (future enhancement)


## Customer Interaction Timeline
- [x] Create CustomerTimeline.tsx page component
- [x] Add timeline view showing all customer interactions chronologically
- [x] Display visits with check-in/check-out times and duration
- [x] Show orders with order number, items, total, and status
- [x] Display photos uploaded at customer location
- [x] Add activity type icons (visit, order, photo, note)
- [x] Display last contact date prominently
- [x] Add filters: activity type, date range
- [x] Show customer contact information and engagement metrics
- [x] Add quick action buttons (start visit, create order)
- [x] Implement responsive timeline design for mobile
- [x] Add loading states and empty states
- [x] Add navigation link from customer cards (History button)
- [x] Display engagement metrics (total visits, orders, photos, spent)
- [ ] Show internal notes and special instructions (future enhancement)
- [ ] Create backend procedure to fetch customer timeline data (future enhancement)


## Mobile PWA Enhancement
- [x] Create service worker for offline caching
- [x] Implement cache-first strategy for static assets
- [x] Add network-first strategy for API calls
- [x] Create web app manifest with app metadata
- [x] Configure install-to-home-screen functionality
- [x] Add PWA detection and install prompt component
- [x] Implement push notification service in service worker
- [x] Create notification permission request UI
- [x] Add background sync for offline operations
- [x] Add PWA status indicator component in header
- [x] Create usePWA hook for PWA state management
- [x] Add PWA meta tags to HTML
- [x] Implement app shortcuts (New Visit, Create Order, Customers, Mileage)
- [x] Add share target configuration for photo uploads
- [ ] Add app icons for different sizes (future enhancement)
- [ ] Test on mobile devices and browsers (future enhancement)
- [ ] Add PWA installation guide in documentation (future enhancement)


## Offline Feature Integration
- [x] Create useOfflineFeature hook for operation queuing and sync
- [x] Create OfflineStatusBadge component for status display
- [x] Create OfflineSyncPanel component for pending operations management
- [x] Integrate offline components into Orders page (test implementation)
- [ ] Integrate offline storage into Visits page (queue check-in/check-out) (future)
- [ ] Integrate offline storage into Photos page (queue photo uploads) (future)
- [ ] Integrate offline storage into Mileage Tracking page (queue mileage logs) (future)
- [x] Add offline indicators to feature pages
- [ ] Implement optimistic updates for offline operations (future)
- [ ] Create offline data cache for customer and product data (future)
- [ ] Test offline workflow for all features (future)
- [ ] Add offline mode documentation (future)


## Email Notifications System
- [x] Set up email service integration (Manus platform API)
- [x] Create email template for order confirmations
- [x] Create email template for visit reminders
- [x] Create email template for alerts and notifications
- [x] Implement order confirmation email endpoint
- [x] Implement visit reminder email endpoint
- [x] Implement alert email for managers endpoint
- [x] Create professional HTML email templates
- [x] Add email service module with error handling
- [ ] Add email notification preferences to user settings (future)
- [ ] Implement automated email triggers (future)
- [ ] Create email notification log/history (future)
- [ ] Add unsubscribe functionality (future)
- [ ] Test email delivery and rendering (future)
- [ ] Add email preview in admin panel (future)


## Offline Integration Expansion
- [x] Create offline cache service for customers and products
- [x] Create enhanced offline integration hook for feature pages
- [x] Create offline sync progress component for batch operations
- [x] Create Offline Settings page for cache management
- [x] Add offline data caching for customers list
- [x] Add offline data caching for products list
- [x] Implement optimistic updates for offline operations
- [x] Add sync progress indicator for batch operations
- [x] Add Offline Settings route to navigation
- [ ] Integrate offline queuing into Visits page (check-in/check-out) (future)
- [ ] Integrate offline queuing into Photos page (photo uploads) (future)
- [ ] Integrate offline queuing into Mileage Tracking page (mileage logs) (future)
- [ ] Test offline workflow across all features (future)
- [ ] Add offline documentation and user guide (future)


## Advanced Route Optimization
- [x] Create route optimization algorithm (nearest neighbor / TSP)
- [x] Implement auto-route sequencing by customer location
- [x] Add route efficiency scoring (distance, time, stops)
- [x] Add multi-route splitting for large customer lists
- [x] Create route optimization UI page
- [x] Add route distance and time estimates
- [x] Implement route export and GPS integration buttons
- [x] Add route performance analytics and savings summary
- [x] Create priority-based optimization method
- [x] Add optimization method selection
- [ ] Create suggested route reordering with drag-and-drop (future)
- [ ] Implement territory assignment and balancing (future)
- [ ] Create route templates for recurring patterns (future)
- [ ] Add route conflict detection and alerts (future)


## Advanced Analytics with Predictive Insights
- [x] Create predictive analytics service with forecasting algorithms
- [x] Implement sales trend analysis (growth rate, seasonality)
- [x] Build sales forecasting model using historical data
- [x] Create customer churn prediction algorithm
- [x] Implement retention alerts for at-risk customers
- [x] Build customer lifetime value (CLV) calculations
- [x] Create anomaly detection for unusual patterns
- [x] Implement data visualization dashboard with Recharts
- [x] Add time-series analysis for trends
- [x] Create Predictive Analytics page with 4 tabs
- [x] Add date range filtering (7/30/90 days, 1 year)
- [x] Add navigation link in sidebar
- [ ] Add chart export to PDF/PNG functionality (future)
- [ ] Build territory performance benchmarking (future)
- [ ] Create custom report builder UI (future)
- [ ] Build predictive alerts for managers (future)


## AI Sales Coaching Assistant
- [x] Create AI chat interface component for sales reps
- [x] Integrate LLM API for sales coaching
- [x] Add objection handling guidance with strategies and examples
- [x] Add customer relationship strategies
- [x] Create context-aware coaching (based on customer name, industry, experience)
- [x] Create AI Coach service with three endpoints (objection, strategy, coaching)
- [x] Add experience level selection (junior/mid/senior)
- [x] Create professional UI with tabs and response formatting
- [x] Add navigation link in sidebar
- [x] Implement real-time AI responses with streaming
- [x] Add tips and best practices guide
- [x] Customize AI Coach for food & beverage retail sales (restaurants, delis, bakeries, cafes)
- [x] Update prompts to focus on transactional sales (no contracts)
- [x] Add F&B-specific objection handling (pricing, minimum orders, supplier loyalty)
- [x] Include real-world F&B sales examples and dialogue
- [ ] Add conversation history and persistence (future)
- [ ] Create manager coaching dashboard (future)
- [ ] Add performance improvement suggestions (future)
- [ ] Create sales playbook integration (future)
- [ ] Create coaching analytics and insights (future)


## HubSpot CRM Integration
- [ ] Set up HubSpot OAuth authentication
- [ ] Create HubSpot API service module
- [ ] Sync contacts from HubSpot to SalesForce Tracker
- [ ] Sync deals from HubSpot to orders
- [ ] Sync activities (visits, calls, emails) to HubSpot
- [ ] Create two-way sync for customer updates
- [ ] Implement deal stage tracking
- [ ] Add HubSpot contact enrichment
- [ ] Create sync status dashboard
- [ ] Add manual sync trigger button
- [ ] Implement automatic sync scheduling
- [ ] Add conflict resolution for duplicate data
- [ ] Create HubSpot settings page
- [ ] Add sync history and logs


## Mobile App Enhancements
- [x] Implement biometric authentication (fingerprint/face recognition)
- [x] Add background location tracking for field reps
- [x] Create background tracking service with geofencing
- [x] Implement location permission management
- [x] Create Mobile Settings page for configuration
- [x] Add biometric registration and management
- [x] Implement background tracking toggle
- [x] Add push notifications configuration
- [x] Create app installation UI
- [x] Add navigation link in sidebar
- [x] Implement geofence event handling
- [x] Create location history tracking
- [ ] Create native app wrapper for iOS/Android (future)
- [ ] Create app store deployment configuration (future)
- [ ] Create mobile app onboarding flow (future)
- [ ] Add mobile-specific performance optimizations (future)


## Sales Playbook for Gourmet Products
- [x] Create Sales Playbook database schema and tables
- [x] Build Playbook UI page with category filtering
- [x] Add Product Category Strategies (Beverages, Waters, Snacks, Sauces)
- [x] Add Objection Handling Playbook (No shelf space, Unknown brand, Price objections)
- [x] Add Cafe-Specific Selling Strategies (Pairings, menu integration, trial approach)
- [x] Add New Product Launch Playbook
- [x] Create Quick Reference Cards for each brand
- [ ] Integrate Playbook with AI Sales Coach for contextual suggestions (future)
- [x] Add search and filter functionality
- [x] Add bookmark/favorite feature for sales reps
