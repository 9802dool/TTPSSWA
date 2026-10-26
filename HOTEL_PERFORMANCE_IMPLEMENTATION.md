# Hotel Performance Dashboard Implementation

## Overview

This implementation adds a comprehensive executive hotel performance dashboard to the TTPSSWA site with automated weekly and monthly email reports.

## What Was Built

### 1. Performance Dashboard (`/admin/hotel-performance`)

**Access**: All admin roles (super_admin, staff, viewer)
- Viewers have read-only access (perfect for executive review)

**Features**:
- Weekly/monthly toggle for reporting periods
- Period navigation (Previous/Next/Today)
- All dates in America/Port_of_Spain timezone
- Period-over-period comparison for all metrics
- 12-period trend charts (12 weeks or 12 months)
- CSV export with complete data

**Metrics Displayed**:

*Revenue*
- Room revenue (TTD)
- Meal revenue (TTD)
- Total revenue (TTD)

*Occupancy*
- Overall occupancy rate (%)
- Presidential Suite occupancy
- Single Occupancy occupancy
- Double Occupancy occupancy
- Room-nights booked vs available

*Booking Activity*
- Requests received
- Requests confirmed
- Requests cancelled
- Confirmation rate (%)

*Guest Profile*
- Member bookings count
- Non-member bookings count
- Member split percentage
- Average length of stay (nights)
- Average booking lead time (days)

*Trend Charts*
- Total revenue over time
- Occupancy rate over time
- Room revenue over time
- Confirmation rate over time

### 2. Booking Status Management

**New Status**: `CHECKED_OUT`
- Added to `BookingStatus` enum
- Allows tracking of completed stays
- Required for accurate revenue reporting

**Admin Interface**:
- Status dropdown on booking detail pages
- Options: Pending, Confirmed, Cancelled, Checked Out
- Only staff+ can update (viewer is read-only)
- Instant update with confirmation message

**Migration**: `20261026180000_add_hotel_booking_checked_out_status.sql`
- Additive only (safe to run)
- Does not modify existing bookings
- Uses `ADD VALUE IF NOT EXISTS` for safety

### 3. Automated Email Reports

**Schedule** (configured in `vercel.json`):
- Weekly: Every Monday at 8:00 AM Trinidad time (12:00 UTC)
- Monthly: 1st of each month at 8:00 AM Trinidad time (12:00 UTC)

**Email Content**:
- Professional HTML format with inline CSS
- Revenue summary cards with period comparison
- Occupancy metrics table
- Booking activity breakdown
- Guest profile statistics
- Color-coded trend indicators (green=up, red=down)

**Security**:
- Protected by `CRON_SECRET` in Authorization header
- Only Vercel Cron can trigger the endpoint

**Behavior**:
- Silently skips if `EXEC_REPORT_EMAILS` is unset
- Fails gracefully with error logging
- Sends to all recipients in comma-separated list

### 4. Metrics Calculation Library

**File**: `lib/hotel-performance-metrics.ts`

**Design**:
- Pure functions (no side effects)
- Fully typed with TypeScript
- Comprehensive test coverage (18 tests)
- Uses existing pricing from `lib/hotel-pricing.ts`

**Key Functions**:
- `calculatePeriodMetrics()` - Core metrics for a date range
- `calculateComparisonMetrics()` - Adds period-over-period comparison
- `calculateTrendData()` - Generates 12-period trend series
- `generateCSV()` - Exports metrics to CSV format
- Date utilities for Trinidad timezone handling

**Room Inventory** (from database):
- Presidential Suite: 2 rooms
- Single Occupancy: 2 rooms
- Double Occupancy: 4 rooms

## Files Changed

### New Files (6)
1. `app/admin/hotel-performance/page.tsx` - Dashboard page
2. `components/HotelPerformanceDashboard.tsx` - Interactive UI
3. `lib/hotel-performance-metrics.ts` - Metrics library
4. `__tests__/hotel-performance-metrics.test.ts` - Tests
5. `app/api/cron/hotel-performance-report/route.ts` - Email cron
6. `prisma/migrations/20261026180000_add_hotel_booking_checked_out_status/migration.sql`

