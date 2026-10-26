import { createServiceClient } from './service';
import type {
  Application,
  ApplicationDocument,
  ApplicationStatus,
  ApplicationStatusHistory,
  ApplicationType,
  Member,
} from './types';

/**
 * Creates or finds a member record, returns member ID.
 * Used when submitting applications.
 * 
 * IMPORTANT: Does NOT overwrite existing member records from public submissions.
 * When an existing member is found, returns their ID without updating their profile.
 * The submitted form data is kept as-is in application.application_data.
 */
export async function upsertMember(data: {
  email: string;
  full_name: string;
  service_number?: string;
  rank?: string;
  phone?: string;
  phone_country_code?: string;
  phone_home?: string;
  phone_work?: string;
  address?: string;
  department_division?: string;
  section_station?: string;
  date_of_birth?: string;
  sex?: 'male' | 'female';
  age?: number;
  username?: string;
  password_hash?: string;
  financial_member?: 'yes' | 'no';
  date_of_enlistment?: string;
}): Promise<{ member_id: string; is_new: boolean } | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  // Try to find existing member by email (case-insensitive) or service number
  let existingMember: Member | null = null;
  
  if (data.email) {
    // Use RPC function for case-insensitive email lookup
    const { data: byEmail } = await supabase
      .rpc('get_member_by_email_lower', {
        search_email: data.email
      })
      .maybeSingle();
    existingMember = byEmail as Member | null;
  }

  if (!existingMember && data.service_number) {
    const { data: byService } = await supabase
      .from('members')
      .select('*')
      .eq('service_number', data.service_number)
      .single();
    existingMember = byService;
  }

  if (existingMember) {
    // Found existing member - do NOT overwrite their profile
    // Return their ID so the application can be linked
    // The submitted form data is preserved in application.application_data
    return { member_id: existingMember.id, is_new: false };
  }

  // Create new member with lowercased email
  const { data: newMember, error } = await supabase
    .from('members')
    .insert({
      email: data.email.toLowerCase(),
      service_number: data.service_number || null,
      full_name: data.full_name,
      rank: data.rank || null,
      phone: data.phone || null,
      phone_country_code: data.phone_country_code || '+1868',
      phone_home: data.phone_home || null,
      phone_work: data.phone_work || null,
      address: data.address || null,
      department_division: data.department_division || null,
      section_station: data.section_station || null,
      date_of_birth: data.date_of_birth || null,
      sex: data.sex || null,
      age: data.age || null,
      username: data.username || null,
      password_hash: data.password_hash || null,
      financial_member: data.financial_member || null,
      date_of_enlistment: data.date_of_enlistment || null,
      member_status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating member:', error);
    return null;
  }

  return { member_id: newMember.id, is_new: true };
}

/**
 * Creates an application record.
 */
export async function createApplication(data: {
  member_id?: string | null;
  application_type: ApplicationType;
  application_data: Record<string, unknown>;
  legacy_redis_id?: string;
}): Promise<{ application_id: string } | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data: app, error } = await supabase
    .from('applications')
    .insert({
      member_id: data.member_id || null,
      application_type: data.application_type,
      status: 'submitted',
      application_data: data.application_data,
      legacy_redis_id: data.legacy_redis_id || null,
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating application:', error);
    return null;
  }

  // Record initial status in history
  await supabase.from('application_status_history').insert({
    application_id: app.id,
    from_status: null,
    to_status: 'submitted',
    changed_by_type: 'system',
    note: 'Application submitted',
  });

  return { application_id: app.id };
}

/**
 * Uploads a file to Supabase Storage and records metadata.
 */
export async function uploadApplicationDocument(data: {
  application_id: string;
  member_id?: string;
  document_type: string;
  file: Buffer | Blob;
  file_name: string;
  mime_type: string;
}): Promise<{ document_id: string } | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  // Generate unique storage path
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const sanitizedName = data.file_name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `${data.application_id}/${timestamp}-${randomSuffix}-${sanitizedName}`;

  // Upload to storage
  const fileBuffer = data.file instanceof Buffer 
    ? data.file 
    : Buffer.from(await (data.file as Blob).arrayBuffer());
  
  const { error: uploadError } = await supabase.storage
    .from('application-documents')
    .upload(storagePath, fileBuffer, {
      contentType: data.mime_type,
      upsert: false,
    });

  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    return null;
  }

  // Record metadata in database
  const { data: doc, error: dbError } = await supabase
    .from('application_documents')
    .insert({
      application_id: data.application_id,
      member_id: data.member_id || null,
      document_type: data.document_type,
      file_name: data.file_name,
      mime_type: data.mime_type,
      file_size_bytes: fileBuffer.length,
      storage_bucket: 'application-documents',
      storage_path: storagePath,
    })
    .select()
    .single();

  if (dbError) {
    console.error('Error recording document metadata:', dbError);
    // Try to clean up the uploaded file
    await supabase.storage.from('application-documents').remove([storagePath]);
    return null;
  }

  return { document_id: doc.id };
}

