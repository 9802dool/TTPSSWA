# Application Routes Test Plan

This document describes manual tests for the 7 public application form routes to verify:
1. Admin notifications are sent
2. Applicant confirmations are sent
3. Existing members are not overwritten
4. Spam protections remain intact

## Test Environment Setup

Set these environment variables in `.env.local`:
```
RESEND_API_KEY=your_key_here
ADMIN_NOTIFY_EMAIL=admin@example.com
BOOKING_FROM_EMAIL=TTPSSWA <noreply@ttpsswa.org>
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

## Routes to Test

1. `/api/member-signup` (POST)
2. `/api/salary-deduction` (POST)
3. `/api/merit-salary-deduction` (POST)
4. `/api/dental-optical-grant` (POST)
5. `/api/legal-aid-application` (POST)
6. `/api/merit-loan-application` (POST)
7. `/api/retirement-benefit-application` (POST)

## Test Cases for Each Route

### Test 1: Successful Submission (New Member)

**Expected Behavior:**
- Application saves successfully
- Member record created
- Admin notification sent
- Applicant confirmation sent
- No `submitted_data` field (new member)

**Steps:**
1. Submit form with all required fields
2. Use unique email/service number
3. Verify response: `{ ok: true, id: "<application_id>" }`
4. Check database: new member created
5. Check email: admin received notification
6. Check email: applicant received confirmation

### Test 2: Honeypot Protection

**Expected Behavior:**
- Silent rejection (returns success but doesn't save)

**Steps:**
1. Submit form with `website` field populated
2. Verify response: `{ ok: true }` or `{ ok: true, id: "spam-rejected" }`
3. Check database: no new application created

### Test 3: Existing Member (Profile Not Overwritten)

**Expected Behavior:**
- Application saves and links to existing member
- Member profile NOT updated
- `submitted_data` field contains form data
- Admin notification sent
- Applicant confirmation sent

**Steps:**
1. Create a member in the database with:
   - email: `test@example.com`
   - service_number: `12345`
   - full_name: `Original Name`
   - address: `Original Address`
2. Submit application with:
   - email: `test@example.com`
   - service_number: `12345`
   - full_name: `Different Name`
   - address: `Different Address`
3. Verify response: `{ ok: true, id: "<application_id>" }`
4. Check database:
   - Member profile unchanged (still "Original Name", "Original Address")
   - Application created with `member_id` linking to existing member
   - Application `submitted_data` field contains "Different Name" and "Different Address"
5. Check emails sent

### Test 4: Rate Limiting

**Expected Behavior:**
- First submission succeeds
- Rapid subsequent submissions rejected

**Steps:**
1. Submit form successfully
2. Immediately submit again from same IP or same email
3. Verify response: `{ ok: false, error: "Too many submissions..." }`

## Route-Specific Tests

### merit-salary-deduction

**Additional Verification:**
- Saves as `application_type: 'merit_salary_deduction'` (not `salary_deduction`)
- Admin filter includes "Merit Salary Deduction" option
- Export CSV labels it correctly

## Automated Test Script

Since no test framework exists, here's a simple Node.js script to test key functionality:

```javascript
// test-application-routes.js
// Run with: node test-application-routes.js

const TEST_BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';

async function testRoute(route, formData) {
  const form = new FormData();
  for (const [key, value] of Object.entries(formData)) {
    form.append(key, value);
  }
  
  const response = await fetch(`${TEST_BASE_URL}${route}`, {
    method: 'POST',
    body: form,
  });
  
  return {
    status: response.status,
    data: await response.json(),
  };
}

async function main() {
  console.log('Testing application routes...\n');
  
  // Test 1: Honeypot rejection
  console.log('Test 1: Honeypot rejection');
  const honeyResult = await testRoute('/api/salary-deduction', {
    website: 'https://spam.com',
    regimentalNumber: '12345',
    rank: 'Constable',
    fullName: 'Test User',
    email: 'test@example.com',
    // ... other fields
  });
  console.log('Expected: ok=true (silent rejection)');
  console.log('Actual:', honeyResult.data);
  console.log('✓ Honeypot test passed\n');
  
  // Add more tests...
  
  console.log('All tests completed!');
}

main().catch(console.error);
```

## Verification Checklist

After running all tests:

- [ ] All routes accept valid submissions
- [ ] Honeypot protection works on all routes
- [ ] Form token validation works on all routes
- [ ] Turnstile validation works (if configured)
- [ ] Rate limiting works by IP and by email/service number
- [ ] Admin notifications are sent
- [ ] Applicant confirmations are sent (except duplicate for member-signup)
- [ ] Existing members are NOT overwritten
- [ ] `submitted_data` field is populated for existing members
- [ ] Admin dashboard shows submitted data when present
- [ ] Merit salary deduction uses correct type
- [ ] Admin filters include "Merit Salary Deduction"
- [ ] CSV export includes both salary deduction types
- [ ] Migration backfill correctly identified merit vs standard forms
