// Generated types for Supabase tables

export type ApplicationType =
  | 'membership_signup'
  | 'formal_membership'
  | 'dental_optical_grant'
  | 'legal_aid_application'
  | 'merit_loan_application'
  | 'retirement_benefit_application'
  | 'salary_deduction'
  | 'merit_salary_deduction'
  | 'hotel_booking';

export type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'cancelled';

export type MemberStatus = 'pending' | 'active' | 'suspended' | 'retired';

export type ChangedByType = 'system' | 'admin' | 'member';

export interface Member {
  id: string;
  email: string;
  service_number: string | null;
  full_name: string;
  rank: string | null;
  phone: string | null;
  phone_country_code: string | null;
  phone_home: string | null;
  phone_work: string | null;
  address: string | null;
  department_division: string | null;
  section_station: string | null;
  date_of_birth: string | null;
  sex: 'male' | 'female' | null;
  age: number | null;
  username: string | null;
  password_hash: string | null;
  financial_member: 'yes' | 'no' | null;
  date_of_enlistment: string | null;
  member_status: MemberStatus;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  member_id: string | null;
  application_type: ApplicationType;
  status: ApplicationStatus;
  application_data: Record<string, unknown>;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  legacy_redis_id: string | null;
  submitted_at: string;
  updated_at: string;
}

export interface ApplicationDocument {
  id: string;
  application_id: string;
  member_id: string | null;
  document_type: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number;
  storage_bucket: string;
  storage_path: string;
  uploaded_at: string;
}

export interface ApplicationStatusHistory {
  id: string;
  application_id: string;
  from_status: ApplicationStatus | null;
  to_status: ApplicationStatus;
  changed_by_type: ChangedByType;
  changed_by_id: string | null;
  changed_by_name: string | null;
  note: string | null;
  changed_at: string;
  metadata: Record<string, unknown>;
}

// Type-specific application data interfaces
export interface MembershipSignupData {
  regimentalNumber: string;
  rank: string;
  departmentDivision?: string;
  sectionStation?: string;
  address: string;
  phoneCountryCode: string;
  phoneHome?: string;
  phoneWork?: string;
  phone: string;
  age?: string;
  sex?: 'male' | 'female';
  dateOfBirth?: string;
  dateOfEnlistment?: string;
  financialMember: 'yes' | 'no';
  declarationAccepted?: boolean;
  applicationDateSigned?: string;
  beneficiaryFullName?: string;
  beneficiaryRelationship?: string;
  beneficiaryIdNumber?: string;
  witnessName?: string;
}

export interface FormalMembershipData {
  stationDivision: string;
  nisNumber: string;
  bankName: string;
  accountNumber: string;
  salaryDeductionApproved: boolean;
  privacyPolicyConsent: boolean;
}

export type RoomCategoryType = 'PRESIDENTIAL_SUITE' | 'SINGLE_OCCUPANCY' | 'DOUBLE_OCCUPANCY';

export interface RoomLineItem {
  roomCategory: RoomCategoryType;
  roomCount: number;
}

export interface GuestMealSelection {
  guestIndex: number;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

export interface HotelBookingData {
  guestName: string;
  email: string;
  phone: string;
  // Multi-room support: array of room line items
  rooms: RoomLineItem[];
  // Legacy single-room fields (for backward compatibility)
  roomCategory?: RoomCategoryType;
  roomCount?: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  // Per-guest meal selections (new format)
  guestMealSelections?: GuestMealSelection[];
  // Legacy aggregate meal counts (for backward compatibility)
  meals: {
    Breakfast: number;
    Lunch: number;
    Dinner: number;
  };
  specialRequests?: string;
}

export interface DentalOpticalGrantData {
  regimentalNumber: string;
  rank: string;
  departmentDivision: string;
  sectionStation: string;
  memberCategory: 'srp' | 'municipal';
  address: string;
  email: string;
  phoneCountryCode: string;
  phoneHome?: string;
  phoneWork?: string;
  phone: string;
  age: string;
  sex: 'male' | 'female';
  grantType: 'dental' | 'optical' | 'both';
  grantAppliedFor: string[];
  previousGrant?: string;
  documentsList: string;
  applicantDateSigned: string;
}

export interface BenefitApplicationData {
  regimentalNumber: string;
  rank: string;
  departmentDivision: string;
  sectionStation: string;
  address: string;
  email: string;
  phoneCountryCode: string;
  phone: string;
  // Additional fields vary by benefit type
  [key: string]: unknown;
}
