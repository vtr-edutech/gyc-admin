import { environment } from "../../environments/environment";

const API_URL = environment.apiUrl;

export const API = {
    SIGN_IN: API_URL + '/admin/login',
    AUTH: API_URL + '/admin/me',
    GET_USERS: API_URL + '/admin/users',
    GET_ANNOUNCEMENTS: API_URL + '/announcements',
    CREATE_ANNOUNCEMENT: API_URL + '/admin/announcements/new'
};