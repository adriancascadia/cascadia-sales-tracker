# SalesForce Tracker - Comprehensive Testing Guide

## Quick Start Testing

### 1. **Dashboard & Navigation**
- [ ] Login and view main dashboard
- [ ] Verify all sidebar menu items are visible
- [ ] Click through each menu item to ensure pages load
- [ ] Check responsive design on mobile (use browser dev tools)
- [ ] Verify Cascadia logo displays in sidebar and header

### 2. **Customer Management**
- [ ] Go to **Customers** page
- [ ] Verify customer list displays (should show 20 customers)
- [ ] Click on a customer to view details
- [ ] Click "History" button to view Customer Timeline
- [ ] Test search functionality
- [ ] Test customer filtering

### 3. **Visit Management**
- [ ] Go to **Visits** page
- [ ] Click "Start New Visit" button
- [ ] Select a customer from dropdown
- [ ] Verify check-in records timestamp
- [ ] Click "End Visit" to complete the visit
- [ ] Verify visit appears in history
- [ ] Check visit duration calculation

### 4. **Orders**
- [ ] Go to **Orders** page
- [ ] Click "Create New Order"
- [ ] Select customer and distributor
- [ ] Add products to order
- [ ] Verify order total calculation
- [ ] Submit order
- [ ] Verify order appears in list
- [ ] Test offline status badge (should show online)

### 5. **Photo Gallery**
- [ ] Go to **Photo Gallery**
- [ ] Verify photos display in grid
- [ ] Click on a photo to view in lightbox
- [ ] Test photo filters (by rep, type)
- [ ] Test search functionality
- [ ] Click download button on a photo
- [ ] Verify statistics cards show correct counts

### 6. **Mileage Tracking**
- [ ] Go to **Mileage Tracking** (for reps)
- [ ] Click "Start Mileage Log"
- [ ] Enter start odometer reading
- [ ] Click "End Mileage Log"
- [ ] Enter end odometer reading
- [ ] Verify distance calculation (end - start)
- [ ] Check mileage history displays logs

### 7. **Mileage Reports** (Manager)
- [ ] Go to **Mileage Reports**
- [ ] Verify summary statistics display
- [ ] Check rep summary table shows all reps
- [ ] Verify reimbursement calculations ($0.655/mile)
- [ ] Test date range filters
- [ ] Test rep filter
- [ ] Click CSV export button
- [ ] Verify CSV downloads

### 8. **Performance Analytics**
- [ ] Go to **Performance Analytics**
- [ ] Verify sales trend chart displays
- [ ] Check rep performance rankings
- [ ] View customer growth chart
- [ ] Check order volume by distributor
- [ ] Test date range filters (7/30/90 days, 1 year)
- [ ] Verify all charts are interactive

### 9. **Predictive Analytics**
- [ ] Go to **Predictive Analytics**
- [ ] View Sales Forecast tab (30-day predictions)
- [ ] Check Trend Analysis tab
- [ ] View Churn Risk tab (at-risk customers)
- [ ] Check Customer Value tab
- [ ] Test date range filters
- [ ] Verify predictions are calculated

### 10. **AI Sales Coach**
- [ ] Go to **AI Sales Coach**
- [ ] Select "Objection Handling" tab
- [ ] Enter a customer name and objection
- [ ] Select experience level (junior/mid/senior)
- [ ] Click "Get Coaching"
- [ ] Verify AI response with strategies and examples
- [ ] Test "Customer Strategy" tab
- [ ] Test "General Coaching" tab

### 11. **Route Optimization**
- [ ] Go to **Route Optimization**
- [ ] Select customers to optimize
- [ ] Choose optimization method (Nearest Neighbor)
- [ ] Set max stops per route
- [ ] Click "Optimize Route"
- [ ] Verify route sequencing
- [ ] Check distance and time savings
- [ ] Test export functionality

### 12. **Live Tracking**
- [ ] Go to **Live Tracking**
- [ ] Verify team member locations on map
- [ ] Click on a rep to view details
- [ ] Check location history
- [ ] Verify real-time updates

### 13. **Reports Dashboard**
- [ ] Go to **Reports**
- [ ] Verify Sales Performance by Rep section
- [ ] Check Customer Visit Frequency
- [ ] View Order Volume by Distributor
- [ ] Check Route Efficiency Metrics
- [ ] View Photo Documentation Reports
- [ ] Test date range filters
- [ ] Test CSV export for each section

