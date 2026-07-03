export interface UserProfile {
  _id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  token: string | null;
}