/**
 * Gets a signed URL for viewing a document (15-minute expiry).
 * Server-side only, admin access.
 */
export async function getDocumentSignedUrl(storagePath: string): Promise<string | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase.storage
    .from('application-documents')
    .createSignedUrl(storagePath, 900); // 15 minutes

  if (error) {
    console.error('Error creating signed URL:', error);
    return null;
  }

  return data.signedUrl;
}

/**
 * Gets all applications with optional filters.
 */
export async function getApplications(filters?: {
  type?: ApplicationType;
  status?: ApplicationStatus;
  member_id?: string;
  limit?: number;
  offset?: number;
}): Promise<Application[]> {
  const supabase = createServiceClient();
  if (!supabase) return [];

  let query = supabase
    .from('applications')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (filters?.type) {
    query = query.eq('application_type', filters.type);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.member_id) {
    query = query.eq('member_id', filters.member_id);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching applications:', error);
    return [];
  }

  return data || [];
}

/**
 * Gets a single application with member and documents.
 */
export async function getApplicationById(
  applicationId: string,
): Promise<{
  application: Application;
  member: Member | null;
  documents: ApplicationDocument[];
  history: ApplicationStatusHistory[];
} | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data: app, error: appError } = await supabase
    .from('applications')
    .select('*')
    .eq('id', applicationId)
    .single();

  if (appError || !app) {
    return null;
  }

  // Get member if linked
  let member: Member | null = null;
  if (app.member_id) {
    const { data: memberData } = await supabase
      .from('members')
      .select('*')
      .eq('id', app.member_id)
      .single();
    member = memberData;
  }

  // Get documents
  const { data: documents } = await supabase
    .from('application_documents')
    .select('*')
    .eq('application_id', applicationId)
    .order('uploaded_at', { ascending: false });

  // Get history
  const { data: history } = await supabase
    .from('application_status_history')
    .select('*')
    .eq('application_id', applicationId)
    .order('changed_at', { ascending: false });

  return {
    application: app,
    member,
    documents: documents || [],
    history: history || [],
  };
}

/**
 * Updates application status and records in history.
 */
export async function updateApplicationStatus(
  applicationId: string,
  newStatus: ApplicationStatus,
  options?: {
    changed_by_type?: 'admin' | 'system' | 'member';
    changed_by_id?: string;
    changed_by_name?: string;
    note?: string;
    admin_notes?: string;
  },
): Promise<boolean> {
  const supabase = createServiceClient();
  if (!supabase) return false;

  // Get current status
  const { data: current } = await supabase
    .from('applications')
    .select('status, id')
    .eq('id', applicationId)
    .single();

  if (!current) {
    return false;
  }

  const oldStatus = current.status;

  // Update application
  const updateData: Partial<Application> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (options?.admin_notes !== undefined) {
    updateData.admin_notes = options.admin_notes;
  }

  if (newStatus === 'approved' || newStatus === 'rejected') {
    updateData.reviewed_at = new Date().toISOString();
    updateData.reviewed_by = options?.changed_by_id || null;
  }

  const { error: updateError } = await supabase
    .from('applications')
    .update(updateData)
    .eq('id', applicationId);

  if (updateError) {
    console.error('Error updating application status:', updateError);
    return false;
  }

  // Record in history with admin user tracking
  const historyData: {
    application_id: string;
    from_status: ApplicationStatus | null;
    to_status: ApplicationStatus;
    changed_by_type: 'admin' | 'system' | 'member';
    changed_by_id: string | null;
    changed_by_name: string | null;
    note: string | null;
    admin_user_id?: string | null;
    admin_email?: string | null;
  } = {
    application_id: applicationId,
    from_status: oldStatus,
    to_status: newStatus,
    changed_by_type: options?.changed_by_type || 'system',
    changed_by_id: options?.changed_by_id || null,
    changed_by_name: options?.changed_by_name || null,
    note: options?.note || null,
  };

  // If changed by admin, record admin_user_id and admin_email
  if (options?.changed_by_type === 'admin' && options?.changed_by_id) {
    historyData.admin_user_id = options.changed_by_id;
    historyData.admin_email = options.changed_by_name || null;
  }

  await supabase.from('application_status_history').insert(historyData);

  return true;
}

/**
 * Gets all members with optional filters.
 */
export async function getMembers(filters?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<Member[]> {
  const supabase = createServiceClient();
  if (!supabase) return [];

  let query = supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('member_status', filters.status);
  }

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    query = query.or(
      `full_name.ilike.%${search}%,email.ilike.%${search}%,service_number.ilike.%${search}%`,
    );
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching members:', error);
    return [];
  }

  return data || [];
}

/**
 * Gets a member by ID with all their applications.
 */
export async function getMemberWithApplications(
  memberId: string,
): Promise<{ member: Member; applications: Application[] } | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('*')
    .eq('id', memberId)
    .single();

  if (memberError || !member) {
    return null;
  }

  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .eq('member_id', memberId)
    .order('submitted_at', { ascending: false });

  return {
    member,
    applications: applications || [],
  };
}