### Modified Files (8)
1. `prisma/schema.prisma` - Added CHECKED_OUT status
2. `vercel.json` - Added cron schedules
3. `app/admin/page.tsx` - Added nav link
4. `app/admin/hotel-reservations/page.tsx` - Added nav link
5. `app/admin/hotel-reservations/[id]/page.tsx` - Display status
6. `components/HotelBookingAdminActions.tsx` - Status UI
7. `app/api/admin/hotel-bookings/[id]/route.ts` - Status API
8. `.env.example` - Documentation

## Environment Variables

### Required

**`CRON_SECRET`**
- Purpose: Authenticate Vercel Cron requests
- Generate: `openssl rand -hex 32`
- Set in: Vercel Project Settings → Environment Variables
- Scope: Production (and Preview if desired)

### Optional

**`EXEC_REPORT_EMAILS`**
- Purpose: Recipients for automated reports
- Format: Comma-separated email addresses
- Example: `exec1@ttpsswa.org,exec2@ttpsswa.org,cfo@ttpsswa.org`
- Behavior: If unset, cron skips silently (no error)
- Set in: Vercel Project Settings → Environment Variables
- Scope: Production (and Preview if testing)

### Already Required (No Changes)

**`RESEND_API_KEY`** - Used for sending emails (already configured)
**`DATABASE_URL`** - Prisma connection (already configured)

## Migration Instructions

### Before Deploying to Production

Run the database migration to add the `CHECKED_OUT` status:

```bash
# Using Prisma
npx prisma migrate deploy

# Or direct SQL (if you prefer)
psql $DATABASE_URL -c "ALTER TYPE \"BookingStatus\" ADD VALUE IF NOT EXISTS 'CHECKED_OUT';"
```

**Safety**: This migration is additive only. It:
- ✅ Adds a new enum value
- ✅ Does not modify existing data
- ✅ Uses `IF NOT EXISTS` for idempotency
- ✅ Safe to re-run

## Deployment Steps

1. **Merge PR** to main branch
2. **Run migration** (see above)
3. **Set environment variables** in Vercel:
   - `CRON_SECRET` (required)
   - `EXEC_REPORT_EMAILS` (optional)
4. **Deploy** (automatic on merge)
5. **Verify cron jobs** in Vercel dashboard:
   - Project → Settings → Cron Jobs
   - Should show 2 jobs for `/api/cron/hotel-performance-report`

## Testing Locally

### Test the Dashboard

```bash
npm run dev
# Visit http://localhost:3001/admin/hotel-performance
```

### Test Metrics Calculations

```bash
npm test hotel-performance-metrics
```

### Test Email Reports (Manual Trigger)

```bash
# Set environment variables in .env.local
CRON_SECRET=test-secret
EXEC_REPORT_EMAILS=your-email@example.com
RESEND_API_KEY=re_your_key
DATABASE_URL=your_db_url

# Start dev server
npm run dev

# Trigger cron endpoint
curl -X GET http://localhost:3001/api/cron/hotel-performance-report \
  -H "Authorization: Bearer test-secret"
```

## How It Works

### Data Flow

1. **Dashboard Page** (`/admin/hotel-performance`)
   - Server fetches all `HotelBooking` records from Prisma
   - Passes bookings to client component
   
2. **Client Component** (`HotelPerformanceDashboard`)
   - User selects weekly/monthly and period
   - Calculates metrics in browser using pure functions
   - Renders cards, tables, and charts
   - CSV export generates locally

3. **Email Reports** (Cron)
   - Vercel Cron triggers endpoint twice:
     - Monday 12:00 UTC (8 AM Trinidad)
     - 1st of month 12:00 UTC (8 AM Trinidad)
   - Route checks day/date to determine report type
   - Fetches bookings from Prisma
   - Calculates metrics for current period
   - Generates HTML email
   - Sends via Resend to all recipients

### Revenue Calculation

**Room Revenue**:
- Uses rates from `lib/hotel-pricing.ts`
- Member rates vs non-member rates
- Formula: `rate × rooms × nights`
- Only counts CONFIRMED or CHECKED_OUT bookings

