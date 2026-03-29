export interface GenericResponse<T> {
  message?: string;
  data?: T;
  page?: number;
  limit?: number;
  totalPages?: number;
  totalDocs?: number;
  error?: string;
  totalPagesForFilter?: number;
  totalDocsForFilter?: number;
}

export interface FetchState<T> {
  isLoading: boolean;
  error: string | object | null;
  data: GenericResponse<T> | null;
}

export interface ErrorFnCallback {
  (error: string): void;
}

export interface LoginPayload {
  userName: string;
  password: string;
}

export interface CreateTelecallerPayload {
  name: string;
  userName: string;
  email: string;
  mobile: string;
  password: string;
}

export type TelecallerAssignmentUpdate = { _id: string } & Partial<
  Record<keyof TelecallerAssignment, string>
>;

type AdminUserRoles = 'admin' | 'superadmin' | 'telecaller' | 'editor';

export interface LoginResponse {
  token: string;
  userName: string;
  name: string;
  role: AdminUserRoles;
  id: string;
}

interface MongooseSchema {
  _id: string;
}

interface Timestamps extends MongooseSchema {
  createdAt: string;
  updatedAt: string;
}

export interface User extends Timestamps {
  name?: string;
  mobile: string;
  isMobileVerified: boolean;
  lastOTP: string;
  firstName?: string;
  lastName?: string;
  gender?: 'male' | 'female' | 'other';
  email?: string;
  registerNo?: string;
  neetRegNo?: string;
  TNEAApplicationNo?: string;
  AIR?: number;
  emailVerified: boolean;
  category?: string;
  group?: string;
  boardOfStudy?: string;
  district?: string;
  pincode?: string;
  dob?: Date;
  imageURL?: string;
  cutoff: [
    {
      physics: number;
      chemistry: number;
      maths: number;
    },
  ];
  NEETScore: [
    {
      score: number;
      minRank: number;
      maxRank: number;
    },
  ];
  userPlan: 'default' | 'basic-mentorship' | 'premium';
}

export interface Announcement extends Timestamps {
  title: string;
  description: string;
  image: string;
  link: string;
  type: 'engg' | 'medical' | 'josaa';
  startDate: string;
  endDate: string;
}

export interface Blog extends Timestamps {
  title: string;
  content: string;
  thumbnailUrl: string;
  createdBy: {
    _id: string;
    name: string;
  } & MongooseSchema;
  slug: string;
  createdAt: string;
}

export interface HomeData extends Timestamps {
  totalUsers: number;
  totalAdmins: number;
  totalAnnouncements: number;
  totalAdmissions: number;
  totalColleges: number;
  totalBlogs: number;
  signUpTrend: {
    labels: string[];
    datasets: {
      label: string;
      data: any[];
      fill: boolean;
      borderColor: string;
      tension: number;
    }[];
  };
}

export interface SlotBooking extends Timestamps {
  name: string;
  mobile: string;
  message: string;
  attendedBy:
    | ({
        _id: string;
        name: string;
      } & MongooseSchema)
    | null;
  attendedAt: string;
}

export interface AdminUser<T extends AdminUserRoles> extends Timestamps {
  name: string;
  username: string;
  mobile?: string;
  email?: string;
  role: T;
  isMobileVerified: boolean;
  district?: string;
  deactivatedAt?: string;
  deactivatedBy?: Pick<AdminUser<'admin' | 'superadmin'>, '_id' | 'name'>;
}

export interface TelecallerAssignment extends Timestamps {
  refNo: string;
  studentName: string;
  parentName: string;
  mobile: string;
  alternateMobile: string;
  email: string;
  school: string;
  subjects: string[];
  dataValidationStatus: 'correct' | 'incorrect' | 'partial';
  dataStatus: string;
  board: string;
  schoolType: string;
  firstGraduate: boolean;
  community: string;
  area: string;
  district: string;
  domainInterest: string;
  courseInterest: string;
  remarks: string;
  fatherOccupation: string;
  assignedTo: AdminUser<'telecaller'>[] | null;
  assignedAt: string;
  isAdmissionComplete: boolean;
  isDeactivated: boolean;
}

export interface TelecallerServiceHistory extends Timestamps {
  college: string;
  bookingId: Pick<TelecallerAssignment, '_id' | 'studentName' | 'mobile'>;
  remarks: string;
  calledDate: string;
  followUpDate: string;
  attendedBy: AdminUser<'telecaller'> | null;
  attendedAt: string;
  extraFields: Record<string, string>;
}

export interface FollowUpFormPayload {
  college: string;
  bookingId: string[];
  remarks: string;
  calledDate: string;
  followUpDate: string | null;
  extraFields: Record<string, string>;
}

export interface Referral extends Timestamps {
  name: string;
  mobile: string;
  email: string;
  district: string;
  area: string;
  referredBy: Pick<AdminUser<'admin' | 'superadmin'>, '_id' | 'name'>;
}
