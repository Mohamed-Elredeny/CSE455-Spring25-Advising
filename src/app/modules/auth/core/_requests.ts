import axios from "axios";
import { AuthModel, UserModel } from "./_models";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const GET_USER_BY_ACCESSTOKEN_URL = `${API_URL}/api/auth/token/refresh/`;
export const LOGIN_URL = `${API_URL}/api/auth/login/`;
export const REGISTER_URL = `${API_URL}/api/auth/register/`;
export const REQUEST_PASSWORD_URL = `${API_URL}/api/auth/password/reset/`;

// Server should return AuthModel
export function login(email: string, password: string) {
  // Development bypass for admin@demo.com/admin
  if (import.meta.env.DEV && email === 'admin@demo.com' && password === 'admin') {
    return Promise.resolve({
      data: {
        api_token: 'dev-bypass-token',
        refreshToken: 'dev-bypass-refresh-token'
      } as AuthModel
    });
  }

  return axios.post<AuthModel>(LOGIN_URL, {
    email,
    password,
  });
}

// Server should return AuthModel
export function register(
  email: string,
  firstname: string,
  lastname: string,
  password: string,
  password_confirmation: string
) {
  return axios.post(REGISTER_URL, {
    email,
    first_name: firstname,
    last_name: lastname,
    password,
    password_confirmation,
  });
}

// Server should return object => { result: boolean } (Is Email in DB)
export function requestPassword(email: string) {
  return axios.post<{ result: boolean }>(REQUEST_PASSWORD_URL, {
    email,
  });
}

export function getUserByToken(token: string) {
  return axios.post<UserModel>(GET_USER_BY_ACCESSTOKEN_URL, {
    api_token: token,
  });
}
