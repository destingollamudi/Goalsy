import { auth } from '../config/firebase';
import { IAuthService } from '../interfaces/IUserService';

export class FirebaseAuthService implements IAuthService {
  async verifyToken(token: string): Promise<{ uid: string; email?: string; emailVerified: boolean }> {
    const decodedToken = await auth.verifyIdToken(token);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified ?? false
    };
  }

  async createUser(email: string, password: string): Promise<string> {
    const userRecord = await auth.createUser({
      email,
      password,
      emailVerified: false
    });
    return userRecord.uid;
  }

  async sendEmailVerification(uid: string): Promise<void> {
    const user = await auth.getUser(uid);
    const link = await auth.generateEmailVerificationLink(user.email!);
    console.log(`Email verification link for ${user.email}: ${link}`);
  }
}