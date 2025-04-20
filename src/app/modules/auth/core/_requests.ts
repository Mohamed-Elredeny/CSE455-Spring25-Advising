import axios from "axios";
import { AuthModel, UserModel } from "./_models";

const API_URL = import.meta.env.VITE_APP_API_URL;
const APP_ENV = import.meta.env.VITE_APP_ENV;

export const GET_USER_BY_ACCESSTOKEN_URL = `${API_URL}/api/auth/token/refresh/`;
export const LOGIN_URL = `${API_URL}/api/auth/login/`;
export const REGISTER_URL = `${API_URL}/api/auth/register/`;
export const REQUEST_PASSWORD_URL = `${API_URL}/api/auth/forgot-password/`;

// Mock user for development
const MOCK_USER: UserModel = {
  id: 1,
  username: 'admin',
  password: undefined,
  email: 'admin@demo.com',
  first_name: 'Admin',
  last_name: 'Demo',
  fullname: 'Admin Demo',
  occupation: 'Administrator',
  companyName: 'CSE 455',
  phone: '+1234567890',
  roles: [1],
  pic: '/media/avatars/300-1.jpg',
  language: 'en',
  timeZone: 'America/Los_Angeles',
  communication: {
    email: true,
    sms: true,
    phone: true
  },
  emailSettings: {
    emailNotification: true,
    sendCopyToPersonalEmail: true,
    activityRelatesEmail: {
      youHaveNewNotifications: true,
      youAreSentADirectMessage: true,
      someoneAddsYouAsAsAConnection: true,
      uponNewOrder: true,
      newMembershipApproval: true,
      memberRegistration: true
    },
    updatesFromKeenthemes: {
      newsAboutKeenthemesProductsAndFeatureUpdates: true,
      tipsOnGettingMoreOutOfKeen: true,
      thingsYouMissedSindeYouLastLoggedIntoKeen: true,
      newsAboutStartOnPartnerProductsAndOtherServices: true,
      tipsOnStartBusinessProducts: true
    }
  }
};

const isDevelopment = () => APP_ENV === 'development';

// Server should return AuthModel
export function login(email: string, password: string) {
  // Development bypass for admin@demo.com/admin
  if (isDevelopment() && email === 'admin@demo.com' && password === 'admin') {
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
  // Development bypass for registration
  if (isDevelopment()) {
    return Promise.resolve({
      data: {
        api_token: 'dev-bypass-token',
        refreshToken: 'dev-bypass-refresh-token'
      } as AuthModel
    });
  }

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
  // Development bypass for password reset
  if (isDevelopment()) {
    return Promise.resolve({ data: { result: true } });
  }

  return axios.post<{ result: boolean }>(REQUEST_PASSWORD_URL, {
    email,
  });
}

export function getUserByToken(token: string) {
  // Development bypass for getting user by token
  if (isDevelopment() && token === 'dev-bypass-token') {
    return Promise.resolve({ data: MOCK_USER });
  }

  return axios.post<UserModel>(GET_USER_BY_ACCESSTOKEN_URL, {
    api_token: token,
  });
}
