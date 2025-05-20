import axios from "axios";
import { AuthModel, UserModel } from "./_models";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const GET_USER_BY_ACCESSTOKEN_URL = `${API_URL}/api/auth/token/refresh/`;
export const LOGIN_URL = `${API_URL}/api/auth/login/`;
export const REGISTER_URL = `${API_URL}/api/auth/register/`;
export const REQUEST_PASSWORD_URL = `${API_URL}/api/auth/password/reset/`;
export const RESET_PASSWORD_URL = `${API_URL}/api/auth/password/reset/confirm/`;
export const GOOGLE_LOGIN_CALLBACK_URL = `${API_URL}/accounts/google/login/callback/`;
export const GOOGLE_LOGIN_URL = `${API_URL}/accounts/google/login/`;

// Server should return AuthModel
export function login(email: string, password: string) {
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

// Server should return object => { result: boolean } (Password reset confirmation)
export function resetPassword({ uid, token, new_password }: { uid: string; token: string; new_password: string }) {
  return axios.post<{ result: boolean }>(RESET_PASSWORD_URL, {
    uid,
    token,
    new_password,
  });
}

export function handleGoogleLoginCallback(code: string) {
  return axios.get<AuthModel>(GOOGLE_LOGIN_CALLBACK_URL, {
    params: {
      code,
    },
  });
}


// Initiate Google OAuth flow

export function googleLogin(idToken: string) {
  return axios.post<AuthModel>(GOOGLE_LOGIN_URL, {
    id_token: idToken,
  });
}