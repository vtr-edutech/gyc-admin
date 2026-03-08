import { environment } from '../../environments/environment';

const API_URL = environment.apiUrl;

export const API = {
  SIGN_IN: API_URL + '/admin/login',
  AUTH: API_URL + '/admin/me',
  GET_USERS: API_URL + '/admin/users',
  DOWNLOAD_USERS: API_URL + '/admin/users/download',
  GET_ANNOUNCEMENTS: API_URL + '/announcements',
  CREATE_ANNOUNCEMENT: API_URL + '/admin/announcements/new',
  UPDATE_ANNOUNCEMENT: API_URL + '/admin/announcements/update',
  DELETE_ANNOUNCEMENT: API_URL + '/admin/announcements/delete',
  GET_BLOGS: API_URL + '/blogs',
  CREATE_BLOG: API_URL + '/admin/blogs/new',
  GET_BLOG: (id: string) => API_URL + '/blogs/' + id,
  UPDATE_BLOG: (id: string) => API_URL + '/admin/blogs/' + id + '/edit',
  DELETE_BLOG: (id: string) => API_URL + '/admin/blogs/' + id + '/delete',
  HOME: API_URL + '/admin/dashboard',
  GET_SLOT_BOOKINGS: API_URL + '/admin/slot-bookings',
  MARK_ATTENDANCE_SLOT_BOOKING: (id: string) =>
    API_URL + '/admin/slot-bookings/' + id + '/attendance',
  GET_TELECALLERS: API_URL + '/admin/telecallers',
  CREATE_TELECALLER: API_URL + '/admin/telecallers/new',
  UPDATE_TELECALLER: (id: string) => API_URL + '/admin/telecallers/' + id + '/edit',
  GET_TELECALLER_BOOKINGS: API_URL + '/admin/telecallers/bookings',
};

export const TELECALLER_BOOKINGS_ADMIN_HOT_COLUMNS = [
  { key: '_id', columnName: '_Id', isVisible: false },
  { key: 'refNo', columnName: 'Ref no' },
  { key: 'studentName', columnName: 'Student name' },
  { key: 'parentName', columnName: 'Parent name' },
  { key: 'fatherOccupation', columnName: 'Father occupation' },
  { key: 'mobile', columnName: 'Mobile' },
  { key: 'alternateMobile', columnName: 'Alternate mobile' },
  { key: 'school', columnName: 'School' },
  { key: 'board', columnName: 'Board' },
  { key: 'schoolType', columnName: 'School Type' },
  { key: 'subjects', columnName: 'Subjects' },
  { key: 'community', columnName: 'Community' },
  { key: 'area', columnName: 'Area' },
  { key: 'district', columnName: 'District' },
  { key: 'domainInterest', columnName: 'Domain interest' },
  { key: 'courseInterest', columnName: 'Course interest' },
  { key: 'dataValidationStatus', columnName: 'Data validation status' },
  { key: 'remarks', columnName: 'Remarks' },
  { key: 'createdAt', columnName: 'Created at' },
  { key: 'updatedAt', columnName: 'Updated at' },
];
