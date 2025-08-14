export type User ={
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'student' | 'institution_admin' | 'admin' | 'institution';
  avatarUrl: string;
  refreshToken?: string; // Optional for storing refresh token
  createdAt: Date,
  updatedAt: Date
}