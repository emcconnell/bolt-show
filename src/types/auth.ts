export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: 'admin' | 'user' | 'business';
  status?: 'pending' | 'active';
}

export interface AuthResponse {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  };
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}