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
    UPDATE_BLOG: API_URL + '/admin/blogs/update',
    DELETE_BLOG: API_URL + '/admin/blogs/delete'
};