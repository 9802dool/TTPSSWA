/**
 * ONE-TIME MIGRATION: Copy existing Redis application data to Supabase
 * 
 * DO NOT RUN THIS AGAINST PRODUCTION WITHOUT A BACKUP!
 * 
 * Usage:
 *   1. Set environment variables:
 *      - UPSTASH_REDIS_REST_URL
 *      - UPSTASH_REDIS_REST_TOKEN
 *      - NEXT_PUBLIC_SUPABASE_URL
 *      - SUPABASE_SERVICE_ROLE_KEY
 *   
 *   2. Run: npx tsx scripts/migrate-redis-to-supabase.ts
 *   
 *   3. Review the output - it shows what would be migrated
 *   
 *   4. If it looks correct, run with --execute:
 *      npx tsx scripts/migrate-redis-to-supabase.ts --execute
 */

import { getAllMemberApplications, type PendingMemberSignup } from '../lib/member-signup-storage';
import { getAdminStats, type ServiceRequestRecord } from '../lib/analytics-storage';
import { createServiceClient } from '../lib/supabase/service';
import { upsertMember, createApplication, uploadApplicationDocument } from '../lib/supabase/applications';
import type { ApplicationType } from '../lib/supabase/types';

const DRY_RUN = !process.argv.includes('--execute');

interface MigrationResult {
  totalRedisSignups: number;
  totalRedisServiceRequests: number;
  migratedMembers: number;
  migratedSignups: number;
  migratedBenefits: number;
  migratedHotelBookings: number;
  errors: string[];
}

async function migrateMemberSignup(signup: PendingMemberSignup): Promise<boolean> {
  console.log(`  - ${signup.fullName} (${signup.email}) - ${signup.applicationStatus}`);

  if (DRY_RUN) {
    return true;
  }

  try {
    // Create or update member
    const memberResult = await upsertMember({
      email: signup.email,
      full_name: signup.fullName,
      service_number: signup.regimentalNumber,
      rank: signup.rank,
      phone: signup.phone,
      phone_country_code: signup.phoneCountryCode || '+1868',
      phone_home: signup.phoneHome,
      phone_work: signup.phoneWork,
      address: signup.address,
      department_division: signup.departmentDivision,
      section_station: signup.sectionStation,
      date_of_birth: signup.dateOfBirth,
      sex: signup.sex,
      age: signup.age ? parseInt(signup.age, 10) : undefined,
      username: signup.username,
      password_hash: signup.passwordHash,
      financial_member: signup.financialMember,
      date_of_enlistment: signup.dateOfEnlistment,
    });

    if (!memberResult) {
      throw new Error('Failed to create member record');
    }

    // Update member status based on application status
    if (signup.applicationStatus === 'accepted') {
      const supabase = createServiceClient();
      await supabase
        .from('members')
        .update({ member_status: 'active' })
        .eq('id', memberResult.member_id);
    }

    // Create application record
    const appResult = await createApplication({
      member_id: memberResult.member_id,
      application_type: 'membership_signup',
      application_data: {
        regimentalNumber: signup.regimentalNumber,
        rank: signup.rank,
        departmentDivision: signup.departmentDivision,
        sectionStation: signup.sectionStation,
        address: signup.address,
        phoneCountryCode: signup.phoneCountryCode || '+1868',
        phoneHome: signup.phoneHome,
        phoneWork: signup.phoneWork,
        phone: signup.phone,
        age: signup.age,
        sex: signup.sex,
        dateOfBirth: signup.dateOfBirth,
        dateOfEnlistment: signup.dateOfEnlistment,
        financialMember: signup.financialMember,
        declarationAccepted: signup.declarationAccepted,
        applicationDateSigned: signup.applicationDateSigned,
        beneficiaryFullName: signup.beneficiaryFullName,
        beneficiaryRelationship: signup.beneficiaryRelationship,
        beneficiaryIdNumber: signup.beneficiaryIdNumber,
        witnessName: signup.witnessName,
      },
      legacy_redis_id: signup.id,
    });

    if (!appResult) {
      throw new Error('Failed to create application record');
    }

    // Update application status to match Redis status
    if (signup.applicationStatus !== 'pending') {
      const supabase = createServiceClient();
      const newStatus = signup.applicationStatus === 'accepted' ? 'approved' : 'rejected';
      await supabase
        .from('applications')
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', appResult.application_id);

      // Record in history
      await supabase.from('application_status_history').insert({
        application_id: appResult.application_id,
        from_status: 'submitted',
        to_status: newStatus,
        changed_by_type: 'system',
        note: 'Migrated from Redis with existing status',
      });
    }

    // Upload facial photo if present
    if (signup.photoBase64 && signup.photoMimeType) {
      try {
        const photoBuffer = Buffer.from(signup.photoBase64, 'base64');
        await uploadApplicationDocument({
          application_id: appResult.application_id,
          member_id: memberResult.member_id,
          document_type: 'facial_photo',
          file: photoBuffer,
          file_name: 'facial-photo.jpg',
          mime_type: signup.photoMimeType,
        });
      } catch (error) {
        console.error(`    ! Failed to upload photo: ${error}`);
        // Continue - application is still valid
      }
    }

    return true;
  } catch (error) {
    console.error(`    ! Error migrating signup: ${error}`);
    return false;
  }
}