**Meal Revenue**:
- Uses prices from `MEAL_PRICES`
- Breakfast: $55, Lunch: $75, Dinner: $70
- Counts meals in booking's `meals` array

### Occupancy Calculation

**Overall Occupancy**:
- Formula: `(room-nights booked) / (room-nights available) × 100`
- Room-nights available = days in period × total rooms (8)
- Only counts CONFIRMED or CHECKED_OUT bookings

**By Room Type**:
- Same formula but per room category
- Presidential Suite: 2 rooms max
- Single Occupancy: 2 rooms max
- Double Occupancy: 4 rooms max

### Comparison Metrics

**Period-over-Period**:
- Previous period = same duration before current
- Weekly: compares to week before
- Monthly: compares to month before
- Shows percentage change for revenue
- Shows point change for rates (e.g., 5.2pp)

## Test Coverage

All 80 tests pass:
- ✅ 18 hotel-performance-metrics tests (new)
- ✅ 16 hotel-booking-api tests
- ✅ 10 application-routes tests
- ✅ 20 hotel-pricing tests
- ✅ 8 fixes tests
- ✅ 5 upsert-member tests
- ✅ 3 email-notifications tests

**New Tests Cover**:
- Basic metric calculations
- Member vs non-member revenue
- Meal revenue calculations
- Status filtering (cancelled excluded)
- Checked-out bookings included
- Occupancy rate calculations
- Occupancy by room type
- Average length of stay
- Average lead time
- Booking spans across period boundaries
- Comparison metrics and percentage changes
- Trend data generation (weekly/monthly)
- CSV export format
- Date range utilities

## Code Quality

- ✅ **Lint**: Clean (1 pre-existing warning unrelated)
- ✅ **TypeCheck**: No errors
- ✅ **Build**: Successful production build
- ✅ **Tests**: 80/80 passing
- ✅ **Pure Functions**: Metrics lib has no side effects
- ✅ **Type Safety**: Full TypeScript coverage

## Maintenance Notes

### Adding New Metrics

To add a new metric:

1. Update `PeriodMetrics` interface in `lib/hotel-performance-metrics.ts`
2. Add calculation in `calculatePeriodMetrics()`
3. Add comparison in `calculateComparisonMetrics()` if needed
4. Add to dashboard component
5. Add to email template
6. Add to CSV generator
7. Write tests

### Changing Room Inventory

Room counts are defined in:
- `lib/hotel-performance-metrics.ts` → `ROOM_INVENTORY` constant
- Also in `lib/hotel-availability.ts` → `ROOM_TYPE_CAPS`

Keep them in sync if inventory changes.

### Adjusting Cron Schedule

Edit `vercel.json` → `crons` array:

```json
{
  "crons": [
    {
      "path": "/api/cron/hotel-performance-report",
      "schedule": "0 12 * * 1"  // Weekly: Monday 12:00 UTC
    },
    {
      "path": "/api/cron/hotel-performance-report",
      "schedule": "0 12 1 * *"  // Monthly: 1st day 12:00 UTC
    }
  ]
}
```

Schedule uses standard cron syntax. Trinidad is UTC-4 (no DST).

## Future Enhancements (Not Implemented)

Possible additions for later:

- **Advanced Filters**: Filter by room type, member status, date range
- **Booking Source Tracking**: Track where bookings came from (form, phone, email)
- **Cancellation Reasons**: Add reason field for cancelled bookings
- **Revenue Forecasting**: Predict future revenue based on confirmed bookings
- **Seasonality Analysis**: Compare same period year-over-year
- **Export to Excel**: XLSX format with multiple sheets
- **Dashboard Embedding**: Allow embedding charts in other pages
- **Custom Report Builder**: Let admins choose metrics and date ranges
- **Mobile App Integration**: Expose metrics via API for mobile apps
- **Real-time Updates**: WebSocket for live occupancy updates

## Support

If issues arise:

1. Check Vercel deployment logs for errors
2. Check Vercel Cron logs for email failures
3. Verify environment variables are set correctly
4. Ensure migration has been applied
5. Test locally with `npm run dev`
6. Check browser console for client-side errors

## Pull Request

https://github.com/9802dool/TTPSSWA/pull/12
