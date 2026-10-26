/**
 * Helper functions for member lookups with case-insensitive email matching.
 */

import { createServiceClient } from './service';
import type { Member } from './types';

/**
 * Finds a member by email (case-insensitive).
 * Returns null if not found.
 */
export async function getMemberByEmail(email: string): Promise<Member | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('members')
    .select('*')
    .ilike('email', email) // Case-insensitive match
    .single();

  if (error || !data) {
    return null;
  }

  return data;
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
