import axiosPublic from './axios';
import axiosPrivate from './axiosPrivate';


export interface SignUpPayload {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
}

export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  organization?: string;
  role?: string;
}

export interface AddUserPayload extends SignUpPayload {
  role: string;
  organization: string;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}

export const signUpApi = async (payload: SignUpPayload) => {
  const response = await axiosPublic.post('/api/v1/signup/', payload);
  return response.data;
};

export interface LoginPayload {
  username: string;
  password: string;
}

export const loginApi = async (payload: LoginPayload) => {
  const response = await axiosPublic.post('/api/v1/token/', payload);
  return response.data; 
};

export const logoutApi = async () => {
  await axiosPrivate.post('/auth/logout');
};

export const getAllUsersApi = async () => {
  const response = await axiosPrivate.get('/api/v1/users/');
  return response.data; 
};

export const getCurrentUserApi = async () => {
  const response = await axiosPrivate.get('/api/v1/user/me/')
  return response.data
}

export const changePasswordApi = async (payload: ChangePasswordPayload) => {
  const response = await axiosPrivate.post('/api/v1/users/change_password/', payload);
  return response.data;
};

export const createUserApi = async (payload: AddUserPayload) => {
  const response = await axiosPrivate.post('/api/v1/users/', payload);
  return response.data;
};

export const deleteUserApi = async (userId: number | string) => {
  const response = await axiosPrivate.delete(`/api/v1/users/${userId}/`);
  return response.data;
};

export const getUserDetailApi = async (userId: number | string) => {
  const response = await axiosPrivate.get(`/api/v1/users/${userId}/`);
  return response.data;
};

export const updateUserApi = async (userId: number | string, payload: UpdateUserPayload) => {
  const response = await axiosPrivate.patch(`/api/v1/users/${userId}/`, payload);
  return response.data;
};