async function migrateServiceRequest(request: ServiceRequestRecord): Promise<boolean> {
  const payload = request.payload;
  const fullName = String(payload.fullName || payload.guestName || '');
  const email = String(payload.email || '');
  
  console.log(`  - ${request.serviceType}: ${fullName} (${email})`);

  if (DRY_RUN) {
    return true;
  }

  try {
    let memberId: string | null = null;
    let applicationType: ApplicationType;

    // Map service type to application type
    switch (request.serviceType) {
      case 'dental_optical_grant':
        applicationType = 'dental_optical_grant';
        break;
      case 'legal_aid_application':
        applicationType = 'legal_aid_application';
        break;
      case 'merit_loan_application':
        applicationType = 'merit_loan_application';
        break;
      case 'retirement_benefit_application':
        applicationType = 'retirement_benefit_application';
        break;
      case 'salary_deduction':
        applicationType = 'salary_deduction';
        break;
      case 'hotel_booking':
        applicationType = 'hotel_booking';
        // Hotel bookings don't need member records
        break;
      default:
        console.error(`    ! Unknown service type: ${request.serviceType}`);
        return false;
    }

    // Create member for benefit applications (not hotels)
    if (email && applicationType !== 'hotel_booking') {
      const memberResult = await upsertMember({
        email,
        full_name: fullName,
        service_number: String(payload.regimentalNumber || ''),
        rank: String(payload.rank || ''),
        phone: String(payload.phone || ''),
        phone_country_code: String(payload.phoneCountryCode || '+1868'),
        phone_home: String(payload.phoneHome || undefined),
        phone_work: String(payload.phoneWork || undefined),
        address: String(payload.address || ''),
        department_division: String(payload.departmentDivision || undefined),
        section_station: String(payload.sectionStation || undefined),
      });

      if (memberResult) {
        memberId = memberResult.member_id;
      }
    }

    // Create application
    const appResult = await createApplication({
      member_id: memberId,
      application_type: applicationType,
      application_data: payload,
      legacy_redis_id: request.id,
    });

    if (!appResult) {
      throw new Error('Failed to create application record');
    }

    // Upload documents if present (base64 in Redis)
    const documents = payload.documents as Array<{ fileName: string; mimeType: string; base64: string }> | undefined;
    if (documents && Array.isArray(documents)) {
      for (const doc of documents) {
        try {
          const docBuffer = Buffer.from(doc.base64, 'base64');
          await uploadApplicationDocument({
            application_id: appResult.application_id,
            member_id: memberId || undefined,
            document_type: 'uploaded_document',
            file: docBuffer,
            file_name: doc.fileName,
            mime_type: doc.mimeType,
          });
        } catch (error) {
          console.error(`    ! Failed to upload document ${doc.fileName}: ${error}`);
        }
      }
    }

    return true;
  } catch (error) {
    console.error(`    ! Error migrating service request: ${error}`);
    return false;
  }
}

async function main() {
  console.log('\n=== TTPSSWA Redis → Supabase Migration ===\n');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No data will be written');
    console.log('   Add --execute flag to perform actual migration\n');
  } else {
    console.log('⚠️  LIVE MODE - Data will be written to Supabase\n');
  }

  const result: MigrationResult = {
    totalRedisSignups: 0,
    totalRedisServiceRequests: 0,
    migratedMembers: 0,
    migratedSignups: 0,
    migratedBenefits: 0,
    migratedHotelBookings: 0,
    errors: [],
  };

  // Fetch data from Redis
  console.log('📥 Fetching data from Redis...\n');
  const signups = await getAllMemberApplications();
  const stats = await getAdminStats();

  result.totalRedisSignups = signups.length;
  result.totalRedisServiceRequests = stats.serviceRequests.length;

  console.log(`Found ${signups.length} member signups in Redis`);
  console.log(`Found ${stats.serviceRequests.length} service requests in Redis\n`);

  // Migrate member signups
  if (signups.length > 0) {
    console.log('👤 Migrating member signups...');
    for (const signup of signups) {
      const success = await migrateMemberSignup(signup);
      if (success) {
        result.migratedSignups++;
      } else {
        result.errors.push(`Failed to migrate signup: ${signup.id}`);
      }
    }
    console.log(`✓ Migrated ${result.migratedSignups}/${signups.length} signups\n`);
  }

  // Migrate service requests
  if (stats.serviceRequests.length > 0) {
    console.log('📋 Migrating service requests...');
    for (const request of stats.serviceRequests) {
      const success = await migrateServiceRequest(request);
      if (success) {
        if (request.serviceType === 'hotel_booking') {
          result.migratedHotelBookings++;
        } else {
          result.migratedBenefits++;
        }
      } else {
        result.errors.push(`Failed to migrate ${request.serviceType}: ${request.id}`);
      }
    }
    console.log(`✓ Migrated ${result.migratedBenefits} benefit applications`);
    console.log(`✓ Migrated ${result.migratedHotelBookings} hotel bookings\n`);
  }

  // Summary
  console.log('\n=== Migration Summary ===\n');
  console.log(`Total Redis signups:        ${result.totalRedisSignups}`);
  console.log(`Total Redis requests:       ${result.totalRedisServiceRequests}`);
  console.log(`Migrated signups:           ${result.migratedSignups}`);
  console.log(`Migrated benefits:          ${result.migratedBenefits}`);
  console.log(`Migrated hotel bookings:    ${result.migratedHotelBookings}`);
  console.log(`Errors:                     ${result.errors.length}`);

  if (result.errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    result.errors.forEach(err => console.log(`   - ${err}`));
  }

  if (DRY_RUN) {
    console.log('\n✓ Dry run complete - no data was written');
    console.log('  Run with --execute to perform actual migration\n');
  } else {
    console.log('\n✓ Migration complete!\n');
  }
}

main().catch((error) => {
  console.error('\n❌ Migration failed:', error);
  process.exit(1);
});
