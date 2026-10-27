/**
 * Cron job to clean up orphaned pending uploads.
 * Run daily via Vercel Cron or external scheduler.
 * 
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup-orphaned-uploads",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */

import { NextResponse } from "next/server";
import { cleanupOrphanedUploads } from "@/lib/supabase/direct-upload";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  // Verify cron secret (if set)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401 },
    );
  }

  try {
    const deletedCount = await cleanupOrphanedUploads(60); // Delete uploads older than 60 minutes
    
    return NextResponse.json({
      ok: true,
      deleted: deletedCount,
      message: `Cleaned up ${deletedCount} orphaned upload(s)`,
    });
  } catch (error) {
    console.error('Error in cleanup cron:', error);
    return NextResponse.json(
      { ok: false, error: 'Cleanup failed' },
      { status: 500 },
    );
  }
}
