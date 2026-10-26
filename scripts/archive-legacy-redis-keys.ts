/**
 * Export legacy Redis application keys for archival.
 * 
 * This script exports application data that was previously stored in Redis
 * but has now been migrated to Supabase. Run this before cleaning up Redis
 * keys to preserve historical data.
 * 
 * Usage:
 *   1. Set environment variables:
 *      - UPSTASH_REDIS_REST_URL
 *      - UPSTASH_REDIS_REST_TOKEN
 *   
 *   2. DRY RUN (default): npx tsx scripts/archive-legacy-redis-keys.ts
 *      This shows what would be exported without writing anything.
 *   
 *   3. EXPORT: npx tsx scripts/archive-legacy-redis-keys.ts --export
 *      Writes data/redis-archive-{timestamp}.json
 * 
 * NOTE: This script DOES NOT delete any Redis keys. It only exports data.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { getRedis } from '../lib/redis';

const DRY_RUN = !process.argv.includes('--export');

// Redis keys that store application data (now in Supabase)
const LEGACY_KEYS = {
  memberSignupsPending: 'member_signups:pending',
  serviceLog: 'analytics:service_requests',
} as const;

interface ArchiveData {
  exportedAt: string;
  keys: {
    [K in keyof typeof LEGACY_KEYS]: {
      key: string;
      type: string;
      count: number;
      data: unknown;
    };
  };
}

async function archiveLegacyKeys() {
  console.log('\n=== Archive Legacy Redis Keys ===\n');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No files will be written');
    console.log('   Add --export flag to write the archive file\n');
  } else {
    console.log('💾 EXPORT MODE - Data will be written to disk\n');
  }

  const redis = getRedis();
  if (!redis) {
    console.error('❌ Redis is not configured.');
    console.error('   Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN\n');
    process.exit(1);
  }

  const archive: ArchiveData = {
    exportedAt: new Date().toISOString(),
    keys: {
      memberSignupsPending: {
        key: LEGACY_KEYS.memberSignupsPending,
        type: 'list',
        count: 0,
        data: [],
      },
      serviceLog: {
        key: LEGACY_KEYS.serviceLog,
        type: 'list',
        count: 0,
        data: [],
      },
    },
  };

  console.log('📥 Fetching data from Redis...\n');

  // Fetch member signups
  try {
    const signups = await redis.lrange(LEGACY_KEYS.memberSignupsPending, 0, -1);
    archive.keys.memberSignupsPending.count = signups.length;
    archive.keys.memberSignupsPending.data = signups.map((item) => {
      try {
        return typeof item === 'string' ? JSON.parse(item) : item;
      } catch {
        return item;
      }
    });
    console.log(`✓ ${signups.length} member signup(s) in ${LEGACY_KEYS.memberSignupsPending}`);
  } catch (error) {
    console.error(`❌ Error fetching ${LEGACY_KEYS.memberSignupsPending}:`, error);
  }

  // Fetch service requests
  try {
    const requests = await redis.lrange(LEGACY_KEYS.serviceLog, 0, -1);
    archive.keys.serviceLog.count = requests.length;
    archive.keys.serviceLog.data = requests.map((item) => {
      try {
        return typeof item === 'string' ? JSON.parse(item) : item;
      } catch {
        return item;
      }
    });
    console.log(`✓ ${requests.length} service request(s) in ${LEGACY_KEYS.serviceLog}`);
  } catch (error) {
    console.error(`❌ Error fetching ${LEGACY_KEYS.serviceLog}:`, error);
  }

  const totalRecords =
    archive.keys.memberSignupsPending.count + archive.keys.serviceLog.count;

  console.log(`\n📊 Total records: ${totalRecords}\n`);

  if (DRY_RUN) {
    console.log('✓ Dry run complete - no files written');
    console.log('  Run with --export to write archive file\n');
    return;
  }

  // Write archive file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outputPath = `data/redis-archive-${timestamp}.json`;

  try {
    mkdirSync('data', { recursive: true });
    writeFileSync(outputPath, JSON.stringify(archive, null, 2), 'utf-8');
    console.log(`✓ Archive written to ${outputPath}`);
    console.log(`  File size: ${(JSON.stringify(archive).length / 1024).toFixed(1)} KB\n`);
  } catch (error) {
    console.error(`❌ Error writing archive file:`, error);
    process.exit(1);
  }
}

archiveLegacyKeys().catch((error) => {
  console.error('\n❌ Archive failed:', error);
  process.exit(1);
});
