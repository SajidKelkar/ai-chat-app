import { apiRequest } from './client';

export interface SignupRequest {
  name: string;
  age: number;
  email: string;
  password: string;
}

export interface UserProfile {
  _id?: string;
  id?: string;
  name?: string;
  age?: number;
  email?: string;
}

export function signup(data: SignupRequest) {
  return apiRequest('/api/user/signup', {
    method: 'POST',
    body: data,
  });
}

export function login(email: string, password: string) {
  return apiRequest('/api/user/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function logout() {
  return apiRequest('/api/user/logout', {
    method: 'POST',
  });
}

export function getProfile() {
  return apiRequest<UserProfile | { user: UserProfile }>('/api/user/profile');
}

export function deleteAccount() {
  return apiRequest('/api/user/delete', {
    method: 'POST',
  });
}

export function normalizeProfile(data: unknown): UserProfile {
  if (!data) return {};
  if (typeof data === 'object' && 'user' in data && data.user) {
    return (data as { user: UserProfile }).user;
  }
  return data as UserProfile;
}