### 14. **Offline Mode**
- [ ] Go to **Offline Settings**
- [ ] Verify offline status indicator (should show green/online)
- [ ] Check cache status and size
- [ ] View pending operations (should be empty)
- [ ] Test manual sync button
- [ ] Check offline data cache

### 15. **Mobile Settings**
- [ ] Go to **Mobile Settings**
- [ ] Check biometric authentication options
- [ ] View background tracking settings
- [ ] Verify location permissions
- [ ] Check geofence configuration
- [ ] Test push notification settings

### 16. **Alerts**
- [ ] Go to **Alerts**
- [ ] Verify alerts display
- [ ] Check alert types (order, visit, system)
- [ ] Test alert filtering
- [ ] Click on alert to view details
- [ ] Test mark as read functionality

### 17. **Manager Dashboard**
- [ ] Go to **Manager Dashboard**
- [ ] Verify team overview statistics
- [ ] Check active visits
- [ ] View pending orders
- [ ] Check alerts and notifications
- [ ] Verify performance metrics

### 18. **Internal Notes**
- [ ] Go to **Internal Notes History**
- [ ] Verify notes display
- [ ] Check note filtering by customer
- [ ] Test note search
- [ ] Verify timestamps

### 19. **PWA Features**
- [ ] Open app in Chrome/Edge
- [ ] Check for "Install app" prompt
- [ ] Install app to home screen
- [ ] Verify app launches from home screen
- [ ] Check offline functionality
- [ ] Verify push notifications work

### 20. **User Profile**
- [ ] Click user avatar in bottom left
- [ ] Verify user information displays
- [ ] Check logout functionality
- [ ] Verify login redirects to dashboard

## Performance Testing

### Load Times
- [ ] Dashboard loads in < 2 seconds
- [ ] Customer list loads in < 1 second
- [ ] Charts render smoothly
- [ ] Map loads without lag

### Browser Compatibility
- [ ] Test on Chrome (latest)
- [ ] Test on Firefox (latest)
- [ ] Test on Safari (latest)
- [ ] Test on Edge (latest)

### Mobile Responsiveness
- [ ] Test on iPhone 12 (375px width)
- [ ] Test on iPad (768px width)
- [ ] Test on Android phone (360px width)
- [ ] Verify touch interactions work
- [ ] Check button sizes are tap-friendly

## Data Integrity Testing

### Customer Data
- [ ] Verify 20 customers load
- [ ] Check customer details are accurate
- [ ] Verify customer relationships

### Visit Data
- [ ] Verify visits save correctly
- [ ] Check visit timestamps are accurate
- [ ] Verify visit duration calculations

### Order Data
- [ ] Verify orders save correctly
- [ ] Check order totals calculate correctly
- [ ] Verify distributor assignments

### Photo Data
- [ ] Verify photos display
- [ ] Check photo metadata
- [ ] Verify photo counts in reports

## Security Testing

### Authentication
- [ ] Verify login required
- [ ] Check session persistence
- [ ] Verify logout clears session
- [ ] Test unauthorized access is blocked

### Data Protection
- [ ] Verify sensitive data not exposed in logs
- [ ] Check API responses don't leak data
- [ ] Verify HTTPS is used

## Offline Testing

### Offline Functionality
- [ ] Disconnect internet
- [ ] Verify app still displays cached data
- [ ] Try to create new visit (should queue)
- [ ] Reconnect internet
- [ ] Verify queued operations sync
- [ ] Check sync status updates

## Known Issues & Workarounds

### TypeScript Errors
- Some TypeScript errors in Visits.tsx are cosmetic and don't affect functionality
- App runs and functions normally despite these warnings

### HubSpot Integration
- Requires valid HubSpot API key in settings
- Test by going to HubSpot Settings and clicking sync buttons

## Testing Checklist Summary

- [ ] All 20 test categories completed
- [ ] No critical errors encountered
- [ ] Performance is acceptable
- [ ] Mobile responsiveness verified
- [ ] Offline mode works
- [ ] All features function as expected
- [ ] Cascadia logo displays correctly
- [ ] App ready for production deployment

## Reporting Issues

If you encounter any issues during testing:
1. Note the exact steps to reproduce
2. Screenshot or video of the issue
3. Browser and device information
4. Expected vs actual behavior

Contact the development team with these details for quick resolution.
