import { environment } from "../../environments/environment";

const API_URL = environment.apiUrl;

export const API = { SIGN_IN: API_URL + '/admin/login', AUTH: API_URL + '/admin/me', USERS: API_URL + '/admin/users' };