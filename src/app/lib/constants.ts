import { environment } from "../../environments/environment";

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
    UPDATE_SLOT_BOOKING: (id: string) => API_URL + '/admin/slot-bookings/' + id + '/edit',
};