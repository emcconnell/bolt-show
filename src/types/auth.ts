export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  passwordHash: string;
  role: 'admin' | 'user' | 'business';
  isTestAccount?: boolean;
  status?: 'pending' | 'active';
  verificationToken?: string;
  createdAt?: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}