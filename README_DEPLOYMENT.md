# SalesForce Tracker - Production Deployment Guide

## Overview

SalesForce Tracker is a comprehensive field sales operations platform designed for sales teams, managers, and distributors. It provides real-time tracking, offline capability, advanced analytics, and mobile PWA support.

## Features

### Core Features
- **Customer Management** - Add, edit, bulk import/export customers with location data
- **Route Planning** - GPS-based route planning and optimization
- **Visit Check-in** - Real-time GPS check-in/check-out with activity logging
- **Order Management** - Create orders with multi-distributor support
- **Product Catalog** - Manage products with pricing and inventory
- **Photo Documentation** - Upload and organize photos with metadata
- **Live Tracking** - Real-time team location tracking on Google Maps
- **Internal Notes** - Add and share notes within the team

### Advanced Features
- **Real-Time Photo Gallery** - Browse all photos with filtering and lightbox
- **Mileage Tracking** - Log daily mileage with automatic distance calculation
- **Mileage Reports** - Generate reimbursement reports with IRS standard rates
- **Performance Analytics** - 7 interactive charts for sales metrics
- **Customer Timeline** - Complete interaction history for each customer
- **Route Optimization** - Automatic route sequencing with efficiency scoring
- **Email Notifications** - Order confirmations, visit reminders, alerts
- **Offline Mode** - Work without internet, auto-sync when reconnected
- **Mobile PWA** - Install as app, offline support, push notifications

### Manager Features
- **Manager Dashboard** - Team performance overview and alerts
- **Reports** - Sales performance, customer frequency, order volume, efficiency metrics
- **Team Tracking** - Live location tracking with Google Maps
- **Alert Management** - Create and manage team alerts
- **Mileage Reports** - Track and approve mileage reimbursements

## Technology Stack

- **Frontend**: React 19, Tailwind CSS 4, TypeScript
- **Backend**: Express 4, tRPC 11, Node.js
- **Database**: MySQL/TiDB with Drizzle ORM
- **Maps**: Google Maps JavaScript API
- **Storage**: AWS S3 for file uploads
- **Authentication**: Manus OAuth
- **Charts**: Recharts
- **PWA**: Service Worker, Web App Manifest

## System Requirements

- Node.js 22.13.0+
- pnpm package manager
- MySQL 8.0+ or TiDB compatible database
- Google Maps API key (provided via proxy)
- Manus platform account for OAuth and APIs

## Installation & Setup

### 1. Environment Configuration

All environment variables are automatically injected by the Manus platform:
- `DATABASE_URL` - MySQL/TiDB connection string
- `JWT_SECRET` - Session cookie signing secret
- `VITE_APP_ID` - Manus OAuth application ID
- `OAUTH_SERVER_URL` - Manus OAuth backend URL
- `VITE_OAUTH_PORTAL_URL` - Manus login portal URL
- `VITE_APP_TITLE` - Application title
- `VITE_APP_LOGO` - Logo image URL
- `BUILT_IN_FORGE_API_URL` - Manus built-in APIs
- `BUILT_IN_FORGE_API_KEY` - API authentication key

### 2. Database Setup

The database schema is automatically created during deployment. Tables include:
- `users` - User accounts and roles
- `customers` - Customer information with locations
- `visits` - Visit check-in/check-out records
- `orders` - Order records with items
- `products` - Product catalog
- `photos` - Photo uploads with metadata
- `mileage_logs` - Mileage tracking records
- `alerts` - Manager alerts
- `internal_notes` - Team notes

### 3. Deployment

The application is deployed via the Manus platform:

1. Click "Publish" button in Management UI
2. System automatically builds and deploys
3. Application available at `https://[project-name].manus.space`
4. Custom domain can be configured in Settings → Domains

## User Roles & Access Control

### Sales Representative
- Create and manage own visits
- Upload photos and documents
- Track mileage
- Create orders
- View customer information
- Access route optimization
- View own performance

### Manager
- View all team visits and activities
- Track team locations in real-time
- Create and manage alerts
- Generate reports and analytics
- Approve mileage reimbursements
- Manage customer data
- View performance metrics

### Admin
- Full system access
- User management
- System configuration
- Data management

## Key Workflows

### Sales Rep Daily Workflow
1. **Start Day** - View optimized route for today
2. **Navigate** - Use Route Optimization page
3. **Visit Customer** - Check-in at location
4. **Document** - Take photos of products/displays
5. **Create Order** - Add orders for customer
6. **End Visit** - Check-out when leaving
7. **Log Mileage** - Record start/end odometer readings
8. **Sync** - Changes automatically sync when online

