import { User, CreateUserInput } from '../types/User';

export interface IUserService {
  isUsernameAvailable(username: string): Promise<boolean>;
  createUser(uid: string, userData: CreateUserInput): Promise<User>;
  getUserByUid(uid: string): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  updateProfile(uid: string, updates: Partial<User>): Promise<User>;
  searchUsers(query: string): Promise<User[]>;
}

export interface IAuthService {
  verifyToken(token: string): Promise<{ uid: string; email?: string; emailVerified: boolean }>;
  createUser(email: string, password: string): Promise<string>; // returns uid
  sendEmailVerification(uid: string): Promise<void>;
}