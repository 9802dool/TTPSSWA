/**
 * Helper functions for member lookups with case-insensitive email matching.
 */

import { createServiceClient } from './service';
import type { Member } from './types';

/**
 * Finds a member by email (exact case-insensitive match).
 * Returns null if not found.
 * If multiple members have the same email (shouldn't happen due to unique constraint),
 * returns the most recently created one.
 */
export async function getMemberByEmail(email: string): Promise<Member | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  // Use RPC function for safe case-insensitive exact match
  // This avoids wildcard issues with .ilike (which treats _ and % as wildcards)
  // and uses the idx_members_email_lower index for performance
  const { data, error } = await supabase
    .rpc('get_member_by_email_lower', {
      search_email: email
    })
    .maybeSingle();

  if (error) {
    console.error('Error fetching member by email:', error);
    return null;
  }

  return data as Member | null;
}

/**
 * Checks if an application belongs to a member (by case-insensitive email match).
 * Returns the member record if ownership is verified, null otherwise.
 */
export async function verifyApplicationOwnership(
  applicationId: string,
  userEmail: string
): Promise<{ member: Member; member_id: string } | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  // Get application with member join
  const { data: app, error: appError } = await supabase
    .from('applications')
    .select('id, member_id, members!inner(*)')
    .eq('id', applicationId)
    .single();

  if (appError || !app) {
    return null;
  }

  const member = (app as any).members as Member;
  
  // Case-insensitive email comparison
  if (member.email.toLowerCase() !== userEmail.toLowerCase()) {
    return null;
  }

  return {
    member,
    member_id: (app as any).member_id,
  };
}

/**
 * Checks if a document belongs to a member (by case-insensitive email match).
 * Returns the member record if ownership is verified, null otherwise.
 */
export async function verifyDocumentOwnership(
  documentId: string,
  userEmail: string
): Promise<{ member: Member; document: any } | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  // Get document with application and member joins
  const { data: doc, error: docError } = await supabase
    .from('application_documents')
    .select('*, applications!inner(member_id, members!inner(*))')
    .eq('id', documentId)
    .single();

  if (docError || !doc) {
    return null;
  }

  const member = (doc as any).applications?.members as Member;
  
  if (!member) {
    return null;
  }

  // Case-insensitive email comparison
  if (member.email.toLowerCase() !== userEmail.toLowerCase()) {
    return null;
  }

  return {
    member,
    document: doc,
  };
}
