import { ColumnSettings } from 'handsontable/settings';
import { environment } from '../../environments/environment';
import { AdminUser } from './types';

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
  UPLOAD_TELECALLER_BOOKINGS: API_URL + '/admin/telecallers/bookings/upload',
  UPDATE_TELECALLER_BOOKINGS: API_URL + '/admin/telecallers/bookings/update',
  UPDATE_TELECALLER_BOOKINGS_ACTIVATION_STATUS: API_URL + '/admin/telecallers/bookings/activation',
  ASSIGN_TELECALLER_BOOKINGS: API_URL + '/admin/telecallers/bookings/assign',
};

export const TELECALLER_BOOKINGS_ADMIN_HOT_COLUMNS: ColumnSettings[] = [
  { data: '_id', title: '_Id', width: 0 },
  { data: 'isDeactivated', title: 'Deactivated', width: 0 },
  { title: 'Select', type: 'checkbox', data: 'select', width: 85 },
  { data: 'refNo', title: 'Ref no', width: 95 },
  { data: 'studentName', title: 'Student name', width: 173 },
  { data: 'parentName', title: 'Parent name', width: 196 },
  {
    data: 'assignedTo',
    title: 'Assigned To',
    valueGetter(value, row, column, cellProperties) {
      return value && Array.isArray(value) ? value.map((user) => user.name).join(', ') : '';
    },
    width: 283,
    readOnly: true,
  },
  { data: 'fatherOccupation', title: 'Father occupation', width: 153 },
  { data: 'mobile', title: 'Mobile', width: 100 },
  { data: 'alternateMobile', title: 'Alternate mobile', width: 145 },
  { data: 'school', title: 'School', width: 253 },
  { data: 'board', title: 'Board', width: 85 },
  { data: 'schoolType', title: 'School Type', width: 125 },
  {
    data: 'subjects',
    title: 'Subjects',
    valueFormatter: (value: string[]) => {
      return value && Array.isArray(value) ? value.join(', ') : '';
    },
    width: 283,
  },
  { data: 'community', title: 'Community', width: 125 },
  { data: 'area', title: 'Area', width: 80 },
  { data: 'district', title: 'District', width: 100 },
  { data: 'domainInterest', title: 'Domain interest', width: 155 },
  { data: 'courseInterest', title: 'Course interest', width: 155 },
  {
    data: 'dataValidationStatus',
    title: 'Data validation status',
    type: 'dropdown',
    allowInvalid: false,
    allowEmpty: false,
    source: ['correct', 'incorrect', 'partial'],
    renderer: (...renderObj) => {
      const [, td, , , , value] = renderObj;
      // Always reset before re-applying so stale classes don't accumulate on data refresh.
      td.classList.remove(
        'bg-green-200',
        '!text-green-900',
        'bg-red-200',
        '!text-red-900',
        'bg-amber-200',
        '!text-amber-900',
      );
      if (value === 'correct') td.classList.add('!bg-green-200', '!text-green-900');
      if (value === 'incorrect') td.classList.add('!bg-red-200', '!text-red-900');
      if (value === 'partial') td.classList.add('!bg-amber-200', '!text-amber-900');
      td.textContent = value ?? '';
    },
    width: 190,
  },
  { data: 'remarks', title: 'Remarks', width: 100 },
  {
    data: 'createdAt',
    title: 'Created at',
    readOnly: true,
    width: 150,
  },
  {
    data: 'updatedAt',
    title: 'Updated at',
    readOnly: true,
    width: 150,
  },
];