### Manager Workflow
1. **Monitor** - View live team tracking
2. **Analyze** - Check performance analytics
3. **Report** - Generate sales and efficiency reports
4. **Manage** - Review alerts and customer data
5. **Reimburse** - Process mileage reimbursements

## Offline Mode

### How It Works
- App automatically detects internet connection
- Operations are queued locally when offline
- Changes sync automatically when reconnected
- All data persists across sessions

### Supported Offline Operations
- Create visits and check-in/check-out
- Create orders
- Upload photos (queued for sync)
- Log mileage
- Add internal notes
- Browse cached customers and products

### Offline Indicator
- **Green** - Online and synced
- **Yellow** - Offline
- **Blue** - Syncing operations
- **Orange** - Pending changes

## Mobile PWA

### Installation
1. Open app on mobile browser
2. Tap menu → "Install app" or "Add to Home Screen"
3. App installs like native app
4. Works offline with push notifications

### Features
- Install to home screen
- Offline functionality
- Push notifications for alerts
- App shortcuts for quick actions
- Reduced data usage with caching

## Performance Optimization

### Caching Strategy
- **Static Assets** - Cache-first (service worker)
- **API Calls** - Network-first with fallback
- **Customer/Product Data** - 24-hour cache
- **Photos** - Lazy loading with thumbnails

### Data Optimization
- Pagination for large lists
- Lazy loading for images
- Optimized database queries
- Compressed photo uploads

## Security Features

- OAuth 2.0 authentication
- JWT session tokens
- HTTPS encryption
- Role-based access control
- SQL injection prevention (Drizzle ORM)
- XSS protection
- CSRF protection

## Monitoring & Support

### Health Checks
- Database connectivity
- API availability
- Service worker status
- Authentication status

### Error Handling
- Graceful error messages
- Automatic retry logic
- Offline fallback
- Error logging

### Support Resources
- In-app help tooltips
- Feature documentation
- Error messages with solutions
- Contact support form

## Troubleshooting

### Common Issues

**"Offline" indicator stays yellow**
- Check internet connection
- Clear browser cache
- Restart browser
- Check service worker in DevTools

**Photos not uploading**
- Check file size (max 10MB)
- Verify internet connection
- Check storage quota
- Try different photo format

**Route optimization not working**
- Ensure customers have location data
- Check for valid coordinates
- Try with fewer customers
- Clear browser cache

**Sync not completing**
- Check internet connection
- Verify database connectivity
- Check API keys in settings
- Review error logs

## Maintenance

### Regular Tasks
- Monitor database size
- Review error logs
- Update dependencies (quarterly)
- Backup user data
- Test disaster recovery

### Database Maintenance
- Monitor query performance
- Optimize indexes
- Archive old data
- Verify backups

## Scaling Considerations

### For Growing Teams
- Monitor database performance
- Consider read replicas for reports
- Implement caching layer
- Optimize photo storage

### For Multiple Regions
- Deploy to regional servers
- Use CDN for assets
- Implement regional databases
- Consider data residency requirements

## API Documentation

### Core tRPC Procedures

**Customers**
- `customers.list` - Get all customers
- `customers.create` - Create new customer
- `customers.update` - Update customer
- `customers.delete` - Delete customer

**Visits**
- `visits.list` - Get all visits
- `visits.create` - Create new visit
- `visits.checkIn` - Check-in at location
- `visits.checkOut` - Check-out from location

**Orders**
- `orders.list` - Get all orders
- `orders.create` - Create new order
- `orders.update` - Update order
- `orders.delete` - Delete order

**Photos**
- `photos.list` - Get all photos
- `photos.upload` - Upload photo
- `photos.delete` - Delete photo

**Mileage**
- `mileage.list` - Get all mileage logs
- `mileage.create` - Create mileage log
- `mileage.delete` - Delete mileage log

**Email**
- `email.sendOrderConfirmation` - Send order confirmation
- `email.sendVisitReminder` - Send visit reminder
- `email.sendAlert` - Send alert notification

## Version History

### v1.0.0 (Current)
- Core field sales features
- Real-time tracking
- Offline support
- Mobile PWA
- Advanced analytics
- Route optimization
- Email notifications

## Future Roadmap

- Drag-and-drop route reordering
- Territory assignment and balancing
- Route templates for recurring patterns
- Advanced conflict detection
- Predictive analytics
- Customer segmentation
- Inventory management
- Integration with accounting systems
- Multi-language support
- Advanced reporting builder

## Support & Contact

For technical support, issues, or feature requests:
- Visit https://help.manus.im
- Contact your Manus account manager
- Submit feedback through in-app form

## License

SalesForce Tracker is provided as part of the Manus platform.
All rights reserved.

---

**Last Updated**: November 2025
**Version**: 1.0.0
**Status**: Production Ready
