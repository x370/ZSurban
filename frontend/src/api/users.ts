import { getApiBaseUrl } from './config';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Public: Update user profile (name/password).
 */
export const updateUserProfile = async (
  id: string,
  payload: { name?: string; password?: string }
): Promise<any> => {
  const res = await fetch(`${getApiBaseUrl()}/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update profile');
  }
  return res.json();
};

/**
 * Admin: Fetch all users.
 */
export const fetchUsersAdmin = async (): Promise<AdminUser[]> => {
  const res = await fetch(`${getApiBaseUrl()}/users`);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
};

/**
 * Admin: Update user details or role.
 */
export const updateUserAdmin = async (
  id: string,
  payload: { name?: string; password?: string; role?: string }
): Promise<AdminUser> => {
  const res = await fetch(`${getApiBaseUrl()}/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update profile info');
  }
  return res.json();
};
