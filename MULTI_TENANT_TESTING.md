# Multi-Company Isolation Testing Guide

This guide explains how to test the multi-tenant architecture and verify that companies cannot see each other's data.

## Architecture Overview

The Cascadia Sales Tracker uses a **database-level isolation** approach:
- Every table has a `companyId` column
- All queries filter by `companyId` from the authenticated user's context
- Email domain mapping automatically assigns users to companies
- Users can only access data belonging to their company

## Email Domain Mapping

Configure which email domains map to which companies in `server/emailDomainConfig.ts`:

```typescript
export const emailDomainMapping: Record<string, { companyId: number; companyName: string }> = {
  "cascadiafoodbev.com": { companyId: 1, companyName: "Cascadia" },
  "techcorp.com": { companyId: 2, companyName: "Tech Corp" },
  "globalfoods.com": { companyId: 3, companyName: "Global Foods" },
};
```

## Setup Test Companies

Run the test setup script to create test companies and users:

```bash
node scripts/setup-test-companies.mjs
```

This creates:
- **Cascadia** (cascadiafoodbev.com) - alice@cascadiafoodbev.com, bob@cascadiafoodbev.com
- **Tech Corp** (techcorp.com) - charlie@techcorp.com, diana@techcorp.com
- **Global Foods** (globalfoods.com) - eve@globalfoods.com

## Testing Scenarios

### Scenario 1: Verify Company Isolation

1. **Sign in as Cascadia user**
   - Email: alice@cascadiafoodbev.com
   - Verify you see Cascadia customers and orders only

2. **Sign out and sign in as Tech Corp user**
   - Email: charlie@techcorp.com
   - Verify you see Tech Corp customers and orders only
   - Verify you do NOT see Cascadia's data

3. **Sign out and sign in as Global Foods user**
   - Email: eve@globalfoods.com
   - Verify you see Global Foods customers and orders only

### Scenario 2: Verify Cross-Company Data Access Prevention

1. **Sign in as alice@cascadiafoodbev.com**
2. **Open browser developer console (F12)**
3. **Try to manually fetch another company's data:**
   ```javascript
   // This should fail - you can't access other companies' data
   fetch('/api/trpc/customers.list?input={"companyId":2}')
   ```
4. **Verify the request is rejected or returns empty data**

### Scenario 3: Verify Company Admin Panel

1. **Sign in as alice@cascadiafoodbev.com (admin)**
2. **Navigate to Company Admin**
3. **Verify you can only manage Cascadia team members**
4. **Try to add a user from another company's email domain**
5. **Verify the system prevents cross-company user creation**

### Scenario 4: Verify Company Branding

1. **Sign in as alice@cascadiafoodbev.com**
2. **Verify Cascadia logo and branding display**
3. **Sign out and sign in as charlie@techcorp.com**
4. **Verify Tech Corp logo and branding display (if configured)**
5. **Verify each company sees their own branding**

## Database Verification

To verify data isolation at the database level:

```sql
-- Check Cascadia customers (companyId = 1)
SELECT * FROM customers WHERE companyId = 1;

-- Check Tech Corp customers (companyId = 2)
SELECT * FROM customers WHERE companyId = 2;

-- Verify no customers without companyId (data integrity)
SELECT * FROM customers WHERE companyId IS NULL;
```

## Security Checklist

- [ ] All queries include `WHERE companyId = ?` filter
- [ ] No user can see another company's customers
- [ ] No user can see another company's orders
- [ ] No user can see another company's team members
- [ ] No user can see another company's visits or mileage logs
- [ ] No user can see another company's routes or GPS tracks
- [ ] Email domain mapping prevents unregistered domains from accessing the system
- [ ] Company admin can only manage their own team members
- [ ] Company branding displays correctly per company

## Troubleshooting

### Issue: User sees data from multiple companies

**Solution:** Check that all database queries include the `companyId` filter:
```typescript
// ❌ Wrong - no company filter
const customers = await db.select().from(customers);

// ✅ Correct - includes company filter
const customers = await db.select().from(customers).where(eq(customers.companyId, ctx.companyId));
```

### Issue: Email domain mapping not working

**Solution:** Verify the email domain is configured in `emailDomainConfig.ts` and matches the user's email exactly (case-insensitive).

### Issue: Company branding not displaying

**Solution:** Check that the logo URL is correct and the file exists in `client/public/`.

## Adding New Companies

To add a new company:

1. **Add email domain mapping:**
   ```typescript
   // server/emailDomainConfig.ts
   "newcompany.com": { companyId: 4, companyName: "New Company" },
   ```

2. **Insert company into database:**
   ```sql
   INSERT INTO companies (id, name, domain, logoUrl) 
   VALUES (4, 'New Company', 'newcompany.com', '/newcompany-logo.png');
   ```

3. **Add company branding (optional):**
   ```typescript
   // server/companyBrandingService.ts
   brandingStore.set(4, {
     companyId: 4,
     logoUrl: "/newcompany-logo.png",
     primaryColor: "#FF0000",
     secondaryColor: "#00FF00",
     accentColor: "#0000FF",
     theme: "light",
   });
   ```

4. **Test the new company:**
   - Create a user with the new company's email domain
   - Sign in and verify data isolation
   - Verify branding displays correctly

## Performance Considerations

- Add database indexes on `companyId` columns for faster queries
- Consider caching company branding to reduce database queries
- Monitor query performance as the number of companies grows

## Future Enhancements

- [ ] Row-Level Security (RLS) for additional database-level protection
- [ ] Separate databases per company for maximum isolation
- [ ] Company-specific feature flags and permissions
- [ ] Company analytics and usage tracking
- [ ] Automated company onboarding workflow
